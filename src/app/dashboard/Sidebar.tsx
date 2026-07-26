"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { name: "Saved Recipes", href: "/dashboard/recipes", icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
    )},
    { name: "Meal Planner", href: "/dashboard/planner", icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { name: "Grocery List", href: "/dashboard/groceries", icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    )},
    { name: "Safe Eats", href: "/dashboard/safe-eats", icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
];

export default function Sidebar({ user }: { user: { name: string; email: string; image?: string | null } }) {
    const pathname = usePathname();
    const router = useRouter();

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
        <aside className="w-56 flex flex-col h-full bg-white border-r border-zinc-200">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-green)" }}>
                    <span className="text-white font-black text-sm">R</span>
                </div>
                <span className="font-bold text-[17px] text-zinc-900">ReciPeel</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${isActive ? 'text-white' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'}`}
                            style={{ background: isActive ? "var(--brand-green-dark)" : "" }}>
                            <span className={isActive ? "text-white" : "text-zinc-400"}>{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}

                {/* Divider + Dietary Profile section */}
                <div className="pt-4 pb-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 pb-1">My Dietary Profile</p>
                </div>
            </nav>

            {/* User Profile + Sign Out */}
            <div className="p-3 border-t border-zinc-100">
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: "var(--brand-green)" }}>
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="font-semibold text-[13px] truncate text-zinc-800">{user.name}</p>
                        <p className="text-[11px] truncate text-zinc-400">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-[12px] font-semibold rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                    Sign out
                </button>
            </div>
        </aside>
    );
}
