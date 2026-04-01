"use client";

import React from "react";

export default function AdminPendingPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 flex items-center justify-center">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">pending_actions</span>
        <h2 className="text-2xl font-black font-headline text-on-surface">Pending Actions</h2>
        <p className="text-on-surface-variant font-medium mt-2">No pending invitations or approvals required at this time.</p>
      </div>
    </div>
  );
}
