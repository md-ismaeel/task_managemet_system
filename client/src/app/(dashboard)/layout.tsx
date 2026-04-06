"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getAccess();

    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(12,12,15,0.85)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--accent)]">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-semibold">TaskFlow</span>
          </div>

          <button onClick={logout} className="btn-ghost px-3 py-2 text-xs flex gap-1">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}