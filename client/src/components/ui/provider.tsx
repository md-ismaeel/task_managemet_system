"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: "#1a1a22",
                    color: "#f0f0f5",
                    border: "1px solid #2a2a35",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                },
                success: {
                    iconTheme: { primary: "#34d399", secondary: "#1a1a22" },
                },
                error: {
                    iconTheme: { primary: "#f87171", secondary: "#1a1a22" },
                },
            }}
        />
    );
}