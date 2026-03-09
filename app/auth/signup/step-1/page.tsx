"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupProgress from "@/components/SignupProgress";
import { useUser } from "@/contexts/UserContext";

export default function Step1() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [sliqId, setSliqId] = useState("");

  // Validation: email must be valid; sliqId is optional but if entered must have at least 3 characters
  const isValidEmail = email.includes("@") && email.includes(".");
  const isValidSliqId = sliqId.length === 0 || sliqId.length >= 3;
  const isFormValid = isValidEmail && isValidSliqId;

  const handleContinue = () => {
    if (!isFormValid) return;
    
    // Save user data to context (will be persisted to localStorage)
    const fullSliqId = sliqId ? `${sliqId}.sliq` : '';
    setUser({
      sliqId: fullSliqId,
      email,
      name: "", // Will be filled in later steps
      initials: "", // Will be filled in later steps
    });

    // Navigate to next step
    router.push("/auth/signup/step-2");
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center gap-3">
        <Link href="/auth/signup/get-started" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
        <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={1} />
        <p className="text-xs text-gray-600 mt-1">Step 1</p>

        <h2 className="mt-6 text-xl font-extrabold">Create an account</h2>
        <p className="text-sm text-gray-500">Enter your Email to get started</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              value={email} 
              onChange={(e)=>setEmail(e.target.value)} 
              type="email" 
              placeholder="example@email.com" 
              className="w-full rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500" 
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Create Sliq ID <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center rounded-xl bg-gray-100 border border-gray-200 focus-within:ring-2 focus-within:ring-cyan-500 overflow-hidden">
              <input 
                value={sliqId} 
                onChange={(e)=>{
                  // Remove any special characters except alphanumeric, underscore, hyphen
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                  setSliqId(cleaned.toLowerCase());
                }} 
                type="text" 
                placeholder="your username" 
                className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-800 min-w-0" 
                minLength={3}
                maxLength={30}
              />
              <span className="pr-4 text-cyan-700 font-semibold text-sm whitespace-nowrap select-none">.sliq</span>
            </div>
            {sliqId && !isValidSliqId && (
              <p className="mt-1.5 text-xs text-red-500">
                Sliq ID must be at least 3 characters
              </p>
            )}
            {sliqId && isValidSliqId && (
              <p className="mt-1.5 text-xs text-gray-600">
                Your Sliq ID: <span className="font-semibold text-cyan-700">{sliqId}.sliq</span>
              </p>
            )}
            {!sliqId && (
              <p className="mt-1.5 text-xs text-gray-500">
                Leave blank to auto-generate. Letters, numbers, - and _ only.
              </p>
            )}
          </div>
        </div>

        {isFormValid ? (
          <button
            onClick={handleContinue}
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button 
            disabled
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gray-300 px-4 py-3 font-medium text-gray-500 cursor-not-allowed"
          >
            Continue
          </button>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link className="text-blue-600" href="/auth/login">Login</Link></p>
      </div>
    </div>
  );
}
