"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type FormData = {
  firstName: string;
  companyName: string;
  revenueGoal: number | "";
  splitType: "even" | "custom";
  marketingPercentage: number | "custom" | "";
  customPercentage: number | "";
  channels: string[];
  newChannels: string[];
  revenueMonths: number[]; // 12 item array
  allocations: {
    [channel: string]: {
      isFlat: boolean;
      flatAmount: number;
      customMonths: number[]; // Array of 12 amounts for Jan-Dec
    }
  }
};

const MARKETING_CHANNELS = [
  "SEO / Organic Search",
  "Google Ads (PPC)",
  "Local Services Ads (LSA)",
  "Social Media Ads (Meta/FB)",
  "Direct Mail",
  "Radio / Spotify",
  "TV / Cable",
  "OTT",
  "Out of Home",
  "Email Marketing"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  
  const submitProfile = useMutation(api.onboarding.submitProfile);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    companyName: "",
    revenueGoal: "",
    splitType: "custom",
    marketingPercentage: "",
    customPercentage: "",
    channels: [],
    newChannels: [],
    revenueMonths: Array(12).fill(0),
    allocations: {}
  });

  const nextStep = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // Helper calculates marketing spend
  const calculateSpend = () => {
    if (!formData.revenueGoal) return { year: 0, month: 0 };
    const goal = Number(formData.revenueGoal);
    const perc = formData.marketingPercentage === "custom" 
      ? Number(formData.customPercentage) 
      : Number(formData.marketingPercentage);
    
    if (!perc) return { year: 0, month: 0 };
    
    const yearly = goal * (perc / 100);
    return { year: yearly, month: yearly / 12 };
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Recommendations split logic based on PRD logic tier
  const getRecommendation = () => {
    const goal = Number(formData.revenueGoal || 0);
    if (goal <= 10000000) return { dr: 60, brand: 40, text: "Balancing direct response with local market presence." };
    return { dr: 50, brand: 50, text: "Market dominance requires equal focus on Brand and DR." };
  };

  const handleFinish = async () => {
    try {
      console.log("Submitting Profile to Convex...", formData);
      const contractorId = await submitProfile({
        firstName: formData.firstName,
        companyName: formData.companyName,
        revenueGoal: Number(formData.revenueGoal),
        splitType: formData.splitType,
        marketingPercentage: formData.marketingPercentage === "custom" ? -1 : Number(formData.marketingPercentage),
        customPercentage: formData.customPercentage === "" ? undefined : Number(formData.customPercentage),
        channels: formData.channels,
        revenueMonths: formData.revenueMonths,
        allocations: JSON.stringify(formData.allocations), // Pass as string because Convex doesn't allow dynamic dictionaries directly without strict typing
      });
      console.log("Created successfully, redirecting...");
      router.push("/planner");
    } catch (error) {
      console.error("Failed to submit profile", error);
      alert("Uh oh! Looks like there was an issue saving to Convex. Check terminal.");
    }
  };

  // Render components for steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">Let's start with the basics.</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">Your First Name (e.g., John)</label>
                <Input 
                  autoFocus
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John" 
                />
              </div>
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">Company Name</label>
                <Input 
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Clover HVAC Services" 
                />
              </div>
            </div>
            <div className="pt-4">
              <Button 
                onClick={nextStep} 
                disabled={!formData.firstName.trim() || !formData.companyName.trim()} 
                className="w-full sm:w-auto"
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">What's your revenue goal this year?</h2>
              <p className="text-text-muted text-[15px]">This is your target — not your current revenue.</p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main font-bold text-[18px]">$</span>
              <Input 
                autoFocus
                type="text" 
                inputMode="decimal"
                className="pl-9 text-lg font-bold"
                value={formData.revenueGoal ? Number(formData.revenueGoal).toLocaleString('en-US') : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(rawValue)) {
                    setFormData({ ...formData, revenueGoal: rawValue === "" ? "" : Number(rawValue) });
                  }
                }}
                placeholder="0" 
              />
            </div>
            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!formData.revenueGoal || formData.revenueGoal <= 0}>
                Next &rarr;
              </Button>
            </div>
          </div>
        );

      case 3:
        const targetRev = Number(formData.revenueGoal || 0);
        const allocatedRev = formData.revenueMonths.reduce((a, b) => a + b, 0);
        const remainingRev = targetRev - allocatedRev;

        const handleRevChange = (idx: number, val: number) => {
          const newArr = [...formData.revenueMonths];
          newArr[idx] = val;
          setFormData({ ...formData, revenueMonths: newArr });
        };
        
        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-text-main">How should we spread your revenue goal across the year?</h2>
            <p className="text-text-muted text-[15px]">Clover recommends setting up custom monthly goals and avoiding flat 12-month splits to account for true seasonality.</p>

            <div className="sticky top-0 bg-white p-4 shadow-sm z-10 rounded-[12px] border border-gray-100 flex justify-between items-center mb-6">
               <div className="space-x-3">
                 <span className="text-sm font-bold text-text-muted">Target: <span className="text-text-main">{formatCurrency(targetRev)}</span></span>
                 <span className="text-sm font-bold text-text-muted">Allocated: <span className="text-primary">{formatCurrency(allocatedRev)}</span></span>
               </div>
               <div className={`px-3 py-1 rounded-full text-sm font-bold ${Math.abs(remainingRev) < 100 ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                 {remainingRev >= 0 ? `${formatCurrency(remainingRev)} Remaining` : `${formatCurrency(Math.abs(remainingRev))} Over Goal!`}
               </div>
            </div>
            
            <div className="bg-surface rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                 {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, idx) => (
                   <div key={m}>
                     <label className="block text-xs font-bold text-text-muted mb-1 text-center">{m}</label>
                     <div className="relative">
                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[11px] font-bold"></span>
                       <Input 
                         type="number"
                         value={formData.revenueMonths[idx] === 0 ? "" : formData.revenueMonths[idx]}
                         onChange={(e) => handleRevChange(idx, Number(e.target.value))}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                         placeholder="0"
                         className="px-2 py-1 h-8 text-sm"
                       />
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <div className="flex gap-3">
                <Button onClick={nextStep}>Next &rarr;</Button>
              </div>
            </div>
          </div>
        );

      case 4:
        const spend = calculateSpend();
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">What percentage of revenue will you invest into marketing?</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[6, 8, 10].map(perc => (
                <button
                  key={perc}
                  onClick={() => setFormData({ ...formData, marketingPercentage: perc, customPercentage: "" })}
                  className={`py-3 px-4 rounded-[8px] font-bold border transition-colors ${
                    formData.marketingPercentage === perc 
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-surface text-text-main border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {perc}%
                </button>
              ))}
              <button
                onClick={() => setFormData({ ...formData, marketingPercentage: "custom" })}
                className={`py-3 px-4 rounded-[8px] font-bold border transition-colors ${
                  formData.marketingPercentage === "custom" 
                    ? "bg-primary text-white border-primary shadow-sm" 
                    : "bg-surface text-text-main border-gray-200 hover:border-gray-300"
                }`}
              >
                Custom %
              </button>
            </div>

            {formData.marketingPercentage === "custom" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                <label className="block text-[13px] font-bold text-text-main mb-1.5">Custom Percentage</label>
                <div className="relative">
                  <Input 
                    autoFocus
                    type="number" 
                    inputMode="decimal"
                    value={formData.customPercentage}
                    onChange={(e) => setFormData({ ...formData, customPercentage: e.target.value === "" ? "" : Number(e.target.value) })}
                    placeholder="e.g. 12" 
                    className="pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">%</span>
                </div>
              </motion.div>
            )}

            {(spend.year > 0) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-app p-4 rounded-[8px] text-center border border-gray-100">
                <p className="text-[15px] text-text-main">
                  That's <strong className="font-bold text-primary">{formatCurrency(spend.year)}</strong> for the year<br/>
                  <span className="text-text-muted text-[14px]">or about {formatCurrency(spend.month)}/month.</span>
                </p>
              </motion.div>
            )}

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button 
                onClick={nextStep} 
                disabled={!formData.marketingPercentage || (formData.marketingPercentage === "custom" && !formData.customPercentage)}
              >
                That's my number &rarr;
              </Button>
            </div>
          </div>
        );

      case 5:
        const rec = getRecommendation();
        const yearlyTotal = calculateSpend().year;
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">Here's how Clover recommends splitting your budget.</h2>
              <p className="text-text-muted text-[15px]">{rec.text}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface rounded-[12px] p-6 border-l-4 border-l-primary shadow-sm">
                <p className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-1">Direct Response</p>
                <p className="text-3xl font-heading font-bold text-text-main mb-2">{rec.dr}%</p>
                <p className="text-[15px] font-medium text-text-main">{formatCurrency(yearlyTotal * (rec.dr/100))}</p>
              </div>
              <div className="bg-branding-row rounded-[12px] p-6 border-l-4 border-l-secondary shadow-sm">
                <p className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-1">Branding</p>
                <p className="text-3xl font-heading font-bold text-primary mb-2">{rec.brand}%</p>
                <p className="text-[15px] font-medium text-primary">{formatCurrency(yearlyTotal * (rec.brand/100))}</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Got it &rarr;</Button>
            </div>
          </div>
        );

      case 6:
        const toggleChannel = (channel: string) => {
          const arr = formData.channels;
          let newAllocations = { ...formData.allocations };
          if (arr.includes(channel)) {
            delete newAllocations[channel];
            setFormData({ ...formData, channels: arr.filter(c => c !== channel), allocations: newAllocations });
          } else {
            newAllocations[channel] = { isFlat: true, flatAmount: 0, customMonths: Array(12).fill(0) };
            setFormData({ ...formData, channels: [...arr, channel], allocations: newAllocations });
          }
        };

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">Which marketing channels do you currently use?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 pb-2">
              {MARKETING_CHANNELS.map(ch => {
                const isSelected = formData.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`flex items-center p-3 rounded-[8px] border text-left transition-colors ${
                      isSelected ? "bg-branding-row border-primary" : "bg-surface border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[15px] font-medium ${isSelected ? "text-primary" : "text-text-main"}`}>
                      {ch}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={formData.channels.length === 0}>
                Next &rarr;
              </Button>
            </div>
          </div>
        );

      case 7:
        const toggleNewChannel = (channel: string) => {
          const arr = formData.newChannels;
          if (arr.includes(channel)) {
            setFormData({ ...formData, newChannels: arr.filter(c => c !== channel) });
          } else {
            setFormData({ ...formData, newChannels: [...arr, channel] });
          }
        };

        const TESTABLE_CHANNELS = [
          "Google Ads (PPC)",
          "Social Media Ads (Meta/FB)",
          "Local Services Ads (LSA)",
          "SEO / Organic Search"
        ];
        
        // Only show options that they actually selected in Step 6
        const availableToTest = formData.channels.filter(ch => TESTABLE_CHANNELS.includes(ch));

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">Are you new to any of these channels?</h2>
              <p className="text-text-muted text-[15px]">We'll tailor our budget coaching based on your experience.</p>
            </div>
            
            {availableToTest.length === 0 ? (
               <div className="bg-surface p-6 rounded-xl border border-gray-200 text-center">
                 <p className="text-text-muted">You didn't select any of our core coached channels (Google, LSA, SEO, Meta). You can skip this step.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {availableToTest.map(ch => {
                  const isSelected = formData.newChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleNewChannel(ch)}
                      className={`w-full flex items-center p-4 rounded-[12px] border-2 text-left transition-all ${
                        isSelected ? "bg-branding-row border-primary" : "bg-surface border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[16px] font-bold ${isSelected ? "text-primary" : "text-text-main"}`}>
                        {ch}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>
                Next &rarr;
              </Button>
            </div>
          </div>
        );

      case 8:
        const currentTargetSpend = calculateSpend().year;
        
        let allocatedAmount = 0;
        formData.channels.forEach(ch => {
           const a = formData.allocations[ch];
           if (a) {
             allocatedAmount += a.isFlat ? (a.flatAmount * 12) : a.customMonths.reduce((sum, val) => sum + val, 0);
           }
        });
        const remaining = currentTargetSpend - allocatedAmount;
        
        const updateAllocation = (ch: string, field: string, val: any) => {
          setFormData({
             ...formData, 
             allocations: {
               ...formData.allocations,
               [ch]: { ...formData.allocations[ch], [field]: val }
             }
          });
        };
        const updateCustomMonth = (ch: string, mIdx: number, val: number) => {
          const arr = [...formData.allocations[ch].customMonths];
          arr[mIdx] = val;
          updateAllocation(ch, "customMonths", arr);
        };

        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-text-main">Allocate your Marketing Budget</h2>
            
            <div className="sticky top-0 bg-white p-4 shadow-sm z-10 rounded-[12px] border border-gray-100 flex justify-between items-center mb-6">
               <div className="space-x-3">
                 <span className="text-sm font-bold text-text-muted">Target: <span className="text-text-main">{formatCurrency(currentTargetSpend)}</span></span>
                 <span className="text-sm font-bold text-text-muted">Allocated: <span className="text-primary">{formatCurrency(allocatedAmount)}</span></span>
               </div>
               <div className={`px-3 py-1 rounded-full text-sm font-bold ${Math.abs(remaining) < 100 ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                 {remaining >= 0 ? `${formatCurrency(remaining)} Remaining` : `${formatCurrency(Math.abs(remaining))} Over Budget!`}
               </div>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto px-2 pb-4">
              {formData.channels.map(ch => {
                const alloc = formData.allocations[ch];
                if (!alloc) return null;
                const totalForCard = alloc.isFlat ? alloc.flatAmount * 12 : alloc.customMonths.reduce((s, v) => s + v, 0);

                return (
                  <div key={ch} className="bg-surface rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
                    {ch === "Local Services Ads (LSA)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-[13px] border border-blue-100">
                        <strong>💡 LSA Strategy:</strong> Since you're new to LSA, leave this <strong>blank (or $0)</strong> for your marketing budget calculations if you don't know your spend limit yet. We recommend securing as many high-quality leads as possible, and you can dispute unqualified ones!
                      </div>
                    )}
                    {ch === "Google Ads (PPC)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-[13px] border border-green-100">
                        <strong>💡 Testing PPC?</strong> Since you're new to PPC, we recommend starting with a flat, consistent monthly budget to gather reliable data before scaling.
                      </div>
                    )}
                    {ch === "SEO / Organic Search" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-purple-50 text-purple-800 rounded-lg text-[13px] border border-purple-100">
                        <strong>💡 New to SEO?</strong> SEO is a long-term play. Set a flat monthly retainer that you are comfortable sustaining for at least 6 to 12 months.
                      </div>
                    )}
                    {ch === "Social Media Ads (Meta/FB)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-orange-50 text-orange-800 rounded-lg text-[13px] border border-orange-100">
                        <strong>💡 Social Strategy:</strong> When breaking into Social Ads, focus on a stable, flat monthly budget to test creative assets before ramping up spend.
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-text-main">{ch} <span className="text-sm font-medium text-text-muted ml-2">({formatCurrency(totalForCard)}/yr)</span></h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={alloc.isFlat} onChange={(e) => updateAllocation(ch, "isFlat", e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary"/>
                        <span className="text-sm font-medium text-text-muted">Same amount every month</span>
                      </label>
                    </div>

                    {alloc.isFlat ? (
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-text-main">$</span>
                         <Input 
                            type="number"
                            placeholder="Monthly amount"
                            value={alloc.flatAmount === 0 ? "" : alloc.flatAmount}
                            onChange={(e) => updateAllocation(ch, "flatAmount", Number(e.target.value))}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            className="max-w-[200px]"
                         />
                         <span className="text-text-muted text-sm font-medium">/ month</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                         {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, idx) => (
                           <div key={m}>
                             <label className="block text-xs font-bold text-text-muted mb-1 text-center">{m}</label>
                             <div className="relative">
                               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-[11px] font-bold"></span>
                               <Input 
                                 type="number"
                                 value={alloc.customMonths[idx] === 0 ? "" : alloc.customMonths[idx]}
                                 onChange={(e) => updateCustomMonth(ch, idx, Number(e.target.value))}
                                 onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                 placeholder="0"
                                 className="px-2 py-1 h-8 text-sm"
                               />
                             </div>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <div className="flex items-center gap-3">
                <Button onClick={nextStep}>
                  Next &rarr;
                </Button>
              </div>
            </div>
          </div>
        );

      case 9:
        const finalSpend = calculateSpend();
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">You're all set!</h2>
            
            <div className="bg-surface rounded-[12px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-muted text-[14px]">Company Name</span>
                <span className="font-bold text-text-main">{formData.companyName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-muted text-[14px]">Revenue Goal</span>
                <span className="font-bold text-text-main">{formatCurrency(Number(formData.revenueGoal))}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-muted text-[14px]">Total Target Budget</span>
                <span className="font-bold text-primary">{formatCurrency(finalSpend.year)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-muted text-[14px]">Channels Configured</span>
                <span className="font-bold text-text-main">{formData.channels.length}</span>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>Back</Button>
              <Button onClick={handleFinish} className="w-full sm:w-auto">
                Go to my budget planner <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-bg-app flex flex-col relative overflow-hidden">
      {/* Dynamic Progress Bar over the top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div 
          className="h-full bg-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ ease: "easeInOut", duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-[-10vh]">
        <div className="w-full max-w-[672px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
