"use client";

import { useState } from "react";

export default function SafeEatsClient({ activeFilters }: { activeFilters: string[] }) {
    const [view, setView] = useState<"map" | "list">("map");

    const mockPlaces = [
        { name: "Green Leaf Bistro", type: "Restaurant", match: "100%", dist: "0.8 mi" },
        { name: "Whole Foods Market", type: "Grocery", match: "95%", dist: "1.2 mi" },
        { name: "The Vegan Joint", type: "Restaurant", match: "100%", dist: "2.5 mi" },
        { name: "Trader Joe's", type: "Grocery", match: "80%", dist: "3.0 mi" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-2rem)]">
            <header>
                <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Safe Eats Near Me</h1>
                <p className="mt-1 text-[14px] text-zinc-500">Discover grocery stores & restaurants matching your dietary restrictions.</p>
            </header>

            {/* Filter Section */}
            <div className="rounded-2xl border border-zinc-200/80 p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
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
                        <span className="text-sm italic text-zinc-400">None set</span>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden pt-2">
                {/* Map Area */}
                <div className="flex-[1.2] rounded-[24px] overflow-hidden relative border border-zinc-200 shadow-sm"
                     style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-122.4194,37.7749,13,0/800x600?access_token=pk.mock')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                     {/* Map Controls Mock */}
                     <div className="absolute top-4 left-4 bg-white rounded-md shadow-sm border border-zinc-200 flex flex-col">
                        <button className="w-8 h-8 flex items-center justify-center font-bold text-zinc-700 border-b border-zinc-200">+</button>
                        <button className="w-8 h-8 flex items-center justify-center font-bold text-zinc-700">-</button>
                     </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {mockPlaces.map((place, i) => {
                        const isGrocery = place.type === "Grocery";
                        const iconBg = isGrocery ? "bg-emerald-500" : "bg-red-500";
                        const tags = ["Dairy-Free", "Gluten-Free", "Vegan"];
                        const items = ["Oat milk", "Almond flour", "Vegan feta"];
                        return (
                        <div key={i} className="bg-white rounded-[20px] border border-zinc-200 p-5 shadow-sm">
                            <div className="flex gap-4 items-start mb-4">
                                <div className={`w-12 h-12 rounded-[14px] ${iconBg} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <span className="text-xl">{isGrocery ? '🏪' : '🍽️'}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[16px] text-zinc-900 flex items-center gap-1">
                                        {place.name} <span className="text-zinc-400 text-xs">☑️</span>
                                    </h3>
                                    <p className="text-[12px] text-zinc-500 mt-0.5">{place.type} Store - {place.dist} away</p>
                                    <div className="flex items-center gap-1 mt-1 text-[13px]">
                                        <span className="text-yellow-400">★</span>
                                        <span className="font-medium text-zinc-700">4.6</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {tags.map(t => (
                                    <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#eef8f3] text-[#2c7a51]">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-zinc-100">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Specialty items in stock</p>
                                <div className="flex flex-wrap gap-2">
                                    {items.map(item => (
                                        <span key={item} className="px-2 py-1 rounded-md text-[11px] font-medium bg-[#f0f9f4] border border-[#d3eede] text-[#2c7a51] flex items-center gap-1">
                                            <span className="text-[10px]">📍</span> {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
}
