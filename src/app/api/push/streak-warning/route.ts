import webpush from "web-push";
import { NextResponse } from "next/server";
import { deletePushSubscription } from "@/lib/push-db";
import { prisma } from "@/lib/db";
import { streakToday, addDays } from "@/features/streak/dates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "VAPID keys are not configured." }, { status: 500 });
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:you@example.com",
      publicKey,
      privateKey,
    );

    // Get all users with active streaks who haven't completed a quiz today
    const today = streakToday();
    const yesterday = addDays(today, -1);

    // Find users who have a streak (last completed date is today or yesterday)
    const usersWithActiveStreak = await prisma.userStreak.findMany({
      where: {
        OR: [
          { lastCompletedDate: { equals: today } },
          { lastCompletedDate: { equals: yesterday } }
        ]
      },
      select: {
        userId: true,
        currentStreak: true
      }
    });

    // Get subscriptions for these users
    const userIds = usersWithActiveStreak.map(u => u.userId);
    const userSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true
      }
    });

    // Create a map of userId to streak count for easy lookup
    const userStreakMap = new Map();
    for (const streak of usersWithActiveStreak) {
      userStreakMap.set(streak.userId, streak.currentStreak);
    }

    // Filter to only users who haven't completed a game today
    const usersToNotify = [];
    for (const userId of userIds) {
      const completedToday = await prisma.dailyGameProgress.findFirst({
        where: {
          userId,
          status: "completed",
          completedAt: {
            gte: new Date(today.getTime() - (330 * 60 * 1000)), // IST start of day
            lt: new Date(today.getTime() + (24 * 60 * 60 * 1000) - (330 * 60 * 1000)) // IST end of day
          }
        }
      });

      // If they haven't completed a game today, add them to the notification list
      if (!completedToday) {
        usersToNotify.push(userId);
      }
    }

    // Filter subscriptions to only those for users who need notifications
    const pushSubscriptions = userSubscriptions
      .filter(sub => usersToNotify.includes(sub.userId))
      .map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }));

    if (pushSubscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, removed: 0 });
    }

    // Send notifications in batches
    const BATCH_SIZE = 25;
    let sent = 0;
    let failed = 0;
    let removed = 0;

    for (let index = 0; index < pushSubscriptions.length; index += BATCH_SIZE) {
      const batch = pushSubscriptions.slice(index, index + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (subscription) => {
          // Find the user's streak count
          const userSub = await prisma.pushSubscription.findFirst({
            where: { endpoint: subscription.endpoint },
            select: { userId: true }
          });

          if (!userSub) {
            console.error("Could not find user for subscription:", subscription.endpoint);
            return "failed" as const;
          }

          const streakCount = userStreakMap.get(userSub.userId) ?? 0;
          const payload = JSON.stringify({
            title: `Your ${streakCount}-day streak ends tonight 🔥`,
            body: "Complete a quiz to keep your streak alive!",
            url: "/",
          });

          try {
            await webpush.sendNotification(subscription, payload);
            return "sent" as const;
          } catch (error) {
            const statusCode =
              error && typeof error === "object" && "statusCode" in error
                ? (error as { statusCode?: unknown }).statusCode
                : undefined;

            if (statusCode === 404 || statusCode === 410) {
              await deletePushSubscription(subscription.endpoint);
              return "removed" as const;
            }

            console.error("Push notification delivery failed:", error);
            return "failed" as const;
          }
        }),
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          if (result.value === "sent") sent += 1;
          else if (result.value === "removed") removed += 1;
          else failed += 1;
        } else {
          failed += 1;
          console.error("Push notification batch task failed:", result.reason);
        }
      }
    }

    return NextResponse.json({ sent, failed, removed });
  } catch (error) {
    console.error("Streak warning push notification job failed:", error);
    return NextResponse.json({ error: "Streak warning push notification job failed." }, { status: 500 });
  }
}