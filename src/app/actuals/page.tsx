"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthsKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

export default function ActualsPage() {
  const [activeMonthIdx, setActiveMonthIdx] = useState(2); // Defaults to March (idx 2)
  const activeMonth = monthsKeys[activeMonthIdx];
  const activeYear = 2026;

  const actualsData = useQuery(api.actuals.getActiveMetrics, { month: activeMonth, year: activeYear });
  const updateMetric = useMutation(api.actuals.updateMetric);

  const flatChannels = useMemo(() => {
    if (!actualsData) return [];
    return actualsData.flatMap(cat => cat.channels);
  }, [actualsData]);

  const { totalSpend, totalLeads, totalRev, totalPlanned } = useMemo(() => {
    return flatChannels.reduce((acc, ch) => {
      acc.totalSpend += ch.actualSpend || 0;
      acc.totalLeads += ch.leads || 0;
      acc.totalRev += ch.revenue || 0;
      acc.totalPlanned += ch.plannedSpend || 0;
      return acc;
    }, { totalSpend: 0, totalLeads: 0, totalRev: 0, totalPlanned: 0 });
  }, [flatChannels]);

  const avgCpl = totalLeads > 0 ? (totalSpend / totalLeads) : 0;
  const totalRoas = totalSpend > 0 ? (totalRev / totalSpend) : 0;

  const handleUpdate = (channelId: string, field: "actualSpend" | "actualLeads" | "actualRevenue", val: string) => {
    const rawNum = val.replace(/\D/g, '');
    if (val === "" || rawNum === "") {
        updateMetric({ channelId: channelId as Id<"channels">, month: activeMonth, year: activeYear, field, value: 0 });
    } else {
        updateMetric({ channelId: channelId as Id<"channels">, month: activeMonth, year: activeYear, field, value: parseInt(rawNum) });
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32 lg:pb-0 font-body">
      <TopNav />

      {/* Main Content Area */}
      <main className="pt-28 pb-32 px-5 lg:px-12 max-w-7xl mx-auto space-y-8 lg:space-y-12">
        {/* Header Section */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-on-surface font-headline">Tracking & Actuals</h1>
              <p className="text-on-surface-variant font-medium text-sm lg:text-base">Precision HVAC Marketing Expenditure & Conversion Data</p>
            </div>
            
            <div className="hidden lg:flex gap-4">
              <button className="bg-surface-container-lowest border border-outline-variant/20 px-6 py-3 rounded-xl font-bold text-on-surface-variant flex items-center gap-2 hover:bg-surface-container transition-colors shadow-sm">
                <span className="material-symbols-outlined">download</span>
                Export CSV
              </button>
            </div>
          </div>

          {/* New Sleek Rounded Month Picker Bar */}
          <div className="flex bg-surface-container p-2 rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full border border-surface-container-high shadow-inner">
            {monthLabels.map((lbl, i) => (
              <button 
                 key={i} 
                 onClick={() => setActiveMonthIdx(i)}
                 className={`flex-1 min-w-[100px] md:min-w-0 px-2 lg:px-4 py-2.5 rounded-xl text-xs lg:text-sm font-bold tracking-wide transition-all ${activeMonthIdx === i ? 'bg-[#008037] text-white shadow-md transform scale-100' : 'text-on-surface-variant hover:text-on-surface hover:bg-white'}`}
              >
                 {lbl}
              </button>
            ))}
          </div>
        </header>

        {!actualsData ? (
           <div className="p-16 text-center text-on-surface-variant font-medium animate-pulse text-lg">Syncing actuals data from Convex...</div>
        ) : (
        <>
            {/* Unified Metrics Section: Horizontal Scroll (Mobile) / Grid (Desktop) */}
            <section className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 lg:overflow-visible">
            <div className="flex space-x-4 pb-2 lg:pb-0 lg:space-x-0 lg:grid lg:grid-cols-5 lg:gap-4 w-max lg:w-full">
                <div className="min-w-[160px] lg:min-w-0 bg-surface-container-lowest p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-surface-container flex flex-col space-y-2 lg:space-y-0 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#008037]"></div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold lg:mb-3 font-headline ml-3">Total Spend</p>
                  <h3 className="text-3xl font-black text-[#008037] font-headline ml-3">{formatCurrency(totalSpend)}</h3>
                  <div className="mt-2 lg:mt-4 ml-3 h-[6px] w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-[#008037] transition-all duration-500" style={{ width: totalPlanned > 0 ? Math.min((totalSpend / totalPlanned) * 100, 100) + '%' : '0%' }}></div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-2 ml-3 font-medium tracking-wide">Planned: {formatCurrency(totalPlanned)}</p>
                </div>
                <div className="min-w-[160px] lg:min-w-0 bg-surface-container-lowest p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-surface-container flex flex-col justify-center space-y-2 lg:space-y-0">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold lg:mb-3 font-headline">Total Leads</p>
                  <h3 className="text-3xl font-black text-on-surface font-headline">{totalLeads.toLocaleString()}</h3>
                </div>
                <div className="min-w-[160px] lg:min-w-0 bg-surface-container-lowest p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-surface-container flex flex-col justify-center space-y-2 lg:space-y-0">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold lg:mb-3 font-headline">Avg CPL</p>
                  <h3 className="text-3xl font-black text-on-surface font-headline">{formatCurrency(avgCpl)}</h3>
                </div>
                <div className="min-w-[160px] lg:min-w-0 bg-surface-container-lowest p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-surface-container flex flex-col justify-center space-y-2 lg:space-y-0">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold lg:mb-3 font-headline">Total Revenue</p>
                  <h3 className="text-3xl font-black text-on-surface font-headline">{formatCurrency(totalRev)}</h3>
                </div>
                <div className="min-w-[160px] lg:min-w-0 bg-surface-container-lowest p-5 lg:p-6 rounded-xl lg:rounded-2xl shadow-sm border border-surface-container flex flex-col justify-center space-y-2 lg:space-y-0">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold lg:mb-3 font-headline">Total ROAS</p>
                  <h3 className="text-3xl font-black text-[#008037] font-headline">{totalRoas.toFixed(1)}x</h3>
                </div>
            </div>
            </section>

            {/* Desktop View: Actuals Entry Table (>= lg) */}
            <section className="hidden lg:block bg-surface-container-lowest rounded-3xl p-1 overflow-hidden shadow-xl shadow-on-surface/5 border border-surface-container mt-12">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-surface-container/50 border-b border-surface-container-high">
                    <th className="px-8 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant border-r border-surface-container">Channel</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant border-r border-surface-container text-right">Planned Spend</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant border-r border-surface-container text-right">Actual Spend</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant text-center border-r border-surface-container">Leads</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant border-r border-surface-container text-right">Revenue</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant text-right border-r border-surface-container">CPL</th>
                    <th className="px-6 py-5 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant text-right">ROAS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                    {flatChannels.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant font-medium">No active channels in the Planner for this month. Go to Planner to allocate budget first!</td>
                        </tr>
                    ) : flatChannels.map((row) => {
                        const localCpl = row.leads > 0 ? (row.actualSpend / row.leads) : 0;
                        const localRoas = row.actualSpend > 0 ? (row.revenue / row.actualSpend) : 0;
                        
                        return (
                        <tr key={row.id} className="group hover:bg-surface-container-low transition-colors">
                            <td className="px-8 py-6 border-r border-surface-container text-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center`}>
                                    <span className={`material-symbols-outlined text-primary text-lg`}>public</span>
                                    </div>
                                    <span className="font-bold text-on-surface text-base">{row.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-6 border-r border-surface-container text-sm text-right">
                                <span className="text-on-surface-variant font-bold font-headline text-lg opacity-70">{formatCurrency(row.plannedSpend)}</span>
                            </td>
                            <td className="px-6 py-6 border-r border-surface-container text-sm">
                                <div className="relative max-w-[140px] ml-auto">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">$</span>
                                    <input 
                                       className="w-full pl-6 pr-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-lg font-bold text-on-surface focus:ring-2 focus:ring-primary text-sm font-body outline-none" 
                                       type="text" 
                                       value={row.actualSpend ? row.actualSpend.toLocaleString() : ""}
                                       onChange={(e) => handleUpdate(row.id, "actualSpend", e.target.value)}
                                       placeholder="0"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-6 border-r border-surface-container text-sm">
                                <input 
                                   className="w-24 mx-auto block py-2 bg-surface-container-high border border-outline-variant/20 rounded-lg font-bold text-center text-on-surface focus:ring-2 focus:ring-primary text-sm font-body outline-none" 
                                   type="text" 
                                   value={row.leads ? row.leads.toLocaleString() : ""}
                                   onChange={(e) => handleUpdate(row.id, "actualLeads", e.target.value)}
                                   placeholder="0"
                                />
                            </td>
                            <td className="px-6 py-6 border-r border-surface-container text-sm">
                                <div className="relative max-w-[140px] ml-auto">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">$</span>
                                    <input 
                                       className="w-full pl-6 pr-3 py-2 bg-surface-container-high border border-outline-variant/20 rounded-lg font-bold text-on-surface focus:ring-2 focus:ring-primary text-sm font-body outline-none" 
                                       type="text" 
                                       value={row.revenue ? row.revenue.toLocaleString() : ""}
                                       onChange={(e) => handleUpdate(row.id, "actualRevenue", e.target.value)}
                                       placeholder="0"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-6 text-right border-r border-surface-container">
                                <span className="text-on-surface font-black font-headline text-lg">{formatCurrency(localCpl)}</span>
                            </td>
                            <td className="px-6 py-6 text-right">
                                <span className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full font-black text-xs inline-block min-w-[3rem] text-center shadow-sm">{localRoas.toFixed(1)}x</span>
                            </td>
                        </tr>
                    )})}
                </tbody>
                </table>
            </div>
            </section>

            <div className="flex items-start gap-3 p-4 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm mt-6">
                <span className="material-symbols-outlined text-primary text-xl">info</span>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                    <strong>Note:</strong> Branding activities (such as Local TV or Fleet Graphics) generally do not bring direct trackable revenue through this matrix. They operate as top-of-funnel awareness campaigns. For strict ROAS conversions, rely on your Direct Response channels.
                </p>
            </div>
        </>
        )}
      </main>
    </div>
  );
}
