import { prisma } from "@/lib/db";

export interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

export async function savePushSubscription(
  userId: string,
  subscription: StoredPushSubscription,
  userAgent?: string | null,
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ?? null,
    },
  });
}

export async function getAllPushSubscriptions(): Promise<StoredPushSubscription[]> {
  const subscriptions = await prisma.pushSubscription.findMany({
    select: { endpoint: true, p256dh: true, auth: true },
  });
  return subscriptions.map(({ endpoint, p256dh, auth }) => ({
    endpoint,
    keys: { p256dh, auth },
  }));
}

export async function getSubscriptionsByUser(userId: string): Promise<StoredPushSubscription[]> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  });
  return subscriptions.map(({ endpoint, p256dh, auth }) => ({
    endpoint,
    keys: { p256dh, auth },
  }));
}

export async function deletePushSubscription(endpoint: string, userId?: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, ...(userId ? { userId } : {}) },
  });
}
