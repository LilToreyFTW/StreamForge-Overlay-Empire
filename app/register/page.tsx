import { registerAction } from "@/app/server-actions";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <form action={registerAction} className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
        <h1 className="text-3xl font-semibold text-white">Create account</h1>
        <div className="mt-6 grid gap-4">
          <input name="name" required placeholder="Name" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="email" type="email" required placeholder="Email" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="password" type="password" required placeholder="Password" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <button className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Create account</button>
        </div>
      </form>
    </div>
  );
}
