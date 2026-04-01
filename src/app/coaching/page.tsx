"use client";

import React from "react";
import TopNav from "@/components/TopNav";
import Link from "next/link";

export default function CoachingPage() {
  return (
    <div className="bg-background text-on-surface min-h-[100dvh] font-body">
      <TopNav />

      <main className="pt-32 pb-32 px-5 lg:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-surface-container-lowest p-12 lg:p-20 rounded-3xl border border-surface-container shadow-sm max-w-2xl w-full">
          <span className="material-symbols-outlined text-7xl text-primary/40 mb-6 block">school</span>
          <h1 className="text-3xl lg:text-4xl font-headline font-black tracking-tight mb-4">Clover Coaching Center</h1>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed mb-8">
            Access your 1-on-1 strategy calls, marketing playbooks, and training videos from your designated growth strategist here.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/actuals" 
              className="bg-primary hover:bg-[#006429] text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Log your Actuals
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
