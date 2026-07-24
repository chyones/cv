import Image from "next/image";
import { BackgroundGeometry } from "@/components/BackgroundGeometry";
import { UploadForm } from "@/components/UploadForm";

export default function Page() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-6">
      <BackgroundGeometry />

      <div className="w-full max-w-xl">
        <header className="mb-8 flex flex-col items-center text-center">
          {/* Official EL RACE logo — prominent, in a clean chip, floating over a breathing halo */}
          <div className="motion-logo relative mb-6">
            <span
              aria-hidden="true"
              className="logo-glow absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/25 blur-2xl"
            />
            <div className="motion-float mx-auto w-fit rounded-3xl bg-white p-5 shadow-logo ring-1 ring-navy/[0.06]">
              <Image
                src="/assets/elrace-logo.png"
                alt="EL RACE Contracting"
                width={128}
                height={128}
                priority
                className="h-[104px] w-[104px]"
              />
            </div>
          </div>

          <span
            className="rise text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-red"
            style={{ animationDelay: "0.08s" }}
          >
            Employee Records Update
          </span>
          <span
            className="eyebrow-rule mt-2 block h-px w-10 bg-gradient-to-r from-red to-navy"
            style={{ transformOrigin: "center" }}
          />

          <h1
            className="rise mt-4 text-[1.9rem] font-bold leading-tight tracking-tight text-navy sm:text-[2.25rem]"
            style={{ animationDelay: "0.16s" }}
          >
            Update Your CV
          </h1>
          <p
            className="rise mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink/70"
            style={{ animationDelay: "0.24s" }}
          >
            Keep your EL RACE employee record current. Submit your latest CV and our HR team will
            take care of the rest.
          </p>
        </header>

        <div className="rise" style={{ animationDelay: "0.32s" }}>
          <UploadForm />
        </div>

        <p
          className="rise mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink/50"
          style={{ animationDelay: "0.42s" }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ink/40" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Submitted securely over an encrypted connection and kept confidential.
        </p>
      </div>
    </main>
  );
}
