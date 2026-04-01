"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  // Helper function to apply active styling
  const getNavStyle = (route: string) => {
    const isActive = pathname.startsWith(route);
    if (isActive) {
      return "text-primary font-bold font-headline uppercase tracking-widest text-sm";
    }
    return "text-on-surface-variant font-headline uppercase tracking-widest text-sm hover:text-primary transition-colors";
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-clip-padding backdrop-blur-xl bg-opacity-90 bg-surface-container-lowest border-b border-surface-container shadow-sm">
      {/* Left Side: Logo */}
      <div className="flex items-center gap-4 shrink-0">
        <h1 className="font-headline font-bold text-xl tracking-tight text-primary hidden sm:block">
          Marketing Budget
        </h1>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden lg:flex gap-8 items-center mx-auto absolute left-1/2 -translate-x-1/2">
        <Link href="/planner" className={getNavStyle("/planner")}>
          Planner
        </Link>
        <Link href="/actuals" className={getNavStyle("/actuals")}>
          Actual
        </Link>
        <Link href="/coaching" className={getNavStyle("/coaching")}>
          Coaching
        </Link>
      </nav>
      
      {/* Right Side: Search, Notifications, Settings, Profile */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="relative hidden md:block w-64">
           <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm border-r border-outline-variant/30 pr-2">search</span>
           <input 
             type="text" 
             placeholder="Search project data..." 
             className="w-full bg-surface-container-high rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant font-body"
           />
        </div>

        <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        <button className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
        
        <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors hover:shadow-md cursor-pointer bg-surface-container block shrink-0">
          <img 
            src="https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=100&auto=format&fit=crop" 
            alt="contractor profile" 
            className="w-full h-full object-cover" 
          />
        </Link>
      </div>
    </header>
  );
}
