"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";

const formatCurrency = (val: number) => "$" + Math.round(val).toLocaleString();
const formatPct = (val: number) => val.toFixed(1) + "%";

export default function AdminDashboardPage() {
  const { membership } = useOrganization();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const clients = useQuery(api.admin.getAllClients);
  const clientDetail = useQuery(
    api.admin.getClientBudgetDetail,
    selectedClientId ? { contractorId: selectedClientId as any } : "skip"
  );

  const filteredClients = (clients ?? []).filter((c) => {
    const q = search.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  const totalPlanned = filteredClients.reduce((s, c) => s + c.totalPlannedBudget, 0);
  const totalActual = filteredClients.reduce((s, c) => s + c.totalActualSpend, 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl lg:text-5xl font-black text-on-surface leading-none tracking-tight font-headline">
            Client Overview
          </h1>
          <p className="text-on-surface-variant max-w-lg text-lg font-body">
            All client budgets and actuals across your Clover Growth Partners portfolio.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-lg text-sm font-body"
            placeholder="Search clients..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Clients", value: clients ? String(filteredClients.length) : "—", color: "text-primary", border: "border-primary/20" },
          { label: "Total Planned Budget", value: clients ? formatCurrency(totalPlanned) : "—", color: "text-secondary", border: "border-secondary/20" },
          { label: "Total Actual Spend", value: clients ? formatCurrency(totalActual) : "—", color: "text-tertiary-container", border: "border-tertiary-container/20" },
        ].map((stat, i) => (
          <div key={i} className={`bg-surface-container-lowest p-6 rounded-xl shadow-sm border-b-2 ${stat.border}`}>
            <p className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{stat.label}</p>
            <p className={`text-4xl font-headline font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* Client Table */}
        <section className="flex-1 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(25,28,25,0.06)] border border-outline-variant/10">
          <div className="p-6 bg-surface-container-low flex items-center justify-between">
            <h3 className="font-headline font-bold text-xl">Client Roster</h3>
            <span className="text-sm text-on-surface-variant font-body">{filteredClients.length} clients</span>
          </div>
          <div className="overflow-x-auto">
            {!clients ? (
              <div className="p-8 text-center text-on-surface-variant">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">No clients found.</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-surface-container-high">
                    <th className="text-left py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Client</th>
                    <th className="text-right py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Revenue Goal</th>
                    <th className="text-right py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Mktg %</th>
                    <th className="text-right py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Planned</th>
                    <th className="text-right py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Actual Spend</th>
                    <th className="text-right py-4 px-6 font-headline font-bold text-on-surface-variant uppercase text-xs tracking-widest">Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={`hover:bg-surface-container transition-all cursor-pointer ${selectedClientId === client.id ? "bg-primary/5 border-l-2 border-primary" : "bg-white"}`}
                      onClick={() => setSelectedClientId(selectedClientId === client.id ? null : client.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-on-surface">{client.firstName} {client.lastName ?? ""}</div>
                        <div className="text-xs text-on-surface-variant font-body">{client.companyName}</div>
                        {client.email && <div className="text-xs text-on-surface-variant/60">{client.email}</div>}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-sm">{formatCurrency(client.revenueGoal)}</td>
                      <td className="py-4 px-6 text-right font-mono text-sm">{formatPct(client.marketingPercentage)}</td>
                      <td className="py-4 px-6 text-right font-mono text-sm text-primary font-bold">{formatCurrency(client.totalPlannedBudget)}</td>
                      <td className="py-4 px-6 text-right font-mono text-sm">
                        <span className={client.totalActualSpend > client.totalPlannedBudget ? "text-error font-bold" : "text-secondary font-bold"}>
                          {formatCurrency(client.totalActualSpend)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-sm">{client.totalActualLeads.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Client Detail Panel */}
        {selectedClientId && (
          <section className="w-full xl:w-[420px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_10px_30px_rgba(25,28,25,0.06)] border border-outline-variant/10 flex flex-col">
            <div className="p-6 bg-surface-container-low flex items-center justify-between">
              <h3 className="font-headline font-bold text-xl">Budget Detail</h3>
              <button onClick={() => setSelectedClientId(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {!clientDetail ? (
                <p className="text-on-surface-variant text-sm">Loading...</p>
              ) : (
                <>
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-lg">{clientDetail.contractor.firstName} {clientDetail.contractor.lastName ?? ""}</h4>
                    <p className="text-on-surface-variant text-sm">{clientDetail.contractor.companyName}</p>
                    {clientDetail.contractor.email && <p className="text-xs text-on-surface-variant/60">{clientDetail.contractor.email}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container p-3 rounded-lg">
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Revenue Goal</p>
                      <p className="font-bold text-primary">{formatCurrency(clientDetail.contractor.revenueGoal)}</p>
                    </div>
                    <div className="bg-surface-container p-3 rounded-lg">
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">Mktg Budget %</p>
                      <p className="font-bold text-primary">{formatPct(clientDetail.contractor.marketingPercentage)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface-variant">Channel Breakdown</h5>
                    {clientDetail.budgetRows.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">No budget data yet.</p>
                    ) : (
                      clientDetail.budgetRows.map((row, i) => (
                        <div key={i} className="bg-surface-container p-3 rounded-lg space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm">{row.channelName}</p>
                              <p className="text-xs text-on-surface-variant">{row.categoryName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-on-surface-variant">Planned</p>
                              <p className="font-mono font-bold text-sm text-primary">{formatCurrency(row.totalPlanned)}</p>
                            </div>
                          </div>
                          {row.totalActualSpend > 0 && (
                            <div className="flex justify-between text-xs text-on-surface-variant">
                              <span>Actual Spend</span>
                              <span className={`font-bold ${row.totalActualSpend > row.totalPlanned ? "text-error" : "text-secondary"}`}>
                                {formatCurrency(row.totalActualSpend)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
