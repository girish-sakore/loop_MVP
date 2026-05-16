import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isPremium: true,
        plan: true,
        subscriptionStart: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Auto-expire if past subscriptionEnd
    const isActive =
      user.isPremium &&
      (user.subscriptionEnd === null ||
        new Date(user.subscriptionEnd) > new Date());

    return NextResponse.json({
      isPremium: isActive,
      plan: user.plan,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
    });
  } catch (error) {
    console.error("[payment/status]", error);
    return NextResponse.json({ error: "Could not fetch status." }, { status: 500 });
  }
}