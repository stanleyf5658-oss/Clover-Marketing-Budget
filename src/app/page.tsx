"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

type Tab = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase auth integration
    console.log("Login attempted", { loginEmail });
    router.push("/planner");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    if (signupPassword.length < 8) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError("Passwords don't match.");
      return;
    }

    // TODO: Supabase auth — create account
    console.log("Signup attempted", { signupName, signupEmail });
    router.push("/onboarding");
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return null;
    if (pw.length < 6)  return { label: "Weak",   color: "bg-red-400",   pct: "25%" };
    if (pw.length < 10) return { label: "Fair",    color: "bg-yellow-400", pct: "50%" };
    if (pw.length < 14) return { label: "Good",    color: "bg-blue-400",  pct: "75%" };
    return               { label: "Strong",  color: "bg-green-500", pct: "100%" };
  };

  const strength = passwordStrength(signupPassword);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8faf5]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Image
              src="/clover-logo.png"
              alt="Clover Growth Partners"
              width={180}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[26px] font-bold text-[#191c19] tracking-tight leading-tight mb-1">
            {tab === "login" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-[#3f4a3e] text-[14px]">
            {tab === "login"
              ? "Enter your details to access your budget planner."
              : "Get started planning your marketing budget."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="relative flex bg-[#edeee9] p-1 rounded-xl mb-6">
          <motion.div
            layoutId="tab-indicator"
            className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-[10px] shadow-sm"
            animate={{ left: tab === "login" ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
          <button
            onClick={() => setTab("login")}
            className={`relative z-10 flex-1 py-2 text-[13px] font-bold rounded-[10px] transition-colors ${
              tab === "login" ? "text-[#006429]" : "text-[#3f4a3e]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`relative z-10 flex-1 py-2 text-[13px] font-bold rounded-[10px] transition-colors ${
              tab === "signup" ? "text-[#006429]" : "text-[#3f4a3e]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e1e3de] overflow-hidden">
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22 }}
                className="p-7 space-y-5"
              >
                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="contractor@hvacmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f7a6d] hover:text-[#191c19] transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      className="text-[12px] text-[#006429] hover:text-[#004e1f] font-semibold transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-1">
                  Go to my planner →
                </Button>

                <p className="text-center text-[12px] text-[#6f7a6d]">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("signup")}
                    className="text-[#006429] font-bold hover:underline"
                  >
                    Sign up for free
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                onSubmit={handleSignup}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="p-7 space-y-5"
              >
                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Your Name
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Smith"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="contractor@hvacmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPw ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f7a6d] hover:text-[#191c19] transition-colors"
                      tabIndex={-1}
                    >
                      {showSignupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {strength && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-[#edeee9] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${strength.color}`}
                          animate={{ width: strength.pct }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className={`text-[11px] font-semibold ${
                        strength.label === "Weak"   ? "text-red-500" :
                        strength.label === "Fair"   ? "text-yellow-600" :
                        strength.label === "Good"   ? "text-blue-600" : "text-green-600"
                      }`}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#191c19] mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showSignupConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f7a6d] hover:text-[#191c19] transition-colors"
                      tabIndex={-1}
                    >
                      {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupConfirm && (
                    <p className={`mt-1.5 text-[11px] font-semibold ${
                      signupPassword === signupConfirm ? "text-green-600" : "text-red-500"
                    }`}>
                      {signupPassword === signupConfirm ? "✓ Passwords match" : "Passwords don't match"}
                    </p>
                  )}
                </div>

                {signupError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium rounded-lg px-4 py-3"
                  >
                    {signupError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full mt-1"
                  disabled={!signupName || !signupEmail || !signupPassword || !signupConfirm}
                >
                  Create my account and set up my plan →
                </Button>

                <p className="text-center text-[12px] text-[#6f7a6d]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-[#006429] font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-[#6f7a6d] mt-6 leading-relaxed">
          By creating an account you agree to our{" "}
          <span className="text-[#006429] font-semibold cursor-pointer hover:underline">Terms of Service</span>{" "}
          and{" "}
          <span className="text-[#006429] font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </motion.div>
    </main>
  );
}
