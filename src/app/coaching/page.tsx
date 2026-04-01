"use client";

import React from "react";
import TopNav from "@/components/TopNav";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

export default function CoachingPage() {
  const contractor = useQuery(api.budget.getContractor);

  // Projected 16% net profit based on revenue goal
  const projectedNetProfit = contractor?.revenueGoal ? contractor.revenueGoal * 0.16 : 0;

  return (
    <div className="bg-background text-on-surface min-h-[100dvh] font-body selection:bg-secondary-container selection:text-on-secondary-container">
      <TopNav />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 relative">
        {/* Blueprint Decor */}
        <div className="absolute inset-0 blueprint-grid pointer-events-none opacity-[0.05]"></div>

        {/* Hero Section: Editorial Layout */}
        <section className="mt-12 mb-24 grid grid-cols-12 gap-6 items-end relative z-10">
          <div className="col-span-12 lg:col-span-8">
            <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase mb-6 rounded-lg">Architecture for Profit</span>
            <h1 className="text-6xl md:text-8xl font-headline font-bold text-on-surface leading-[0.9] tracking-tighter mb-8 shadow-sm">
              Fuel Your Growth with <span className="text-primary">Clover Coaching</span>
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
              We don't just give you a spreadsheet. We build the operational framework that turns construction businesses into high-yield assets.
            </p>
          </div>
          
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_30px_rgba(25,28,25,0.06)] border-l-4 border-primary">
              <div className="text-5xl font-headline font-bold text-primary mb-2">35%</div>
              <div className="text-on-surface-variant font-medium">Avg. Annual Revenue Growth</div>
              <div className="mt-4 h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[35%]"></div>
              </div>
              <div className="mt-2 text-xs text-on-surface-variant/60 flex justify-between">
                <span>Clover Partners</span>
                <span>Industry Avg (10%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Net Profit Target: Asymmetric Section */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <img 
              alt="Modern geometric building structure with clean lines" 
              className="relative z-10 rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-video shadow-2xl" 
              src="https://growwithclover.com/wp-content/uploads/2025/08/home-new2.webp"
            />
          </div>
          <div className="lg:pl-12">
            <h2 className="text-4xl font-headline font-bold text-on-surface mb-6 leading-tight">Precision Benchmarks: <br/>The 16% Rule</h2>
            <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
              The average contractor operates on thin margins and high stress. Our coaching pivots your focus from "Busyness" to "Profitability." We align your daily operations to hit a consistent <span className="text-primary font-bold">16% Net Profit</span> margin, regardless of your current scale.
            </p>

            {/* Dynamic Calculation Block */}
            <div className="mb-8 p-5 bg-primary-container/10 border border-primary/20 rounded-xl relative overflow-hidden shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 ml-2">Projected Profit Potential</p>
                <div className="text-4xl font-black font-headline text-on-surface ml-2">
                    {contractor?.revenueGoal ? formatCurrency(projectedNetProfit) : "Calculating..."}
                </div>
                <p className="text-sm text-on-surface-variant mt-2 font-medium ml-2">
                    Based on your target <strong>{contractor?.revenueGoal ? formatCurrency(contractor.revenueGoal) : "$0"}</strong> annual revenue goal.
                </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <span className="font-medium text-on-surface">Data-Driven Resource Allocation</span>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                <span className="font-medium text-on-surface">Structural Overhead Reduction</span>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <span className="font-medium text-on-surface">Precision Bidding Workflows</span>
              </div>
            </div>
          </div>
        </section>

        {/* Coaching Programs: Bento Grid */}
        <section className="mb-32 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
            <h2 className="text-4xl font-headline font-bold text-on-surface">Our Coaching Programs</h2>
            <p className="text-on-surface-variant font-medium">Select the tier that matches your current blueprint.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container p-8 rounded-2xl flex flex-col hover:bg-surface-container-highest transition-colors cursor-pointer group shadow-sm border border-surface-container-high">
              <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Business Coaching</h3>
              <p className="text-on-surface-variant mb-8 flex-grow leading-relaxed">
                  One-on-one sessions focused on scaling your workforce, optimizing operations, and mastering financial clarity.
              </p>
              <a href="https://growwithclover.com/business-coaching-growth-accelerator/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all w-max mt-auto">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            
            <div className="bg-primary text-on-primary p-8 rounded-2xl flex flex-col shadow-xl shadow-primary/20 scale-105 z-10">
              <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-8 shadow-sm">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Strategy & Media</h3>
              <p className="text-on-primary/80 mb-8 flex-grow leading-relaxed">
                  We optimize your branding by taking full care of traditional media, pushing reach and frequency to ensure people choose you when the time is right.
              </p>
              <a href="https://meetings.growwithclover.com/meetings/scott1453/media-buying-discovery-call?uuid=26468787-53ed-40c2-8e10-0652fa733ed3&_gl=1*2vlw2b*_gcl_au*OTc3OTc3NDEwLjE3Njk1NDY4MDU." target="_blank" rel="noopener noreferrer" className="bg-surface-container-lowest text-primary px-6 py-3 rounded-xl font-bold hover:bg-secondary-container transition-colors shadow-lg mt-auto w-max inline-block">
                  Accelerate Now
              </a>
            </div>
            
            <div className="bg-surface-container p-8 rounded-2xl flex flex-col hover:bg-surface-container-highest transition-colors cursor-pointer group shadow-sm border border-surface-container-high">
              <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">Catapult Contractor</h3>
              <p className="text-on-surface-variant mb-8 flex-grow leading-relaxed">
                  The one complete program that takes contractors from chaos to control with our proven 90-Day onboarding system and complete support framework.
              </p>
              <a href="https://growwithclover.com/catapultplus/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all w-max mt-auto">
                  View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </section>

        {/* Stats: Tonal Layering */}
        <section className="bg-surface-container-low rounded-3xl p-12 mb-32 relative overflow-hidden z-10 border border-surface-container">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none hidden md:block">
            <span className="material-symbols-outlined text-[350px] absolute -top-12 right-0 text-on-surface">monitoring</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-12">By The Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div>
                <div className="text-6xl font-headline font-bold text-primary mb-2">35%</div>
                <div className="text-on-surface-variant uppercase text-xs font-bold tracking-widest">Revenue Growth</div>
                <p className="mt-4 text-sm text-on-surface-variant/70 leading-relaxed">Partner average annual increase in gross revenue.</p>
              </div>
              <div>
                <div className="text-6xl font-headline font-bold text-primary mb-2">16%</div>
                <div className="text-on-surface-variant uppercase text-xs font-bold tracking-widest">Net Profit</div>
                <p className="mt-4 text-sm text-on-surface-variant/70 leading-relaxed">Target bottom-line profitability maintained by our members.</p>
              </div>
              <div>
                <div className="text-6xl font-headline font-bold text-primary mb-2">4.2x</div>
                <div className="text-on-surface-variant uppercase text-xs font-bold tracking-widest">LTV Increase</div>
                <p className="mt-4 text-sm text-on-surface-variant/70 leading-relaxed">Improvement in Lifetime Value per customer through systems.</p>
              </div>
              <div>
                <div className="text-6xl font-headline font-bold text-primary mb-2">240+</div>
                <div className="text-on-surface-variant uppercase text-xs font-bold tracking-widest">Graduates</div>
                <p className="mt-4 text-sm text-on-surface-variant/70 leading-relaxed">Contractors who have completed our Precision Builder track.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section: Glassmorphism / Gradient */}
        <section className="bg-gradient-to-br from-primary to-[#004d1f] p-12 md:p-24 rounded-3xl text-center relative overflow-hidden z-10 shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-on-primary mb-8 leading-tight">Ready to build a business, <br/>not just a job?</h2>
            <p className="text-xl text-on-primary/80 mb-12 leading-relaxed">
                Schedule your complimentary 30-minute Strategy Call with our lead coaching architect to review your current numbers and future potential.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                  href="https://growwithclover.com/book-a-call/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-surface-container-lowest text-primary px-10 py-5 rounded-xl font-bold text-lg hover:shadow-xl transition-all active:scale-95 shadow-md inline-block"
              >
                  Schedule a Strategy Call
              </a>
              <a 
                  href="/Contractor-Secrets-Blackbook.pdf" 
                  download="Contractor-Secrets-Blackbook.pdf"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border-2 border-on-primary text-on-primary px-10 py-5 rounded-xl font-bold text-lg hover:bg-on-primary hover:text-primary transition-all inline-block"
              >
                  Download Contractor Blackbook
              </a>
            </div>
          </div>
        </section>

        {/* Footer: Clean & Professional */}
        <footer className="mt-32 pt-12 border-t border-outline-variant/30 text-on-surface-variant relative z-10 pb-8 lg:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 lg:gap-8">
            <div className="text-lg font-black font-headline text-on-surface uppercase tracking-wider">
                Clover Growth Partners
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Success Stories</a>
            </div>
            <div className="text-xs">
                © {new Date().getFullYear()} Clover Growth Partners. Precision Built.
            </div>
          </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .blueprint-grid {
          background-image: radial-gradient(circle, #3f4a3e 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}} />
    </div>
  );
}
