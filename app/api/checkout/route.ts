import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { productIds } = (await request.json()) as { productIds: string[] };
  const products = await getDb().product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (!products.length) return NextResponse.json({ error: "No products selected" }, { status: 400 });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: products.map((product) => ({
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        product_data: {
          name: product.title,
          description: product.description,
        },
      },
      quantity: 1,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    metadata: {
      userId: user.id,
      productIds: products.map((product) => product.id).join(","),
    },
  });

  await getDb().order.create({
    data: {
      userId: user.id,
      stripeSessionId: session.id,
      total: products.reduce((sum, product) => sum + product.price, 0),
      status: "PENDING",
      items: {
        create: products.map((product) => ({
          productId: product.id,
          price: product.price,
        })),
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
