"use client";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf5]">
      <div className="text-center space-y-6 max-w-md px-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-error"
              style={{ fontSize: "2.5rem", fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-headline font-black text-on-surface tracking-tight">
            Access Denied
          </h1>
          <p className="text-on-surface-variant font-body text-base leading-relaxed">
            You don&apos;t have permission to view this page. Admin access is
            required. If you believe this is a mistake, please contact your
            Clover Growth Partners administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/planner"
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold hover:brightness-110 transition-all shadow-md"
          >
            Go to Planner
          </Link>
          <Link
            href="/sign-in"
            className="bg-surface-container text-on-surface px-6 py-3 rounded-xl font-headline font-bold hover:bg-surface-container-high transition-all border border-outline-variant/30"
          >
            Sign in as Different User
          </Link>
        </div>
      </div>
    </div>
  );
}
