"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoSettingsSharp } from "react-icons/io5";
import { IoNotifications } from "react-icons/io5";
import { useState } from 'react';
import Sidebar from "@/components/dashboard/sidebar";
import { X } from "lucide-react";
import { HiOutlineMenu } from "react-icons/hi";
import { useUser } from "@/contexts/UserContext";

export default function Navbar() {
    const pathName = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { user, clearUser } = useUser();
    const dashboard = pathName == "/dashboard";
    const history = pathName.startsWith("/dashboard/history");

    async function logout() {
      try {
        setLoading(true);

        // Call backend logout endpoint
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        // Clear user context data
        clearUser();
       
      } catch (e) {
        console.error('Logout error:', e);
        // Clear user data even if API call fails
        clearUser();
      } finally {
        setLoading(false);
        // Use a small delay before redirecting to ensure the cookie is cleared
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      }
    }

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Hamburger Menu */}
          <button
            aria-label="Open menu"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <HiOutlineMenu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/dashboard" className="flex items-center">
              <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
            </Link>
          </div>

          {/* Right: User Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sliq ID Display */}
            {user?.sliqId && (
              <span className="hidden sm:inline-block px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 text-cyan-700 text-xs font-semibold rounded-full">
                {user.sliqId}
              </span>
            )}
            <IoSettingsSharp className="w-5 h-5 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors" />
            <IoNotifications className="w-5 h-5 cursor-pointer text-gray-600 hover:text-gray-900 transition-colors" />
            <button 
              onClick={logout} 
              disabled={loading} 
              className="hidden sm:inline-block px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile off-canvas sidebar */}
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-[280px] bg-white shadow-lg md:hidden transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative h-full">
          <button
            aria-label="Close menu"
            className="absolute right-3 top-3 p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar variant="mobile" className="h-full pt-10" />
        </div>
      </div>
    </header>
  );
}