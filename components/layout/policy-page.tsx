export function PolicyPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">{title}</h1>
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/6 p-8">
        <p className="leading-8 text-slate-300">{body}</p>
      </div>
    </div>
  );
}
