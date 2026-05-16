import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { getRazorpayClient } from "@/lib/razorpay-server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payments not configured on this server." },
        { status: 503 },
      );
    }

    // Read plan from request body
    let plan: "monthly" | "yearly" = "yearly";
    try {
      const body = await req.json();
      if (body.plan === "monthly" || body.plan === "yearly") {
        plan = body.plan;
      }
    } catch {
      // default to yearly if no body
    }

    const PRICES: Record<string, number> = {
      yearly: Number(process.env.RAZORPAY_AMOUNT_YEARLY_PAISE ?? "69900"),
      monthly: Number(process.env.RAZORPAY_AMOUNT_MONTHLY_PAISE ?? "9900"),
    };

    const amount = PRICES[plan];
    if (!Number.isFinite(amount) || amount < 100) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 500 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json({ error: "Missing Razorpay key." }, { status: 503 });
    }

    const uid = session.user.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 14);
    const receipt = `n_${uid}_${Date.now().toString(36)}`.slice(0, 39);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      notes: {
        userId: session.user.id,
        plan,
      },
    });

    // Record subscription as "created" for audit trail
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: order.id,
        status: "created",
        plan,
        amountPaise: amount,
        currency: "INR",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      plan,
    });
  } catch (error) {
    console.error("[payment/order]", error);
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }
}