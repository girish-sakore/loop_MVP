import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getCachedAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getRazorpayClient } from "@/lib/razorpay-server";

function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  try {
    const session = await getCachedAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
    }

    let body: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string" ||
      !orderId.length ||
      !paymentId.length ||
      !signature.length
    ) {
      return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
    }

    // Verify signature
    const digest = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    if (!safeCompare(digest, signature.trim().toLowerCase())) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const rz = getRazorpayClient();
    if (!rz) {
      return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
    }

    // Verify order belongs to this user
    const order = await rz.orders.fetch(orderId);
    const noteUser =
      typeof order.notes?.userId === "string" ? order.notes.userId : "";
    if (noteUser !== session.user.id) {
      return NextResponse.json(
        { error: "Order does not belong to this account." },
        { status: 403 },
      );
    }

    // Determine plan and subscription dates
    const plan =
      typeof order.notes?.plan === "string" ? order.notes.plan : "yearly";
    const now = new Date();
    const subscriptionEnd = new Date(now);
    if (plan === "yearly") {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Update user and subscription record atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          isPremium: true,
          plan,
          subscriptionStart: now,
          subscriptionEnd,
        },
      }),
      prisma.subscription.update({
        where: { razorpayOrderId: orderId },
        data: {
          razorpayPaymentId: paymentId,
          status: "paid",
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[payment/verify]", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}