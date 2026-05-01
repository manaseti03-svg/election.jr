"use client";

import React, { useState } from "react";
import { signInWithPopup, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { LogIn, User as UserIcon } from "lucide-react";
import Image from "next/image";

export default function FirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200" aria-label="User Profile" role="region">
        {user.photoURL ? (
          <Image src={user.photoURL} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
        ) : (
          <UserIcon className="w-5 h-5 text-slate-600" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
          {user.displayName || user.email}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      aria-label="Sign in with Google to Save Profile"
      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full font-bold text-[10px] md:text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap"
    >
      <LogIn className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
      <span className="hidden sm:inline">
        {loading ? "Signing in..." : "Sign in with Google"}
      </span>
      <span className="sm:hidden">
        {loading ? "..." : "Sign In"}
      </span>
    </button>
  );
}
