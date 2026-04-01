"use client";

import React from "react";

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-6xl font-black text-on-surface leading-none tracking-tight font-headline">Contractor Overview</h1>
          <p className="text-on-surface-variant max-w-lg text-lg font-body">Manage precision builder growth pipelines and financial progress across your active coaching portfolio.</p>
        </div>
        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-headline font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-xl hover:shadow-primary/20 shrink-0">
          <span className="material-symbols-outlined">person_add</span>
          Send Invite
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Portfolios", value: "42", color: "text-primary", border: "border-primary/20" },
          { label: "Avg. Revenue Growth", value: "+18.4%", color: "text-secondary", border: "border-secondary/20" },
          { label: "Requires Attention", value: "7", color: "text-tertiary-container", border: "border-tertiary-container/20" },
        ].map((stat, i) => (
          <div key={i} className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm border-b-2 ${stat.border}`}>
            <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{stat.label}</p>
            <p className={`text-4xl font-headline font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <section className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(25,28,25,0.06)] border border-outline-variant/10">
        <div className="p-6 bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline font-bold text-xl">Roster</h3>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="text-left py-5 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest whitespace-nowrap">Contractor Name</th>
                <th className="text-left py-5 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest whitespace-nowrap">Company</th>
                <th className="text-center py-5 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {[
                { name: "Julian Daniels", company: "Oak & Iron Framing", status: "check_circle", color: "text-secondary" },
                { name: "Sarah Chen", company: "Chen Artisan Homes", status: "cancel", color: "text-error" },
                { name: "Marcus Butler", company: "Precision Concrete Inc.", status: "check_circle", color: "text-secondary" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-container-lowest hover:shadow-sm transition-all group cursor-pointer bg-white">
                  <td className="py-4 px-6 font-bold text-on-surface whitespace-nowrap">{row.name}</td>
                  <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap font-medium text-sm">{row.company}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`material-symbols-outlined ${row.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
