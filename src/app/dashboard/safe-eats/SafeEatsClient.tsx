"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet map (no SSR — Leaflet uses browser APIs)
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

const mockPlaces = [
    { name: "Green Leaf Bistro",     type: "Restaurant", dist: "0.8 mi", lat: 40.7128,  lng: -74.006,  isGrocery: false },
    { name: "Whole Foods Market",    type: "Grocery",    dist: "1.2 mi", lat: 40.7148,  lng: -74.009,  isGrocery: true  },
    { name: "The Vegan Joint",       type: "Restaurant", dist: "2.5 mi", lat: 40.7108,  lng: -74.002,  isGrocery: false },
    { name: "Trader Joe's",          type: "Grocery",    dist: "3.0 mi", lat: 40.7165,  lng: -74.013,  isGrocery: true  },
];

const SPECIALTY_ITEMS = ["Oat milk", "Almond flour", "Vegan feta"];
const DIET_TAGS      = ["Dairy-Free", "Gluten-Free", "Vegan"];

export default function SafeEatsClient({ activeFilters }: { activeFilters: string[] }) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-2rem)]">
            <header>
                <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Safe Eats Near Me</h1>
                <p className="mt-1 text-[14px] text-zinc-500">Discover grocery stores &amp; restaurants matching your dietary restrictions.</p>
            </header>

            {/* Filter Section */}
            <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">FILTER BY DIETARY PROFILE</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {activeFilters.length > 0 ? (
                        activeFilters.map(filter => (
                            <span key={filter} className="px-4 py-1.5 rounded-full text-[13px] font-medium border border-zinc-200 text-zinc-700 bg-white shadow-sm">
                                {filter}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm italic text-zinc-400">None set — go to onboarding to add dietary preferences.</span>
                    )}
                </div>
            </div>

            {/* Map + List side by side */}
            <div className="flex-1 flex gap-6 overflow-hidden pt-2">
                {/* Real Leaflet Map */}
                <div className="flex-[1.2] rounded-[24px] overflow-hidden border border-zinc-200 shadow-sm">
                    <MapComponent places={mockPlaces} />
                </div>

                {/* Location Cards */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {mockPlaces.map((place, i) => {
                        const iconBg = place.isGrocery ? "bg-emerald-500" : "bg-red-500";
                        const isSelected = selectedIdx === i;
                        return (
                            <div
                                key={i}
                                onClick={() => setSelectedIdx(i)}
                                className={`bg-white rounded-[20px] border p-5 shadow-sm cursor-pointer transition-all ${isSelected ? "border-[#1b4332] ring-2 ring-[#1b4332]/20" : "border-zinc-200 hover:shadow-md"}`}
                            >
                                <div className="flex gap-4 items-start mb-4">
                                    <div className={`w-12 h-12 rounded-[14px] ${iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-sm text-xl`}>
                                        {place.isGrocery ? "🏪" : "🍽️"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[16px] text-zinc-900">
                                            {place.name}{" "}
                                            <span className="text-zinc-400 text-xs">☑️</span>
                                        </h3>
                                        <p className="text-[12px] text-zinc-500 mt-0.5">{place.type} Store · {place.dist} away</p>
                                        <div className="flex items-center gap-1 mt-1 text-[13px]">
                                            <span className="text-yellow-400">★</span>
                                            <span className="font-medium text-zinc-700">4.6</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {DIET_TAGS.map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#eef8f3] text-[#2c7a51]">
                                            {t}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Specialty items in stock</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SPECIALTY_ITEMS.map(item => (
                                            <span key={item} className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#f0f9f4] border border-[#d3eede] text-[#2c7a51] flex items-center gap-1">
                                                <span className="text-[10px]">📍</span> {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
