import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const db = getDb();
    const order = await db.order.update({
      where: { stripeSessionId: session.id },
      data: { status: "PAID" },
      include: { items: true },
    });
    await Promise.all(
      order.items.map((item) =>
        db.download.upsert({
          where: { userId_productId_orderId: { userId: order.userId, productId: item.productId, orderId: order.id } },
          update: {},
          create: { userId: order.userId, productId: item.productId, orderId: order.id },
        }),
      ),
    );
    await Promise.all(
      order.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { totalSales: { increment: 1 } },
        }),
      ),
    );
  }

  return NextResponse.json({ received: true });
}
