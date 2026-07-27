"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const navItems = [
    {
        name: "Home",
        href: "/dashboard",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: "Recipes",
        href: "/dashboard/recipes",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        )
    },
    {
        name: "Planner",
        href: "/dashboard/planner",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        name: "Grocery",
        href: "/dashboard/groceries",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        )
    },
    {
        name: "Nutrition",
        href: "/dashboard/nutrition",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
];

const allDrawerItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        name: "Saved Recipes",
        href: "/dashboard/recipes",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        )
    },
    {
        name: "Meal Planner",
        href: "/dashboard/planner",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        name: "Grocery List",
        href: "/dashboard/groceries",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        name: "Nutrition",
        href: "/dashboard/nutrition",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        name: "Safe Eats",
        href: "/dashboard/safe-eats",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2.5" : "1.75"} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    },
    {
        name: "My Profile",
        href: "/dashboard/profile",
        icon: (active: boolean) => (
            <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )
    },
];

interface MobileNavProps {
    user: { name: string; email: string; image?: string | null };
}

export default function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const initials = user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <>
            {/* Top Header Bar (mobile only) */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-zinc-100 flex items-center justify-between px-4 h-14">
                {/* Hamburger */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-green)" }}>
                        <span className="text-white font-black text-xs">R</span>
                    </div>
                    <span className="font-bold text-base text-zinc-900">ReciPeel</span>
                </div>

                {/* Avatar */}
                {user.image ? (
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "var(--brand-green)" }}>
                        {initials}
                    </div>
                )}
            </header>

            {/* Drawer Overlay */}
            {drawerOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    onClick={() => setDrawerOpen(false)}
                >
                    {/* Drawer Panel */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-green)" }}>
                                    <span className="text-white font-black text-sm">R</span>
                                </div>
                                <span className="font-bold text-lg text-zinc-900">ReciPeel</span>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Nav Items */}
                        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                            {allDrawerItems.map(item => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setDrawerOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                                            isActive ? "text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
                                        }`}
                                        style={{ background: isActive ? "var(--brand-green-dark)" : "" }}
                                    >
                                        {item.icon(isActive)}
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Footer */}
                        <div className="p-3 border-t border-zinc-100">
                            <div className="flex items-center gap-3 px-2 py-2 mb-2">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                        style={{ background: "var(--brand-green)" }}>
                                        {initials}
                                    </div>
                                )}
                                <div className="overflow-hidden flex-1">
                                    <p className="font-semibold text-sm truncate text-zinc-800">{user.name}</p>
                                    <p className="text-xs truncate text-zinc-400">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Tab Bar (mobile only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-100 flex items-center justify-around px-2 h-16 safe-area-inset-bottom">
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[52px]"
                            style={{ color: isActive ? "var(--brand-green)" : "#a1a1aa" }}
                        >
                            {item.icon(isActive)}
                            <span className="text-[10px] font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
