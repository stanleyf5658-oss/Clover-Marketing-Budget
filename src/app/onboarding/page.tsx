"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceOption = "hvac" | "hvac_plumbing" | "hvac_plumbing_electrical" | "other";

type FormData = {
  firstName: string;
  companyName: string;
  websiteUrl: string;
  services: ServiceOption[];
  otherServices: string;
  revenueGoal: number | "";
  splitType: "even" | "custom";
  marketingPercentage: number | "custom" | "";
  customPercentage: number | "";
  channels: string[];
  newChannels: string[];
  noneExperienced: boolean;
  revenueMonths: number[];
  allocations: {
    [channel: string]: {
      isFlat: boolean;
      flatAmount: number;
      customMonths: number[];
    };
  };
  // track whether user has manually edited allocations so we don't overwrite
  allocationsUserEdited: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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
  "Email Marketing",
];

const CHANNEL_WEIGHTS: { [key: string]: number } = {
  "Google Ads (PPC)": 3,
  "Local Services Ads (LSA)": 2,
  "SEO / Organic Search": 2,
  "Social Media Ads (Meta/FB)": 2,
  "Direct Mail": 1.5,
  "Radio / Spotify": 1,
  "TV / Cable": 1,
  "OTT": 1,
  "Out of Home": 1,
  "Email Marketing": 0.5,
};

const SERVICE_OPTIONS: { value: ServiceOption; label: string; description: string }[] = [
  { value: "hvac", label: "HVAC Only", description: "Heating, ventilation & air conditioning" },
  { value: "hvac_plumbing", label: "HVAC + Plumbing", description: "HVAC and plumbing services" },
  { value: "hvac_plumbing_electrical", label: "HVAC + Plumbing + Electrical", description: "Full home services" },
  { value: "other", label: "Other / Custom", description: "Specify your own service mix" },
];

// ─── Seasonality Engine ───────────────────────────────────────────────────────
// Monthly demand index (0–1 scale, will be normalised to sum to 1).
// Derived from typical HVAC/plumbing/electrical demand patterns by climate zone.

type ClimateZone = "hot" | "cold" | "mixed" | "mild";

// Rough climate zone by US state abbreviation (or "default" for unknown)
function getClimateZone(state: string): ClimateZone {
  const hot = ["FL", "TX", "AZ", "NM", "NV", "LA", "MS", "AL", "GA", "SC", "HI"];
  const cold = ["MN", "WI", "MI", "ND", "SD", "MT", "WY", "VT", "ME", "NH", "AK", "IA", "NE"];
  const mild = ["CA", "OR", "WA", "HI"];
  if (hot.includes(state)) return "hot";
  if (cold.includes(state)) return "cold";
  if (mild.includes(state)) return "mild";
  return "mixed";
}

// Monthly demand weights per climate zone and service mix
// Index 0 = Jan, 11 = Dec
const SEASONALITY_PROFILES: Record<ClimateZone, Record<string, number[]>> = {
  hot: {
    hvac:                       [0.6, 0.6, 0.8, 1.0, 1.2, 1.5, 1.5, 1.4, 1.2, 1.0, 0.7, 0.5],
    hvac_plumbing:              [0.7, 0.7, 0.9, 1.0, 1.2, 1.4, 1.4, 1.3, 1.1, 1.0, 0.8, 0.6],
    hvac_plumbing_electrical:   [0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.3, 1.2, 1.1, 1.0, 0.9, 0.7],
    other:                      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  cold: {
    hvac:                       [1.5, 1.4, 1.1, 0.8, 0.7, 0.6, 0.6, 0.7, 0.8, 1.0, 1.3, 1.5],
    hvac_plumbing:              [1.4, 1.3, 1.1, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4],
    hvac_plumbing_electrical:   [1.3, 1.2, 1.1, 0.9, 0.8, 0.8, 0.8, 0.8, 0.9, 1.0, 1.1, 1.3],
    other:                      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  mixed: {
    hvac:                       [1.2, 1.1, 0.9, 0.8, 0.9, 1.1, 1.3, 1.3, 1.1, 0.9, 0.8, 1.1],
    hvac_plumbing:              [1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.2, 1.0, 0.9, 0.9, 1.0],
    hvac_plumbing_electrical:   [1.1, 1.0, 0.9, 0.9, 1.0, 1.1, 1.1, 1.1, 1.0, 0.9, 0.9, 1.0],
    other:                      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  mild: {
    hvac:                       [0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8],
    hvac_plumbing:              [0.9, 0.9, 0.9, 1.0, 1.1, 1.1, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9],
    hvac_plumbing_electrical:   [0.9, 0.9, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.0, 1.0, 0.9, 0.9],
    other:                      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};

function getSeasonalDistribution(
  revenueGoal: number,
  services: ServiceOption[],
  state: string
): number[] {
  const zone = getClimateZone(state.toUpperCase());
  // Pick the primary service key for the profile
  const primaryService: string =
    services.includes("hvac_plumbing_electrical")
      ? "hvac_plumbing_electrical"
      : services.includes("hvac_plumbing")
      ? "hvac_plumbing"
      : services.includes("hvac")
      ? "hvac"
      : "other";

  const weights = SEASONALITY_PROFILES[zone][primaryService];
  const total = weights.reduce((a, b) => a + b, 0);
  const normalised = weights.map((w) => w / total);

  // Round to whole dollars; fix rounding error in last month
  const months = normalised.map((w) => Math.round(revenueGoal * w));
  const diff = revenueGoal - months.reduce((a, b) => a + b, 0);
  months[11] += diff;
  return months;
}

// ─── Helper to extract state from a website URL via a simple geocode lookup ──
// We use the ipapi / open-meteo approach: fetch the website, extract domain,
// then use a free geocoding API to get the state. As a fallback we use "mixed".
async function inferStateFromWebsite(url: string): Promise<string> {
  try {
    // Try to extract a city/state hint from the domain name itself
    // e.g. "dallashvac.com" → "TX", "chicagoplumbing.com" → "IL"
    const cityStateMap: Record<string, string> = {
      dallas: "TX", houston: "TX", austin: "TX", sanantonio: "TX",
      miami: "FL", orlando: "FL", tampa: "FL", jacksonville: "FL",
      phoenix: "AZ", tucson: "AZ", scottsdale: "AZ",
      chicago: "IL", springfield: "IL",
      newyork: "NY", nyc: "NY", brooklyn: "NY",
      losangeles: "CA", sandiego: "CA", sanfrancisco: "CA", sacramento: "CA",
      seattle: "WA", portland: "OR",
      denver: "CO", boulder: "CO",
      atlanta: "GA", charlotte: "NC", raleigh: "NC",
      nashville: "TN", memphis: "TN",
      minneapolis: "MN", milwaukee: "WI",
      detroit: "MI", cleveland: "OH", columbus: "OH", cincinnati: "OH",
      pittsburgh: "PA", philadelphia: "PA",
      boston: "MA", providence: "RI",
      lasvegas: "NV", reno: "NV",
      saltlake: "UT", slc: "UT",
      albuquerque: "NM",
      omaha: "NE", kansascity: "MO", stlouis: "MO",
      indianapolis: "IN", louisville: "KY",
      richmond: "VA", norfolk: "VA",
      baltimore: "MD", washington: "DC",
      newark: "NJ",
    };
    const domain = url.replace(/https?:\/\//, "").replace(/www\./, "").split(".")[0].toLowerCase().replace(/[-_\s]/g, "");
    for (const [city, state] of Object.entries(cityStateMap)) {
      if (domain.includes(city)) return state;
    }
  } catch {
    // ignore
  }
  return ""; // unknown → caller will use "mixed"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  const submitProfile = useMutation(api.onboarding.submitProfile);

  const [seasonalApplied, setSeasonalApplied] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    companyName: "",
    websiteUrl: "",
    services: [],
    otherServices: "",
    revenueGoal: "",
    splitType: "custom",
    marketingPercentage: "",
    customPercentage: "",
    channels: [],
    newChannels: [],
    noneExperienced: false,
    revenueMonths: Array(12).fill(0),
    allocations: {},
    allocationsUserEdited: false,
  });

  // ── Auto-apply seasonal distribution when entering step 3 ─────────────────
  useEffect(() => {
    if (step === 3 && !seasonalApplied && Number(formData.revenueGoal) > 0) {
      const allZero = formData.revenueMonths.every((m) => m === 0);
      if (allZero) {
        (async () => {
          const state = await inferStateFromWebsite(formData.websiteUrl);
          const months = getSeasonalDistribution(
            Number(formData.revenueGoal),
            formData.services,
            state || "mixed"
          );
          setFormData((prev) => ({ ...prev, revenueMonths: months, splitType: "custom" }));
          setSeasonalApplied(true);
        })();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Track previous upstream values to detect changes ──────────────────────
  const prevUpstreamRef = useRef({
    revenueGoal: formData.revenueGoal,
    marketingPercentage: formData.marketingPercentage,
    customPercentage: formData.customPercentage,
    channels: formData.channels,
  });

  // ── Reactive recalculation: when upstream values change, reset allocations ─
  useEffect(() => {
    const prev = prevUpstreamRef.current;
    const goalChanged = prev.revenueGoal !== formData.revenueGoal;
    const percChanged =
      prev.marketingPercentage !== formData.marketingPercentage ||
      prev.customPercentage !== formData.customPercentage;
    const channelsChanged =
      JSON.stringify(prev.channels) !== JSON.stringify(formData.channels);

    if ((goalChanged || percChanged || channelsChanged) && !formData.allocationsUserEdited) {
      // Recalculate allocations if they haven't been manually edited
      if (formData.channels.length > 0) {
        const newAllocs = getRecommendedAllocations(formData.channels, formData);
        setFormData((prev) => ({ ...prev, allocations: newAllocs }));
      }
    }

    prevUpstreamRef.current = {
      revenueGoal: formData.revenueGoal,
      marketingPercentage: formData.marketingPercentage,
      customPercentage: formData.customPercentage,
      channels: formData.channels,
    };
  }, [
    formData.revenueGoal,
    formData.marketingPercentage,
    formData.customPercentage,
    formData.channels,
  ]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const nextStep = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };
  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calculateSpend = (fd?: FormData) => {
    const data = fd ?? formData;
    if (!data.revenueGoal) return { year: 0, month: 0 };
    const goal = Number(data.revenueGoal);
    const perc =
      data.marketingPercentage === "custom"
        ? Number(data.customPercentage)
        : Number(data.marketingPercentage);
    if (!perc) return { year: 0, month: 0 };
    const yearly = goal * (perc / 100);
    return { year: yearly, month: yearly / 12 };
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  const getRecommendation = () => {
    const goal = Number(formData.revenueGoal || 0);
    if (goal <= 10000000)
      return { dr: 60, brand: 40, text: "Balancing direct response with local market presence." };
    return { dr: 50, brand: 50, text: "Market dominance requires equal focus on Brand and DR." };
  };

  // Change 4: % options are now 8, 10, 12 — always recommend 8%
  const getRecommendedPercentage = (): number => 8;

  const getRecommendedAllocations = (channels: string[], fd?: FormData) => {
    const data = fd ?? formData;
    const yearlyBudget = calculateSpend(data).year;
    if (!yearlyBudget || channels.length === 0) {
      return channels.reduce((acc, ch) => {
        acc[ch] = { isFlat: true, flatAmount: 0, customMonths: Array(12).fill(0) };
        return acc;
      }, {} as FormData["allocations"]);
    }
    const totalWeight = channels.reduce((sum, ch) => sum + (CHANNEL_WEIGHTS[ch] ?? 1), 0);
    return channels.reduce((acc, ch) => {
      const weight = CHANNEL_WEIGHTS[ch] ?? 1;
      const monthlyAmount =
        Math.round((yearlyBudget * (weight / totalWeight)) / 12 / 100) * 100;
      acc[ch] = {
        isFlat: true,
        flatAmount: monthlyAmount,
        customMonths: Array(12).fill(monthlyAmount),
      };
      return acc;
    }, {} as FormData["allocations"]);
  };

  const handleFinish = async () => {
    try {
      await submitProfile({
        firstName: formData.firstName,
        companyName: formData.companyName,
        revenueGoal: Number(formData.revenueGoal),
        splitType: formData.splitType,
        marketingPercentage:
          formData.marketingPercentage === "custom"
            ? -1
            : Number(formData.marketingPercentage),
        customPercentage:
          formData.customPercentage === "" ? undefined : Number(formData.customPercentage),
        channels: formData.channels,
        revenueMonths: formData.revenueMonths,
        allocations: JSON.stringify(formData.allocations),
      });
      router.push("/planner");
    } catch (error) {
      console.error("Failed to submit profile", error);
      alert("Uh oh! Looks like there was an issue saving. Check the terminal.");
    }
  };

  // ── Step Renderer ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1: Basics + Website + Services ─────────────────────────────
      case 1: {
        const toggleService = (val: ServiceOption) => {
          const current = formData.services;
          if (current.includes(val)) {
            setFormData({ ...formData, services: current.filter((s) => s !== val) });
          } else {
            setFormData({ ...formData, services: [...current, val] });
          }
        };

        const canProceed =
          formData.firstName.trim() &&
          formData.companyName.trim() &&
          formData.services.length > 0;

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">
              Let's start with the basics.
            </h2>

            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">
                  Your First Name
                </label>
                <Input
                  autoFocus
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">
                  Company Name
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Clover HVAC Services"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">
                  Company Website <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <Input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://www.yourcompany.com"
                />
                <p className="text-[12px] text-text-muted mt-1">
                  We use this to tailor your seasonal budget recommendations.
                </p>
              </div>

              {/* Services */}
              <div>
                <label className="block text-[15px] font-bold text-text-main mb-2">
                  What services do you provide?
                </label>
                <div className="space-y-2">
                  {SERVICE_OPTIONS.map((opt) => {
                    const isSelected = formData.services.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleService(opt.value)}
                        className={`w-full flex items-center p-3.5 rounded-[10px] border-2 text-left transition-all ${
                          isSelected
                            ? "bg-branding-row border-primary"
                            : "bg-surface border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p
                            className={`text-[15px] font-bold ${
                              isSelected ? "text-primary" : "text-text-main"
                            }`}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[12px] text-text-muted">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Other free-text */}
                {formData.services.includes("other") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <Input
                      autoFocus
                      value={formData.otherServices}
                      onChange={(e) =>
                        setFormData({ ...formData, otherServices: e.target.value })
                      }
                      placeholder="e.g. Roofing, Pest Control, Landscaping…"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={nextStep} disabled={!canProceed} className="w-full sm:w-auto">
                Next &rarr;
              </Button>
            </div>
          </div>
        );
      }

      // ── Step 2: Revenue Goal ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">
                What's your revenue goal this year?
              </h2>
              <p className="text-text-muted text-[15px]">
                This is your target — not your current revenue.
              </p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main font-bold text-[18px]">
                $
              </span>
              <Input
                autoFocus
                type="text"
                inputMode="decimal"
                className="pl-9 text-lg font-bold"
                value={
                  formData.revenueGoal
                    ? Number(formData.revenueGoal).toLocaleString("en-US")
                    : ""
                }
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");
                  if (/^\d*$/.test(rawValue)) {
                    setFormData({
                      ...formData,
                      revenueGoal: rawValue === "" ? "" : Number(rawValue),
                      // Reset allocations user-edited flag when revenue changes
                      allocationsUserEdited: false,
                    });
                  }
                }}
                placeholder="0"
              />
            </div>
            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formData.revenueGoal || formData.revenueGoal <= 0}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        );

      // ── Step 3: Revenue Distribution (Seasonality) ───────────────────────
      case 3: {
        const targetRev = Number(formData.revenueGoal || 0);
        const allocatedRev = formData.revenueMonths.reduce((a, b) => a + b, 0);
        const remainingRev = targetRev - allocatedRev;

        const handleRevChange = (idx: number, val: number) => {
          const newArr = [...formData.revenueMonths];
          newArr[idx] = val;
          setFormData({ ...formData, revenueMonths: newArr });
        };

        const distributeEvenly = () => {
          const evenAmount = Math.round(targetRev / 12);
          const months = Array(12).fill(evenAmount);
          months[11] += targetRev - evenAmount * 12;
          setFormData({ ...formData, revenueMonths: months, splitType: "even" });
        };

        const distributeSeasonally = async () => {
          const state = await inferStateFromWebsite(formData.websiteUrl);
          const months = getSeasonalDistribution(targetRev, formData.services, state || "mixed");
          setFormData({ ...formData, revenueMonths: months, splitType: "custom" });
        };

        const allZero = formData.revenueMonths.every((m) => m === 0);

        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">
                How should we spread your revenue goal across the year?
              </h2>
              <p className="text-text-muted text-[15px]">
                We've pre-filled a seasonality-based split based on your location and services.
                Adjust any month or use the options below.
              </p>
            </div>

            {/* Summary bar */}
            <div className="sticky top-0 bg-white p-4 shadow-sm z-10 rounded-[12px] border border-gray-100 flex justify-between items-center">
              <div className="space-x-3">
                <span className="text-sm font-bold text-text-muted">
                  Target:{" "}
                  <span className="text-text-main">{formatCurrency(targetRev)}</span>
                </span>
                <span className="text-sm font-bold text-text-muted">
                  Allocated:{" "}
                  <span className="text-primary">{formatCurrency(allocatedRev)}</span>
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  Math.abs(remainingRev) < 100
                    ? "bg-secondary/10 text-secondary"
                    : "bg-error/10 text-error"
                }`}
              >
                {remainingRev >= 0
                  ? `${formatCurrency(remainingRev)} Remaining`
                  : `${formatCurrency(Math.abs(remainingRev))} Over Goal!`}
              </div>
            </div>

            {/* Distribution action buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={distributeSeasonally}
                className="flex items-center gap-1.5 text-[13px] font-bold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors"
              >
                ✦ Use Seasonal Distribution
              </button>
              <button
                onClick={distributeEvenly}
                className="flex items-center gap-1.5 text-[13px] font-bold text-text-muted border border-gray-200 bg-surface hover:border-gray-300 px-3 py-1.5 rounded-full transition-colors"
              >
                Distribute Evenly
              </button>
            </div>

            {/* Monthly grid */}
            <div className="bg-surface rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4">
                Monthly Targets
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                  (m, idx) => (
                    <div key={m}>
                      <label className="block text-xs font-bold text-text-muted mb-1 text-center">
                        {m}
                      </label>
                      <Input
                        type="number"
                        value={formData.revenueMonths[idx] === 0 ? "" : formData.revenueMonths[idx]}
                        onChange={(e) => handleRevChange(idx, Number(e.target.value))}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        placeholder="0"
                        className="px-2 py-1 h-8 text-sm"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Next &rarr;</Button>
            </div>
          </div>
        );
      }

      // ── Step 4: Marketing % (now 8 / 10 / 12 / Custom) ──────────────────
      case 4: {
        const spend = calculateSpend();
        const recommendedPerc = getRecommendedPercentage(); // always 8

        // Pre-select 8% on first entry
        if (formData.marketingPercentage === "") {
          setTimeout(() => {
            setFormData((prev) =>
              prev.marketingPercentage === ""
                ? { ...prev, marketingPercentage: recommendedPerc }
                : prev
            );
          }, 0);
        }

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">
                What percentage of revenue will you invest into marketing?
              </h2>
              <p className="text-text-muted text-[15px]">
                We recommend{" "}
                <strong className="text-text-main">{recommendedPerc}%</strong> — the industry
                standard for established home service businesses. You can adjust below.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[8, 10, 12].map((perc) => {
                const isSelected = formData.marketingPercentage === perc;
                const isRecommended = perc === recommendedPerc;
                return (
                  <button
                    key={perc}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        marketingPercentage: perc,
                        customPercentage: "",
                        allocationsUserEdited: false,
                      })
                    }
                    className={`relative py-3 px-4 rounded-[8px] font-bold border transition-colors ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-surface text-text-main border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {isRecommended && (
                      <span
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isSelected ? "bg-white text-primary" : "bg-primary text-white"
                        }`}
                      >
                        Recommended
                      </span>
                    )}
                    {perc}%
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    marketingPercentage: "custom",
                    allocationsUserEdited: false,
                  })
                }
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-2"
              >
                <label className="block text-[13px] font-bold text-text-main mb-1.5">
                  Custom Percentage
                </label>
                <div className="relative">
                  <Input
                    autoFocus
                    type="number"
                    inputMode="decimal"
                    value={formData.customPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customPercentage: e.target.value === "" ? "" : Number(e.target.value),
                        allocationsUserEdited: false,
                      })
                    }
                    placeholder="e.g. 15"
                    className="pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">
                    %
                  </span>
                </div>
              </motion.div>
            )}

            {spend.year > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-app p-4 rounded-[8px] text-center border border-gray-100"
              >
                <p className="text-[15px] text-text-main">
                  That's{" "}
                  <strong className="font-bold text-primary">
                    {formatCurrency(spend.year)}
                  </strong>{" "}
                  for the year
                  <br />
                  <span className="text-text-muted text-[14px]">
                    or about {formatCurrency(spend.month)}/month.
                  </span>
                </p>
              </motion.div>
            )}

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={
                  !formData.marketingPercentage ||
                  (formData.marketingPercentage === "custom" && !formData.customPercentage)
                }
              >
                That's my number &rarr;
              </Button>
            </div>
          </div>
        );
      }

      // ── Step 5: Budget Split Recommendation (green cards) ────────────────
      case 5: {
        const rec = getRecommendation();
        const yearlyTotal = calculateSpend().year;
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">
                Here's how Clover recommends splitting your budget.
              </h2>
              <p className="text-text-muted text-[15px]">{rec.text}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Direct Response — dark green */}
              <div className="bg-primary rounded-[12px] p-6 shadow-sm">
                <p className="text-[13px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Direct Response
                </p>
                <p className="text-3xl font-heading font-bold text-white mb-2">{rec.dr}%</p>
                <p className="text-[15px] font-medium text-white">
                  {formatCurrency(yearlyTotal * (rec.dr / 100))}
                </p>
              </div>

              {/* Branding — lighter green */}
              <div className="bg-secondary rounded-[12px] p-6 shadow-sm">
                <p className="text-[13px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Branding
                </p>
                <p className="text-3xl font-heading font-bold text-white mb-2">{rec.brand}%</p>
                <p className="text-[15px] font-medium text-black/80">
                  {formatCurrency(yearlyTotal * (rec.brand / 100))}
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Got it &rarr;</Button>
            </div>
          </div>
        );
      }

      // ── Step 6: Channel Selection ────────────────────────────────────────
      case 6: {
        const toggleChannel = (channel: string) => {
          const arr = formData.channels;
          let newAllocs = { ...formData.allocations };
          if (arr.includes(channel)) {
            delete newAllocs[channel];
            setFormData({
              ...formData,
              channels: arr.filter((c) => c !== channel),
              allocations: newAllocs,
              allocationsUserEdited: false,
            });
          } else {
            newAllocs[channel] = { isFlat: true, flatAmount: 0, customMonths: Array(12).fill(0) };
            setFormData({
              ...formData,
              channels: [...arr, channel],
              allocations: newAllocs,
              allocationsUserEdited: false,
            });
          }
        };

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">
              Which marketing channels do you currently use?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 pb-2">
              {MARKETING_CHANNELS.map((ch) => {
                const isSelected = formData.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`flex items-center p-3 rounded-[8px] border text-left transition-colors ${
                      isSelected
                        ? "bg-branding-row border-primary"
                        : "bg-surface border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-primary border-primary text-white" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-[15px] font-medium ${
                        isSelected ? "text-primary" : "text-text-main"
                      }`}
                    >
                      {ch}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep} disabled={formData.channels.length === 0}>
                Next &rarr;
              </Button>
            </div>
          </div>
        );
      }

      // ── Step 7: Channel Experience ───────────────────────────────────────
      case 7: {
        const toggleNewChannel = (channel: string) => {
          const arr = formData.newChannels;
          if (arr.includes(channel)) {
            setFormData({ ...formData, newChannels: arr.filter((c) => c !== channel), noneExperienced: false });
          } else {
            setFormData({ ...formData, newChannels: [...arr, channel], noneExperienced: false });
          }
        };

        const toggleNoneExperienced = () => {
          setFormData({
            ...formData,
            noneExperienced: !formData.noneExperienced,
            newChannels: !formData.noneExperienced ? [] : formData.newChannels,
          });
        };

        const TESTABLE_CHANNELS = [
          "Google Ads (PPC)",
          "Social Media Ads (Meta/FB)",
          "Local Services Ads (LSA)",
          "SEO / Organic Search",
        ];
        const availableToTest = formData.channels.filter((ch) => TESTABLE_CHANNELS.includes(ch));

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-2">
                Which of these channels have you used before?
              </h2>
              <p className="text-text-muted text-[15px]">
                We'll tailor our budget coaching based on your experience.
              </p>
            </div>

            {availableToTest.length === 0 ? (
              <div className="bg-surface p-6 rounded-xl border border-gray-200 text-center">
                <p className="text-text-muted">
                  You didn't select any of our core coached channels (Google, LSA, SEO, Meta). You
                  can skip this step.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableToTest.map((ch) => {
                  const isSelected = formData.newChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleNewChannel(ch)}
                      disabled={formData.noneExperienced}
                      className={`w-full flex items-center p-4 rounded-[12px] border-2 text-left transition-all ${
                        formData.noneExperienced
                          ? "opacity-40 cursor-not-allowed bg-surface border-gray-200"
                          : isSelected
                          ? "bg-branding-row border-primary"
                          : "bg-surface border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                          isSelected && !formData.noneExperienced
                            ? "bg-primary border-primary text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && !formData.noneExperienced && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-[16px] font-bold ${
                          isSelected && !formData.noneExperienced
                            ? "text-primary"
                            : "text-text-main"
                        }`}
                      >
                        {ch}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={toggleNoneExperienced}
                  className={`w-full flex items-center p-4 rounded-[12px] border-2 text-left transition-all ${
                    formData.noneExperienced
                      ? "bg-branding-row border-primary"
                      : "bg-surface border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
                      formData.noneExperienced
                        ? "bg-primary border-primary text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.noneExperienced && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-[16px] font-bold ${
                      formData.noneExperienced ? "text-primary" : "text-text-main"
                    }`}
                  >
                    None — I'm starting fresh
                  </span>
                </button>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Next &rarr;</Button>
            </div>
          </div>
        );
      }

      // ── Step 8: Budget Allocation (reactive) ─────────────────────────────
      case 8: {
        const currentTargetSpend = calculateSpend().year;

        let allocatedAmount = 0;
        formData.channels.forEach((ch) => {
          const a = formData.allocations[ch];
          if (a) {
            allocatedAmount += a.isFlat
              ? a.flatAmount * 12
              : a.customMonths.reduce((sum, val) => sum + val, 0);
          }
        });
        const remaining = currentTargetSpend - allocatedAmount;

        const updateAllocation = (ch: string, field: string, val: any) => {
          setFormData({
            ...formData,
            allocationsUserEdited: true,
            allocations: {
              ...formData.allocations,
              [ch]: { ...formData.allocations[ch], [field]: val },
            },
          });
        };

        const updateCustomMonth = (ch: string, mIdx: number, val: number) => {
          const arr = [...formData.allocations[ch].customMonths];
          arr[mIdx] = val;
          updateAllocation(ch, "customMonths", arr);
        };

        // Auto-populate if all blank (first entry or after upstream change)
        const allBlank = formData.channels.every((ch) => {
          const a = formData.allocations[ch];
          return !a || (a.flatAmount === 0 && a.customMonths.every((v) => v === 0));
        });

        if (allBlank && formData.channels.length > 0) {
          setTimeout(() => {
            setFormData((prev) => {
              const stillBlank = prev.channels.every((ch) => {
                const a = prev.allocations[ch];
                return !a || (a.flatAmount === 0 && a.customMonths.every((v) => v === 0));
              });
              if (!stillBlank) return prev;
              return {
                ...prev,
                allocations: getRecommendedAllocations(prev.channels, prev),
              };
            });
          }, 0);
        }

        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto">
            <div>
              <h2 className="text-3xl font-heading font-bold text-text-main mb-1">
                Allocate your Marketing Budget
              </h2>
              <p className="text-text-muted text-[15px]">
                We've pre-filled recommended monthly amounts based on your budget and channels.
                Adjust any field to match your plan.
              </p>
            </div>

            <div className="sticky top-0 bg-white p-4 shadow-sm z-10 rounded-[12px] border border-gray-100 flex justify-between items-center">
              <div className="space-x-3">
                <span className="text-sm font-bold text-text-muted">
                  Target:{" "}
                  <span className="text-text-main">{formatCurrency(currentTargetSpend)}</span>
                </span>
                <span className="text-sm font-bold text-text-muted">
                  Allocated:{" "}
                  <span className="text-primary">{formatCurrency(allocatedAmount)}</span>
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  Math.abs(remaining) < 100
                    ? "bg-secondary/10 text-secondary"
                    : "bg-error/10 text-error"
                }`}
              >
                {remaining >= 0
                  ? `${formatCurrency(remaining)} Remaining`
                  : `${formatCurrency(Math.abs(remaining))} Over Budget!`}
              </div>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto px-2 pb-4">
              {formData.channels.map((ch) => {
                const alloc = formData.allocations[ch];
                if (!alloc) return null;
                const totalForCard = alloc.isFlat
                  ? alloc.flatAmount * 12
                  : alloc.customMonths.reduce((s, v) => s + v, 0);

                return (
                  <div
                    key={ch}
                    className="bg-surface rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden"
                  >
                    {ch === "Local Services Ads (LSA)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-[13px] border border-blue-100">
                        <strong>💡 LSA Strategy:</strong> Since you're new to LSA, leave this{" "}
                        <strong>blank (or $0)</strong> for your marketing budget calculations if
                        you don't know your spend limit yet. We recommend securing as many
                        high-quality leads as possible, and you can dispute unqualified ones!
                      </div>
                    )}
                    {ch === "Google Ads (PPC)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-[13px] border border-green-100">
                        <strong>💡 Testing PPC?</strong> Start with a modest test budget for 30–60
                        days to gather data before scaling. We'll help you optimise from there.
                      </div>
                    )}
                    {ch === "SEO / Organic Search" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-purple-50 text-purple-800 rounded-lg text-[13px] border border-purple-100">
                        <strong>💡 New to SEO?</strong> SEO is a long-term play. Set a flat
                        monthly retainer that you are comfortable sustaining for at least 6 to 12
                        months.
                      </div>
                    )}
                    {ch === "Social Media Ads (Meta/FB)" && formData.newChannels.includes(ch) && (
                      <div className="mb-4 p-3 bg-orange-50 text-orange-800 rounded-lg text-[13px] border border-orange-100">
                        <strong>💡 Social Strategy:</strong> When breaking into Social Ads, focus
                        on a stable, flat monthly budget to test creative assets before ramping up
                        spend.
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-text-main">
                          {ch}{" "}
                          <span className="text-sm font-medium text-text-muted ml-2">
                            ({formatCurrency(totalForCard)}/yr)
                          </span>
                        </h3>
                        <p className="text-[12px] text-text-muted mt-0.5">
                          Recommended — adjust to match your plan
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alloc.isFlat}
                          onChange={(e) => updateAllocation(ch, "isFlat", e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-text-muted">
                          Same amount every month
                        </span>
                      </label>
                    </div>

                    {alloc.isFlat ? (
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-text-main">$</span>
                        <Input
                          type="number"
                          placeholder="Monthly amount"
                          value={alloc.flatAmount === 0 ? "" : alloc.flatAmount}
                          onChange={(e) =>
                            updateAllocation(ch, "flatAmount", Number(e.target.value))
                          }
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          className="max-w-[200px]"
                        />
                        <span className="text-text-muted text-sm font-medium">/ month</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(
                          (m, idx) => (
                            <div key={m}>
                              <label className="block text-xs font-bold text-text-muted mb-1 text-center">
                                {m}
                              </label>
                              <Input
                                type="number"
                                value={
                                  alloc.customMonths[idx] === 0 ? "" : alloc.customMonths[idx]
                                }
                                onChange={(e) =>
                                  updateCustomMonth(ch, idx, Number(e.target.value))
                                }
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                placeholder="0"
                                className="px-2 py-1 h-8 text-sm"
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>Next &rarr;</Button>
            </div>
          </div>
        );
      }

      // ── Step 9: Review & Submit ──────────────────────────────────────────
      case 9: {
        const finalSpend = calculateSpend();
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-text-main">You're all set!</h2>

            <div className="bg-surface rounded-[12px] p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-muted text-[14px]">Company Name</span>
                <span className="font-bold text-text-main">{formData.companyName}</span>
              </div>
              {formData.websiteUrl && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-text-muted text-[14px]">Website</span>
                  <span className="font-bold text-text-main text-right max-w-[60%] truncate">
                    {formData.websiteUrl}
                  </span>
                </div>
              )}
              {formData.services.length > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-text-muted text-[14px]">Services</span>
                  <span className="font-bold text-text-main text-right">
                    {formData.services
                      .map((s) => SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s)
                      .join(", ")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-muted text-[14px]">Revenue Goal</span>
                <span className="font-bold text-text-main">
                  {formatCurrency(Number(formData.revenueGoal))}
                </span>
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
              <Button variant="ghost" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={handleFinish} className="w-full sm:w-auto">
                Go to my budget planner <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-bg-app flex flex-col relative overflow-hidden">
      {/* Progress bar */}
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
