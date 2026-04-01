"use client";

import React from "react";

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">settings</span>
        <h2 className="text-2xl font-black font-headline text-on-surface">Admin Settings</h2>
        <p className="text-on-surface-variant font-medium mt-2">Account configuration and system preferences.</p>
      </div>
    </div>
  );
}
