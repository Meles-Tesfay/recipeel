"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet map (no SSR — Leaflet uses browser APIs)
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

const mockPlaces = [
    {
        name: "Green Leaf Bistro",
        type: "Restaurant",
        dist: "0.8 mi",
        lat: 40.7128,
        lng: -74.006,
        isGrocery: false,
        tags: ["Vegan", "Dairy-Free", "Gluten-Free"],
        rating: 4.7,
        specialty: ["Oat milk lattes", "Vegan burgers", "GF wraps"],
    },
    {
        name: "Whole Foods Market",
        type: "Grocery",
        dist: "1.2 mi",
        lat: 40.7148,
        lng: -74.009,
        isGrocery: true,
        tags: ["Vegan", "Dairy-Free", "Gluten-Free", "Halal", "Kosher", "Keto"],
        rating: 4.5,
        specialty: ["Oat milk", "Almond flour", "Vegan feta", "Halal meats"],
    },
    {
        name: "The Vegan Joint",
        type: "Restaurant",
        dist: "2.5 mi",
        lat: 40.7108,
        lng: -74.002,
        isGrocery: false,
        tags: ["Vegan", "Dairy-Free", "Gluten-Free"],
        rating: 4.8,
        specialty: ["100% plant-based", "House-made cashew cheese", "GF pasta"],
    },
    {
        name: "Trader Joe's",
        type: "Grocery",
        dist: "3.0 mi",
        lat: 40.7165,
        lng: -74.013,
        isGrocery: true,
        tags: ["Vegan", "Dairy-Free", "Gluten-Free", "Keto"],
        rating: 4.4,
        specialty: ["Cauliflower gnocchi", "Coconut milk", "Keto snacks"],
    },
    {
        name: "Halal Bros Kitchen",
        type: "Restaurant",
        dist: "1.7 mi",
        lat: 40.7138,
        lng: -73.999,
        isGrocery: false,
        tags: ["Halal", "Dairy-Free"],
        rating: 4.6,
        specialty: ["Certified Halal meats", "No pork", "Dairy-free options"],
    },
    {
        name: "The Keto Corner",
        type: "Restaurant",
        dist: "2.1 mi",
        lat: 40.7155,
        lng: -74.004,
        isGrocery: false,
        tags: ["Keto", "Gluten-Free", "Dairy-Free"],
        rating: 4.3,
        specialty: ["Zero-carb buns", "Keto desserts", "Cauliflower pizza"],
    },
];

const ALL_DIET_TAGS = ["Vegan", "Vegetarian", "Dairy-Free", "Gluten-Free", "Halal", "Kosher", "Keto", "Paleo"];

export default function SafeEatsClient({ activeFilters }: { activeFilters: string[] }) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [activeTagFilters, setActiveTagFilters] = useState<string[]>(activeFilters);

    const toggleFilter = (tag: string) => {
        setActiveTagFilters(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setSelectedIdx(null);
    };

    // Filter places: if any filters are active, show only places that match ALL active filters
    const filteredPlaces = activeTagFilters.length === 0
        ? mockPlaces
        : mockPlaces.filter(place =>
            activeTagFilters.every(tag => place.tags.includes(tag))
        );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-5 md:h-[calc(100vh-2rem)] flex flex-col">
            <header>
                <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Safe Eats Near Me</h1>
                <p className="mt-1 text-[14px] text-zinc-500">Discover grocery stores &amp; restaurants matching your dietary restrictions.</p>
            </header>

            {/* Filter Section */}
            <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">FILTER BY DIETARY NEED</span>
                    {activeTagFilters.length > 0 && (
                        <button
                            onClick={() => setActiveTagFilters([])}
                            className="ml-auto text-[11px] font-semibold text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {ALL_DIET_TAGS.map(tag => {
                        const isActive = activeTagFilters.includes(tag);
                        const isFromProfile = activeFilters.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleFilter(tag)}
                                className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${
                                    isActive
                                        ? "text-white shadow-sm"
                                        : "border-zinc-200 text-zinc-600 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                                }`}
                                style={isActive ? { background: "var(--brand-green)", borderColor: "var(--brand-green)" } : {}}
                            >
                                {tag}
                                {isFromProfile && !isActive && (
                                    <span className="ml-1 text-[9px] font-bold text-zinc-400 uppercase">profile</span>
                                )}
                            </button>
                        );
                    })}
                </div>
                {activeTagFilters.length > 0 && (
                    <p className="text-xs text-zinc-400 mt-3">
                        Showing <strong className="text-zinc-700">{filteredPlaces.length}</strong> location{filteredPlaces.length !== 1 ? "s" : ""} matching {activeTagFilters.join(" + ")}
                    </p>
                )}
            </div>

            {/* Map + List responsive stack */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 md:overflow-hidden pt-1 min-h-0">
                {/* Real Leaflet Map */}
                <div className="flex-[1.2] rounded-[24px] overflow-hidden border border-zinc-200 shadow-sm h-[350px] md:h-auto min-h-[350px] md:min-h-0 relative z-0">
                    <MapComponent places={filteredPlaces} />
                </div>

                {/* Location Cards */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-20 md:pb-0">
                    {filteredPlaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[20px] bg-white border border-dashed border-zinc-200">
                            <div className="text-4xl mb-3">🔍</div>
                            <p className="text-sm font-bold text-zinc-700">No locations match your filters</p>
                            <p className="text-xs text-zinc-400 mt-1">Try removing some dietary filters to see more results.</p>
                            <button
                                onClick={() => setActiveTagFilters([])}
                                className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        filteredPlaces.map((place, i) => {
                            const iconBg = place.isGrocery ? "bg-emerald-500" : "bg-red-500";
                            const isSelected = selectedIdx === i;
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedIdx(i)}
                                    className={`bg-white rounded-[20px] border p-5 shadow-sm cursor-pointer transition-all ${isSelected ? "border-[#1b4332] ring-2 ring-[#1b4332]/20" : "border-zinc-200 hover:shadow-md"}`}
                                >
                                    <div className="flex gap-4 items-start mb-4">
                                        <div className={`w-12 h-12 rounded-[14px] ${iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                            {place.isGrocery ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 13h18M3 13a2 2 0 00-2 2v3a2 2 0 002 2h18a2 2 0 002-2v-3a2 2 0 00-2-2M3 13V7a2 2 0 012-2h14a2 2 0 012 2v6" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-[16px] text-zinc-900 leading-tight">{place.name}</h3>
                                            <p className="text-[12px] text-zinc-500 mt-0.5">{place.type} · {place.dist} away</p>
                                            <div className="flex items-center gap-1 mt-1 text-[13px]">
                                                <span className="text-yellow-400">★</span>
                                                <span className="font-medium text-zinc-700">{place.rating}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diet Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {place.tags.map(t => (
                                            <span
                                                key={t}
                                                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${activeTagFilters.includes(t) ? "bg-[#1b4332] text-white" : "bg-[#eef8f3] text-[#2c7a51]"}`}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Specialty items */}
                                    <div className="pt-4 border-t border-zinc-100">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Specialty items</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            {place.specialty.map(item => (
                                                <p key={item} className="text-[11px] font-medium flex items-center gap-1 text-[#2c7a51]">
                                                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    {item}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
