"use client";

import React from "react";
import TopNav from "@/components/TopNav";
import Link from "next/link";

export default function SummaryPage() {
  return (
    <div className="bg-background text-on-surface min-h-[100dvh] font-body">
      <TopNav />

      <main className="pt-32 pb-32 px-5 lg:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-surface-container-lowest p-12 lg:p-20 rounded-3xl border border-surface-container shadow-sm max-w-2xl w-full">
          <span className="material-symbols-outlined text-7xl text-primary/40 mb-6 block">insights</span>
          <h1 className="text-3xl lg:text-4xl font-headline font-black tracking-tight mb-4">Roll-up Summary</h1>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed mb-8">
            This dashboard will aggregate your yearly totals, pipeline value, and return on ad spend across all active months.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/planner" 
              className="bg-primary hover:bg-[#006429] text-white px-8 py-3 rounded-full font-bold transition-colors"
            >
              Back to Planner
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
