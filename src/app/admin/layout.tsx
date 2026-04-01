"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getSidebarStyle = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    if (isActive) {
      return "flex items-center gap-3 px-4 py-3 text-[#008037] dark:text-[#9df493] font-bold border-r-4 border-[#008037] bg-[#edeee9] dark:bg-stone-800 transition-colors rounded-l-md";
    }
    return "flex items-center gap-3 px-4 py-3 text-[#3f4a3e] dark:text-stone-400 font-medium hover:bg-[#edeee9] dark:hover:bg-stone-800 transition-colors rounded-l-md";
  };

  return (
    <div className="bg-surface text-on-surface overflow-hidden min-h-screen">
      <div className="flex h-screen overflow-hidden font-body">
        
        {/* SideNavBar */}
        <aside className="flex flex-col h-full py-8 px-4 w-64 border-r-0 bg-[#f8faf5] dark:bg-stone-950 shrink-0">
          <div className="mb-10 px-4">
            <div className="flex items-center gap-3">
              <img 
                alt="Clover Logo" 
                className="w-8 h-8" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHXA_PR8isrBBLjpjFXfCgVcruOpL9mEjz0UmmhvM2XWHIsOZL-7awxWCqCo8e1s6yevo8CHH2trwfa_if8to0TSFx9nNYobN1Fz8sS-Jp2aSa5c_Hdf7i5GOBDxH8GEguejFNXzjOFQr2ubUFAMBa8nEBMs5qkOdOmi9k2bkxMIJvWI_3QrlayjH-oj0t2IiVBolxA3Yoodtk2NEXtDoeDzw9sv6vz-fNSB2qsx0VhNH-CIrRlNxMCWQCv9nHopvyL2m3xuuIrPg"
              />
              <div>
                <h1 className="text-[#008037] font-black tracking-tight text-xl leading-none">Clover Coaches</h1>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Precision Builder Admin</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 flex flex-col">
            <Link href="/admin" className={getSidebarStyle("/admin", true)}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin' ? "'FILL' 1" : "" }}>group</span>
              <span className="font-headline font-bold text-lg">All Contractors</span>
            </Link>
            
            <Link href="/admin/pending" className={getSidebarStyle("/admin/pending")}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin/pending' ? "'FILL' 1" : "" }}>pending_actions</span>
              <span className="font-headline font-bold text-lg">Pending</span>
            </Link>
            
            <Link href="/admin/reports" className={getSidebarStyle("/admin/reports")}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin/reports' ? "'FILL' 1" : "" }}>bar_chart</span>
              <span className="font-headline font-bold text-lg">Reports</span>
            </Link>
            
            <Link href="/admin/settings" className={`${getSidebarStyle("/admin/settings")} mt-auto`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/admin/settings' ? "'FILL' 1" : "" }}>settings</span>
              <span className="font-headline font-bold text-lg">Settings</span>
            </Link>
            
            <Link href="/planner" className="flex items-center gap-3 px-4 py-3 text-[#3f4a3e] dark:text-stone-400 font-medium hover:bg-[#edeee9] dark:hover:bg-stone-800 transition-colors rounded-l-md mt-6 border-t border-outline-variant/20 pt-4">
              <span className="material-symbols-outlined">exit_to_app</span>
              <span className="font-headline font-bold text-sm">Exit Admin View</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* TopNavBar */}
          <header className="flex justify-between items-center px-8 py-4 w-full top-0 sticky bg-[#f8faf5]/80 dark:bg-stone-950/80 backdrop-blur-md shadow-[0px_10px_30px_rgba(25,28,25,0.06)] z-10">
            <div className="flex-1 flex items-center gap-6">
              <h2 className="hidden md:block font-body text-sm font-bold text-[#008037] uppercase tracking-widest">Admin Dashboard</h2>
              <div className="relative w-full max-w-md group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border-none focus:ring-2 focus:ring-[#008037] rounded-lg text-sm font-body" 
                  placeholder="Search..." 
                  type="text" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6 ml-4">
              <button className="text-[#3f4a3e] hover:text-[#006429] transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              </button>
              <button className="text-[#3f4a3e] hover:text-[#006429] transition-all">
                <span className="material-symbols-outlined">help</span>
              </button>
              
              <div className="h-8 w-[1px] bg-outline-variant/30"></div>
              
              <div className="flex items-center gap-3">
                <img 
                  alt="Coach Profile" 
                  className="w-9 h-9 rounded-full bg-primary-container object-cover border-2 border-primary" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeY0--QOsvMwLNF1Fr7gOrDcNwjkKtiTWLNe5vDbP5EnZ9sPTdoai-ID8TZsUyf9Uhsh0B-r8U75wNcuJug-E72F82VTfj7ZT8EmGxgaVvhE11pedxV0jnrVImCKkLNK9_KY5AmFPuYFE0BpCHlJvACuKxIy_NFpaEKdBUQz2uFry09jPSWvZzhVPLhPhLBl74htdPqp_1N21dLjNCkU3i-7KsoQZQEZdk5TL86WoN7PahTZevDFmIrMQbAG_jZKuPmRbb5YXMaEY"
                />
              </div>
            </div>
          </header>

          {/* Render the specific page content */}
          {children}
          
        </main>
      </div>
    </div>
  );
}
