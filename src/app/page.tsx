"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase auth integraton
    console.log("Login attempted", { email });
    router.push("/onboarding");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-app">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-branding-row text-primary mb-6">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple clover or chart-like icon */}
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          <h1 className="text-3xl lg:text-4xl text-text-main mb-3">
            Ready to set up your plan? Let's go.
          </h1>
          <p className="text-text-muted text-[15px]">
            Please enter your details to access your dashboard.
          </p>
        </div>

        <div className="bg-surface rounded-[12px] shadow-sm p-6 lg:p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[13px] font-bold text-text-main mb-1.5"
              >
                Your Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="contractor@hvacmail.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-[13px] font-bold text-text-main mb-1.5"
              >
                Your Secure Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-2">
                <a 
                  href="/" 
                  className="text-[13px] text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">
              Go to my planner &rarr;
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
