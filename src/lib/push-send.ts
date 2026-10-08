import webpush from "web-push";

export const BATCH_SIZE = 25;

export interface SendPushResult {
  sent: number;
  failed: number;
  removed: number;
}

export async function sendPushToSubscriptions(
  subscriptions: PushSubscription[],
  payload: string,
  deleteSubscription: (endpoint: string) => Promise<void>
): Promise<SendPushResult> {
  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (let index = 0; index < subscriptions.length; index += BATCH_SIZE) {
    const batch = subscriptions.slice(index, index + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload);
          return "sent" as const;
        } catch (error) {
          const statusCode =
            error && typeof error === "object" && "statusCode" in error
              ? (error as { statusCode?: unknown }).statusCode
              : undefined;

          if (statusCode === 404 || statusCode === 410) {
            await deleteSubscription(subscription.endpoint);
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

  return { sent, failed, removed };
}