import Image from "next/image";
import { BackgroundGeometry } from "@/components/BackgroundGeometry";
import { UploadForm } from "@/components/UploadForm";

export default function Page() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-surface px-4 py-12 sm:py-16">
      <BackgroundGeometry />

      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/assets/elrace-logo.png"
            alt="EL RACE Contracting"
            width={72}
            height={72}
            priority
            className="mb-6 h-[72px] w-[72px]"
          />

          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-red">
            Employee Records Update
          </span>
          <h1 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Update Your CV</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/70">
            Please submit your latest CV so your employee record reflects your current position,
            responsibilities, qualifications, certifications, and recent professional achievements.
          </p>
          <p className="mt-3 text-sm font-medium text-navy">
            Submission deadline: Sunday, 26 July 2026
          </p>
        </div>

        <UploadForm />

        <p className="mt-5 text-center text-xs text-ink/50">
          Please rename your CV using your employee file number before uploading.
        </p>
      </div>
    </main>
  );
}
