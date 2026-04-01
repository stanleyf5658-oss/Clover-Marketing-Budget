"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import TopNav from "@/components/TopNav";

export default function PlannerPage() {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Call Convex query!
  const budgetData = useQuery(api.budget.getBudget);
  const contractorInfo = useQuery(api.budget.getContractor);
  const updateBudgetValue = useMutation(api.budget.updateBudgetValue);

  // Local state for expanding subchannels
  const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});

  const toggleExpand = (chId: string) => {
    setExpandedChannels(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  const exportCSV = () => {
    if (!budgetData) return;
    let csv = "Category,Channel,January,February,March,Annual Total,% Budget\n";
    budgetData.forEach(cat => {
      cat.channels.forEach(ch => {
        let activeJan = ch.jan; let activeFeb = ch.feb; let activeMar = ch.mar; let activeRest = ch.restOfYear;
        if (ch.subRows && ch.subRows.length > 0) {
          activeJan = ch.subRows.reduce((a, b) => a + b.jan, 0);
          activeFeb = ch.subRows.reduce((a, b) => a + b.feb, 0);
          activeMar = ch.subRows.reduce((a, b) => a + b.mar, 0);
          activeRest = ch.subRows.reduce((a, b) => a + b.restOfYear, 0);
        }
        const annual = activeJan + activeFeb + activeMar + activeRest;
        const pct = ((annual / 480000) * 100).toFixed(1) + "%";
        csv += `"${cat.name}","${ch.name}",${activeJan},${activeFeb},${activeMar},${annual},${pct}\n`;
        
        if (expandedChannels[ch.id] && ch.subRows) {
          ch.subRows.forEach(sr => {
            const srAnnual = sr.jan + sr.feb + sr.mar + sr.restOfYear;
            const srPct = ((srAnnual / 480000) * 100).toFixed(1) + "%";
            csv += `"${cat.name}","  - ${sr.name}",${sr.jan},${sr.feb},${sr.mar},${srAnnual},${srPct}\n`;
          });
        }
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "clover_budget.csv";
    link.click();
  };

  const formatCurrency = (val: number) => "$" + val.toLocaleString();

  // Temporary calculations while data is loading
  const grandTotals = {
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, 
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
  };
  let grandTotalAnnual = 0;
  let directResponseTotal = 0;
  let brandingTotal = 0;

  if (budgetData) {
    budgetData.forEach(cat => {
      let catTotal = 0;
      cat.channels.forEach(ch => {
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
        const activeVals = {} as Record<typeof months[number], number>;
        
        months.forEach(m => {
          activeVals[m] = ch[m];
          if (ch.subRows && ch.subRows.length > 0) {
            activeVals[m] = ch.subRows.reduce((a: number, b: any) => a + b[m], 0);
          }
          grandTotals[m] += activeVals[m];
        });
        
        const sumOfMonths = months.reduce((a, m) => a + activeVals[m], 0);
        catTotal += sumOfMonths;
        grandTotalAnnual += sumOfMonths;
      });

      if (cat.name.toLowerCase().includes("direct response")) directResponseTotal += catTotal;
      if (cat.name.toLowerCase().includes("branding")) brandingTotal += catTotal;
    });
  }

  const monthsKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
  const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const companyName = contractorInfo?.companyName || "Your Company";
  const revenueGoal = contractorInfo?.revenueGoal || 0;
  
  // Calculate Target Budget based on percentage
  const mktgPct = contractorInfo?.marketingPercentage === -1 ? (contractorInfo?.customPercentage || 0) : (contractorInfo?.marketingPercentage || 0);
  const targetBudgetTotal = revenueGoal * (mktgPct / 100);

  return (
    <div className="bg-background text-on-background font-body min-h-[100dvh] w-full relative pb-20 md:pb-0">
      <TopNav />

      <main className="pt-28 pb-32 px-4 md:px-8 max-w-7xl mx-auto flex-1 relative z-10 w-full overflow-x-hidden">
        
        {/* Header Summary Section */}
        <section className="mb-10 mt-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <h2 className="font-headline font-bold text-4xl text-on-surface">{companyName} <span className="text-on-surface-variant font-light">| 2026 Planner</span></h2>
              <p className="text-on-surface-variant mt-2 font-medium italic">Annual Blueprint for Growth & Sustainability</p>
            </div>
          </div>

          {!contractorInfo ? (
             <div className="animate-pulse bg-surface-container h-40 rounded-xl w-full"></div>
          ) : (
            <>
              {/* Top Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-4 flex justify-between">
                       Revenue Goal
                       <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
                    </p>
                    <p className="text-4xl font-headline font-bold text-on-surface">{formatCurrency(revenueGoal)}</p>
                 </div>

                 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-4 flex justify-between">
                       Total Target Budget
                       <span className="material-symbols-outlined text-sm text-primary">account_balance_wallet</span>
                    </p>
                    <p className="text-4xl font-headline font-bold text-on-surface">{formatCurrency(targetBudgetTotal)}</p>
                    <p className="text-xs text-on-surface-variant mt-2 font-medium">{mktgPct}% of projected revenue</p>
                 </div>

                 <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/20 relative">
                    <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-4 flex justify-between">
                       Allocated
                    </p>
                    <p className="text-4xl font-headline font-bold text-primary">{formatCurrency(grandTotalAnnual)}</p>
                    {Math.abs(targetBudgetTotal - grandTotalAnnual) > 100 && (
                       <p className="text-xs text-error mt-2 font-bold uppercase">
                          {formatCurrency(Math.abs(targetBudgetTotal - grandTotalAnnual))} {grandTotalAnnual > targetBudgetTotal ? "Over Target" : "Remaining"}
                       </p>
                    )}
                 </div>
              </div>

              {/* Bottom Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                       <p className="text-lg font-bold text-on-surface mb-4">Direct Response</p>
                       <p className="text-xs text-on-surface-variant mb-1 font-medium">Total Allocation</p>
                       <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(directResponseTotal)}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm text-center">
                       <p className="text-lg font-bold text-primary">{grandTotalAnnual > 0 ? ((directResponseTotal / grandTotalAnnual) * 100).toFixed(0) : "0"}%</p>
                    </div>
                 </div>

                 <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                       <p className="text-lg font-bold text-on-surface mb-4">Branding & Awareness</p>
                       <p className="text-xs text-on-surface-variant mb-1 font-medium">Total Allocation</p>
                       <p className="text-3xl font-headline font-bold text-on-surface">{formatCurrency(brandingTotal)}</p>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm text-center">
                       <p className="text-lg font-bold text-primary">{grandTotalAnnual > 0 ? ((brandingTotal / grandTotalAnnual) * 100).toFixed(0) : "0"}%</p>
                    </div>
                 </div>
              </div>
            </>
          )}
        </section>

        {/* Table View Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-surface-container-high p-1 rounded-full">
            <button onClick={() => setViewMode("table")} className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-sm">table_chart</span><span className="hidden sm:inline">Table View</span>
            </button>
            <button onClick={() => setViewMode("card")} className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'card' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-sm">grid_view</span><span className="hidden sm:inline">Card View</span>
            </button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 text-primary font-bold text-sm hover:underline cursor-pointer">
            <span className="material-symbols-outlined">download</span><span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {!budgetData ? (
          <div className="p-12 text-center text-on-surface-variant font-medium animate-pulse">Syncing real-time budget...</div>
        ) : budgetData.length === 0 ? (
          <div className="bg-surface-container-lowest p-16 rounded-3xl flex flex-col items-center justify-center min-h-[400px] border border-surface-container shadow-sm mt-8">
             <span className="material-symbols-outlined text-6xl text-primary/40 mb-4 bg-primary/5 p-6 rounded-full">account_balance_wallet</span>
             <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">No active budget formulation found</h3>
             <p className="text-on-surface-variant mb-8 text-center max-w-md font-body">Clover needs your operational metrics to build out your precision growth pipelines.</p>
             <button onClick={() => window.location.href = "/onboarding"} className="bg-gradient-to-br from-primary to-[#006e2e] text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-primary/30 transition-all text-lg flex items-center gap-2">
               Configure My Math <span className="material-symbols-outlined">arrow_forward</span>
             </button>
          </div>
        ) : viewMode === "card" ? (
          <div className="flex flex-col gap-12 mt-6">
            {budgetData.map((cat) => (
               <div key={cat.id}>
                  <h3 className="font-headline font-bold text-lg text-[#008037] mb-6 border-b border-[#008037]/20 pb-2 flex items-center gap-2">
                     <span className="material-symbols-outlined text-xl">dataset</span> {cat.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                     {cat.channels.map((ch) => {
                        const hasSubRows = ch.subRows && ch.subRows.length > 0;
                        const activeVals = {} as Record<typeof monthsKeys[number], number>;
                        monthsKeys.forEach(m => {
                           activeVals[m] = hasSubRows ? ch.subRows!.reduce((a: number, b: any) => a + b[m], 0) : ch[m];
                        });
                        const channelAnnualSum = monthsKeys.reduce((acc, m) => acc + activeVals[m], 0);

                        return (
                           <div key={ch.id} className="bg-white border border-gray-100 shadow-sm rounded-2xl py-6 pr-6 pl-5 relative overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                              {/* Left Accent Stripe */}
                              <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#008037]"></div>
                              
                              {/* Card Header */}
                              <div className="flex justify-between items-start mb-8 w-full">
                                 <div>
                                    <h4 className="font-headline font-bold text-xl text-on-surface">{ch.name}</h4>
                                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 tracking-wide">{cat.name}</p>
                                 </div>
                                 <div className="text-right shrink-0">
                                    <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest mb-1">Channel Total</p>
                                    <p className="font-headline font-bold text-2xl text-on-surface">{formatCurrency(channelAnnualSum)}</p>
                                 </div>
                              </div>
                              
                              {/* Months Input Grid */}
                              <div className="overflow-y-auto max-h-48 pr-2 custom-scrollbar border-t border-gray-100/50 pt-2">
                                 <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    {monthsKeys.map((m, idx) => (
                                       <div key={m}>
                                          <label className="text-[9px] uppercase font-bold text-on-surface-variant tracking-widest block mb-[6px]">{monthLabels[idx]}</label>
                                          {hasSubRows ? (
                                             <div className="bg-surface-container-low py-3 px-3 rounded text-sm font-bold text-on-surface">{formatCurrency(activeVals[m])}</div>
                                          ) : (
                                             <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm">$</span>
                                                <input
                                                   type="text"
                                                   className="w-full bg-surface-container-low py-3 pl-6 pr-3 rounded text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
                                                   value={activeVals[m].toLocaleString()}
                                                   onChange={(e) => updateBudgetValue({ channelId: ch.id, month: m, value: parseInt(e.target.value.replace(/\D/g,'') || "0")})}
                                                />
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant text-xs uppercase font-bold tracking-widest">
                  <th className="px-6 py-5 min-w-[300px] border-r border-[#e1e3de] sticky left-0 z-20 bg-surface-container-high/90 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Channel</th>
                  {monthLabels.map(m => (
                    <th key={m} className="px-4 py-5 text-right border-r border-[#e1e3de] min-w-[120px]">{m}</th>
                  ))}
                  <th className="px-4 py-5 text-right bg-primary/5 text-primary border-r border-[#e1e3de]">Annual Total</th>
                  <th className="px-4 py-5 text-right w-24">% Budget</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr className="bg-[#008037] text-white">
                      <td colSpan={15} className="px-6 py-3 font-headline font-bold text-sm uppercase tracking-widest sticky left-0 z-10">{cat.name}</td>
                    </tr>
                    
                    {cat.channels.map((ch) => {
                      const hasSubRows = ch.subRows && ch.subRows.length > 0;
                      const activeVals = {} as Record<typeof monthsKeys[number], number>;
                      
                      monthsKeys.forEach(m => {
                         activeVals[m] = hasSubRows ? ch.subRows.reduce((a: number, b: any) => a + b[m], 0) : ch[m];
                      });

                      const annual = monthsKeys.reduce((a, m) => a + activeVals[m], 0);
                      const pct = grandTotalAnnual > 0 ? ((annual / grandTotalAnnual) * 100).toFixed(1) + "%" : "0%";
                      const isExpanded = !!expandedChannels[ch.id];

                      return (
                      <React.Fragment key={ch.id}>
                        <tr className="group hover:bg-surface-container-low transition-colors border-b border-surface-container-high">
                          <td className="px-6 py-4 border-r border-[#e1e3de] sticky left-0 z-10 bg-white group-hover:bg-surface-container-low shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center gap-2">
                              {hasSubRows && (
                                <button onClick={() => toggleExpand(ch.id)} className="text-primary flex items-center">
                                  <span className="material-symbols-outlined text-sm">{isExpanded ? "keyboard_arrow_down" : "keyboard_arrow_right"}</span>
                                </button>
                              )}
                              <span className={`font-bold text-sm ${!hasSubRows ? 'ml-6' : ''}`}>{ch.name}</span>
                            </div>
                          </td>
                          {monthsKeys.map(m => (
                            <td key={m} className="px-4 py-4 text-right border-r border-[#e1e3de]">
                              {hasSubRows ? <span className="font-medium text-sm">{formatCurrency(activeVals[m])}</span> : 
                               <input type="text" value={formatCurrency(activeVals[m])} onChange={(e) => updateBudgetValue({ channelId: ch.id, month: m, value: parseInt(e.target.value.replace(/\D/g,'') || "0")})} className="w-full text-right bg-transparent outline-none font-medium"/>}
                            </td>
                          ))}
                          <td className="px-4 py-4 text-right font-bold text-primary bg-primary/5 border-r border-[#e1e3de]">{formatCurrency(annual)}</td>
                          <td className="px-4 py-4 text-right text-xs text-on-surface-variant font-bold">{pct}</td>
                        </tr>

                        {isExpanded && ch.subRows && ch.subRows.map(sr => {
                          const srAnnual = monthsKeys.reduce((a, m) => a + sr[m], 0);
                          const srPct = grandTotalAnnual > 0 ? ((srAnnual / grandTotalAnnual) * 100).toFixed(1) + "%" : "0%";
                          return (
                            <tr key={sr.id} className="bg-surface-container-lowest border-b border-surface-container-high/50 group">
                              <td className="px-6 py-3 border-r border-[#e1e3de] pl-14 flex items-center gap-2 sticky left-0 z-10 bg-surface-container-lowest shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="w-1 h-1 rounded-full bg-outline-variant"></div><span className="text-sm font-medium text-on-surface-variant">{sr.name}</span>
                              </td>
                              {monthsKeys.map(m => (
                                <td key={m} className="px-4 py-3 border-r border-[#e1e3de]">
                                  <input type="text" value={formatCurrency(sr[m])} onChange={(e) => updateBudgetValue({ channelId: ch.id, subId: sr.id, month: m, value: parseInt(e.target.value.replace(/\D/g,'') || "0")})} className="w-full text-right bg-transparent text-sm text-on-surface-variant outline-none"/>
                                </td>
                              ))}
                              <td className="px-4 py-3 text-right font-bold text-on-surface-variant border-r border-[#e1e3de]">{formatCurrency(srAnnual)}</td>
                              <td className="px-4 py-3 text-right text-xs font-medium text-outline">{srPct}</td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                      )
                    })}
                  </React.Fragment>
                ))}

                <tr className="bg-surface-container border-t-2 border-primary">
                  <td className="px-6 py-6 font-headline font-bold text-lg border-r border-[#e1e3de] sticky left-0 z-20 bg-surface-container shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Monthly Budget Totals</td>
                  {monthsKeys.map(m => (
                     <td key={m} className="px-4 py-6 text-right font-bold text-lg border-r border-[#e1e3de]">{formatCurrency(grandTotals[m])}</td>
                  ))}
                  <td className="px-4 py-6 text-right font-headline font-bold text-xl text-primary bg-primary/10 border-r border-[#e1e3de]">{formatCurrency(grandTotalAnnual)}</td>
                  <td className="px-4 py-6 text-right font-bold text-sm">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Allocation Summary Section */}
        {budgetData && budgetData.length > 0 && (
           <section className="mt-16 bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-surface-container shadow-sm w-full mx-auto relative overflow-hidden">
              <h2 className="font-headline font-bold text-3xl text-on-surface mb-2 flex items-center justify-between">
                 Allocation Summary
                 <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-10 absolute right-8 top-8">architecture</span>
              </h2>
              
              <div className="flex flex-col gap-0 border-t border-surface-container mt-12 relative z-10">
                 {budgetData.map(cat => {
                    let catTotal = 0;
                    cat.channels.forEach(ch => {
                       monthsKeys.forEach(m => {
                          const hasSubRows = ch.subRows && ch.subRows.length > 0;
                          catTotal += hasSubRows ? ch.subRows!.reduce((a: number, b: any) => a + b[m], 0) : ch[m];
                       });
                    });

                    // Generative descriptions based on parent category string
                    let desc = "Capital reserve directed toward strategic marketing operations & tool deployments.";
                    if (cat.name.toLowerCase().includes("direct response")) desc = "Includes Search, Social, and Display channels optimized specifically for immediate lead conversion, CPA returns, and targeted reach.";
                    if (cat.name.toLowerCase().includes("branding")) desc = "Traditional media, broadcasts, and awareness placements deployed to build market authority and long-term brand equity.";

                    return (
                       <div key={cat.id} className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-surface-container gap-6">
                          <h3 className="w-full md:w-1/4 font-headline font-bold text-xl text-on-surface">{cat.name}</h3>
                          <p className="w-full md:w-1/2 text-sm text-on-surface-variant font-medium leading-relaxed max-w-lg">{desc}</p>
                          <p className="w-full md:w-1/4 text-right font-headline font-bold text-2xl text-primary">{formatCurrency(catTotal)}</p>
                       </div>
                    );
                 })}
              </div>
           </section>
        )}
      </main>
    </div>
  );
}
