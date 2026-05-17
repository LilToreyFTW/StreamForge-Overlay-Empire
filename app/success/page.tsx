export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Payment received</h1>
      <p className="mt-4 text-slate-300">
        Your Stripe checkout completed successfully. Purchased downloads will appear in your
        library at /downloads as soon as the webhook confirms fulfillment.
      </p>
    </div>
  );
}
