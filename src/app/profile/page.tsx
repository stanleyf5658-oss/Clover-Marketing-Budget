"use client";

import React, { useState, useEffect, useRef } from "react";
import TopNav from "@/components/TopNav";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

const INDUSTRY_OPTIONS = [
  "HVAC",
  "Roofing Solutions",
  "Plumbing",
  "General Contracting",
  "Landscaping",
  "Electrical"
];

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const contractor = useQuery(api.budget.getContractor);
  const updateContractor = useMutation(api.budget.updateContractor);
  
  // File inputs for multiple modal interactions
  const dropInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // General Page State
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  
  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    industry: "HVAC",
    address: "",
    website: "",
    revenueGoal: 0,
    avatarUrl: ""
  });

  // Sync loaded data to local state
  useEffect(() => {
    if (contractor) {
      setFormData({
        firstName: contractor.firstName || "",
        lastName: contractor.lastName || "",
        email: contractor.email || "",
        phone: contractor.phone || "",
        companyName: contractor.companyName || "",
        industry: contractor.industry || "HVAC",
        address: contractor.address || "",
        website: contractor.website || "",
        revenueGoal: contractor.revenueGoal || 0,
        avatarUrl: contractor.avatarUrl || ""
      });
    }
  }, [contractor]);

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIndustryToggle = (option: string) => {
    const currentSelected = formData.industry ? formData.industry.split(',').map(s => s.trim()).filter(Boolean) : [];
    let newSelected;
    if (currentSelected.includes(option)) {
       newSelected = currentSelected.filter(item => item !== option);
    } else {
       newSelected = [...currentSelected, option];
    }
    handleChange("industry", newSelected.join(', '));
  };

  // Generalized File Handler with HTML5 Canvas Compression
  const processImageFile = (file: File | undefined) => {
    if (!file) return;
    
    // Prevent non-images
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create an off-thread canvas for resize compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio fit
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress strictly to WebP @ 70% quality (Results in ~15-30KB string, highly safe for 1MB DB limit)
          const compressedBase64Str = canvas.toDataURL("image/webp", 0.7);
          handleChange("avatarUrl", compressedBase64Str);
          setShowAvatarModal(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!contractor) return;
    setIsSaving(true);
    try {
      await updateContractor({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        industry: formData.industry,
        address: formData.address,
        website: formData.website,
        revenueGoal: formData.revenueGoal,
        avatarUrl: formData.avatarUrl
      });
      setTimeout(() => setIsSaving(false), 500);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  if (contractor === undefined) {
    return (
      <div className="bg-background min-h-screen">
        <TopNav />
        <div className="flex items-center justify-center p-32">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-[100dvh] font-body selection:bg-secondary-container selection:text-on-secondary-container relative overflow-hidden">
      <TopNav />
      
      {/* Absolute Architecture Watermark */}
      <div className="absolute top-32 left-1/4 select-none pointer-events-none opacity-[0.03] z-0">
          <h1 className="text-[140px] font-headline font-black uppercase tracking-tighter whitespace-nowrap">Architecture</h1>
      </div>

      <main className="pt-28 pb-24 max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-12">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            <h1 className="text-xl font-headline font-bold text-on-surface mb-2">Account &<br/>Precision Settings</h1>
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">Manage your structural defaults and operational benchmarks from one command center.</p>

            <nav className="flex flex-col gap-1 mb-12">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors border-l-4 ${activeTab === 'profile' ? 'bg-surface-container-low text-primary border-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface border-transparent'}`}
                >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "" }}>person</span>
                    Profile
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors border-l-4 mt-1 ${activeTab === 'security' ? 'bg-surface-container-low text-primary border-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface border-transparent'}`}
                >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : "" }}>security</span>
                    Security
                </button>
            </nav>

            <div className="mt-auto space-y-2">
                <a href="mailto:media@growwithclover.com" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface rounded-lg font-medium transition-colors w-full cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">help</span>
                    Support
                </a>
                <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error rounded-lg font-medium transition-colors w-full text-left">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign Out
                </button>

                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="mt-6 w-full bg-[#006429] hover:bg-[#004d1f] text-white px-6 py-4 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                           <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                           Saving...
                        </>
                    ) : 'Save Changes'}
                </button>
            </div>
        </aside>

        {/* Center Forms Column */}
        <div className="flex-1 flex flex-col gap-8 w-full max-w-4xl">
            
            {/* -------------------- PROFILE TAB -------------------- */}
            {activeTab === 'profile' && (
              <>
                {/* Profile Information */}
                <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 className="text-2xl font-headline font-bold text-on-surface">Profile Information</h2>
                            <p className="text-sm text-on-surface-variant mt-1">Personal identification and contact touchpoints.</p>
                        </div>
                        
                        {/* AVATAR UPLOAD TRIGGER */}
                        <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                            <div className="w-20 h-20 rounded-2xl bg-surface-container overflow-hidden shadow-sm">
                                <img src={formData.avatarUrl || contractor?.avatarUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" alt="Profile" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-on-surface-variant">First Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all"
                                value={formData.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-on-surface-variant">Last Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all"
                                value={formData.lastName}
                                onChange={(e) => handleChange("lastName", e.target.value)}
                                placeholder="Thorne"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <label className="text-sm font-bold text-on-surface-variant">Email Address</label>
                            <input 
                                type="email" 
                                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="m.thorne@precisionbuilders.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-on-surface-variant">Phone Number</label>
                            <input 
                                type="tel" 
                                className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+1 (555) 234-8901"
                            />
                        </div>
                    </div>
                </section>

                {/* Company Details */}
                <section className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                    <div className="mb-10">
                        <h2 className="text-2xl font-headline font-bold text-on-surface">Company Details & Financials</h2>
                        <p className="text-sm text-on-surface-variant mt-1">Firm structure, online footprint, and raw operational metrics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-on-surface-variant">Business Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-surface-container-lowest border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all shadow-sm"
                                value={formData.companyName}
                                onChange={(e) => handleChange("companyName", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-on-surface-variant">Industry Sectors</label>
                            <div 
                               className="w-full bg-surface-container-lowest border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all shadow-sm cursor-pointer flex justify-between items-center"
                               onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                            >
                                <span className="truncate">{formData.industry || "Select Industries..."}</span>
                                <span className="material-symbols-outlined text-on-surface-variant pointer-events-none">expand_more</span>
                            </div>
                            
                            {/* Custom Mutli-Select Component */}
                            {showIndustryDropdown && (
                               <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-surface-container shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1 max-h-48 overflow-y-auto">
                                   {INDUSTRY_OPTIONS.map(opt => {
                                      let isSelected = false;
                                      if (formData.industry) {
                                          isSelected = formData.industry.split(',').map(s=>s.trim()).includes(opt);
                                      }
                                      return (
                                         <div 
                                            key={opt} 
                                            onClick={() => handleIndustryToggle(opt)} 
                                            className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors"
                                         >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                                                {isSelected && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                                            </div>
                                            <span className="text-sm font-medium">{opt}</span>
                                         </div>
                                      )
                                   })}
                               </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-on-surface-variant">Address</label>
                            <input 
                                type="text" 
                                className="w-full bg-surface-container-lowest border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all shadow-sm"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                placeholder="782 Industrial Pkwy, Austin TX"
                            />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-on-surface-variant">Website</label>
                            <div className="flex items-center">
                               <div className="bg-surface-container px-4 py-3 rounded-l-xl border-y border-l border-outline-variant/20 text-on-surface-variant text-sm shadow-sm font-medium">https://</div>
                               <input 
                                   type="url" 
                                   className="w-full bg-surface-container-lowest border-y border-r border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-r-xl px-4 py-3 text-on-surface outline-none transition-all shadow-sm"
                                   value={formData.website}
                                   onChange={(e) => handleChange("website", e.target.value)}
                                   placeholder="precisionbuilders.com"
                               />
                            </div>
                        </div>

                        {/* Revenue Goal Integration */}
                        <div className="space-y-2 md:col-span-2 mt-4 pt-6 border-t border-outline-variant/20">
                            <label className="text-sm font-bold text-on-surface-variant">Annual Revenue Goal</label>
                            <div className="bg-[#004d1f] p-8 rounded-xl relative overflow-hidden flex flex-col justify-center shadow-md">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                                <span className="text-[10px] tracking-widest uppercase text-white/70 block mb-2 font-bold relative z-10 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[14px]">flag</span> TARGET REVENUE
                                </span>
                                <div className="relative z-10 flex items-center">
                                    <span className="text-5xl font-headline font-black text-white/40 absolute pointer-events-none">$</span>
                                    <input 
                                        type="text" 
                                        className="bg-transparent text-5xl w-full pl-10 font-black font-headline text-white outline-none focus:bg-white/5 rounded-lg py-1 -ml-2 transition-colors"
                                        value={formatCurrency(formData.revenueGoal || 0).replace('$', '')}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^0-9]/g, '');
                                            handleChange("revenueGoal", parseInt(raw) || 0);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Platform Layout Preference */}
                <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-on-surface mb-1 flex items-center gap-2"><span className="material-symbols-outlined text-primary">view_quilt</span> Default Interface Setting</h3>
                        <p className="text-sm text-on-surface-variant">Toggle standard behavior for your main budgeting terminal.</p>
                    </div>
                    <div className="flex bg-surface-container p-1 rounded-xl shadow-inner w-48">
                        <button className="flex-1 py-2 bg-background text-on-surface font-bold text-sm rounded-lg shadow-sm border border-outline-variant/10">Table</button>
                        <button className="flex-1 py-2 text-on-surface-variant font-bold text-sm hover:bg-white/5 rounded-lg transition-colors">Card</button>
                    </div>
                </section>
              </>
            )}

            {/* -------------------- SECURITY TAB -------------------- */}
            {activeTab === 'security' && (
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 flex flex-col gap-10">
                  <div>
                      <h2 className="text-2xl font-headline font-bold text-on-surface">Data Shielding & Access</h2>
                      <p className="text-sm text-on-surface-variant mt-1">Protect your financial architecture and mandate operational login gates.</p>
                  </div>

                  <div className="space-y-4 max-w-xl">
                      <div className="space-y-2">
                          <label className="text-sm font-bold text-on-surface-variant">Primary Account Email</label>
                          <input 
                              type="email" 
                              className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-on-surface outline-none transition-all shadow-inner"
                              value={formData.email}
                              onChange={(e) => handleChange("email", e.target.value)}
                          />
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-2">
                             <span className="material-symbols-outlined text-[14px]">info</span> Changing this alters your login. We’ll email a confirmation code.
                          </p>
                      </div>

                      <div className="pt-6 border-t border-outline-variant/20 mt-8 mb-4">
                         <h3 className="text-sm font-bold text-on-surface-variant mb-4">Account Password</h3>
                         <button 
                            onClick={() => alert("Verification code strictly dispatched to current primary email for password reset.")}
                            className="w-full flex justify-between items-center p-4 bg-background border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors shadow-sm"
                          >
                              <div className="flex items-center gap-3 text-on-surface">
                                  <span className="material-symbols-outlined text-on-surface-variant">lock_reset</span>
                                  <div className="text-left">
                                      <div className="font-bold text-sm">Force Password Reset</div>
                                      <div className="text-xs text-on-surface-variant mt-1">Dispatch an email to update encryption keys.</div>
                                  </div>
                              </div>
                              <span className="material-symbols-outlined text-on-surface-variant px-2">chevron_right</span>
                          </button>
                      </div>
                  </div>
              </section>
            )}

        </div>
      </main>

      {/* AVATAR UPLOAD OVERLAY MODAL */}
      {showAvatarModal && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowAvatarModal(false)}>
             <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                 
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-headline font-bold text-on-surface">Upload Precision Avatar</h2>
                    <button onClick={() => setShowAvatarModal(false)} className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant">
                       <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                 </div>

                 {/* DND Target Drop Zone */}
                 <div 
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => dropInputRef.current?.click()}
                    className={`w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low'}`}
                 >
                     <span className={`material-symbols-outlined text-4xl ${dragActive ? 'text-primary' : 'text-on-surface-variant'}`}>cloud_upload</span>
                     <p className="text-sm font-bold text-on-surface mb-1">Drag & Drop Image Here</p>
                     <p className="text-xs text-on-surface-variant px-8 text-center">or click to browse your system (JPG, PNG)</p>
                     
                     {/* Hidden General File Upload Input */}
                     <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={dropInputRef}
                         onChange={(e) => processImageFile(e.target.files?.[0])}
                     />
                 </div>

                 <div className="flex items-center w-full my-6 gap-4">
                     <div className="h-px bg-outline-variant/20 flex-1"></div>
                     <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">OR</span>
                     <div className="h-px bg-outline-variant/20 flex-1"></div>
                 </div>

                 {/* Direct Camera Activation Button */}
                 <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full bg-[#006429] hover:bg-[#004d1f] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
                 >
                     <span className="material-symbols-outlined">photo_camera</span>
                     Directly Take Photo
                 </button>

                 {/* Hidden Specific Camera Environment Input */}
                 <input 
                     type="file" 
                     accept="image/*" 
                     capture="environment" 
                     className="hidden" 
                     ref={cameraInputRef}
                     onChange={(e) => processImageFile(e.target.files?.[0])}
                 />

             </div>
         </div>
      )}

    </div>
  );
}
