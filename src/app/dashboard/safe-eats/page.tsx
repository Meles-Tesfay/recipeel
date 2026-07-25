"use client";

import { useState } from "react";

export default function SafeEatsPage() {
    const [view, setView] = useState<"map" | "list">("map");

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 flex flex-col h-[calc(100vh-2rem)]">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Safe Eats Near Me</h1>
                    <p className="text-zinc-500 mt-2">Discover restaurants and grocery stores that match your dietary profile.</p>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setView("map")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${view === 'map' ? 'bg-white dark:bg-zinc-700 shadow-sm text-orange-600' : 'text-zinc-500'}`}
                    >
                        Map View
                    </button>
                    <button 
                        onClick={() => setView("list")}
                        className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${view === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-orange-600' : 'text-zinc-500'}`}
                    >
                        List View
                    </button>
                </div>
            </header>

            <div className="flex gap-4 flex-wrap">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Vegan</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">Gluten-Free</span>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-xs font-bold uppercase tracking-wider">+ Add Filter</span>
            </div>

            <div className="flex-1 bg-zinc-200 dark:bg-zinc-900 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-lg overflow-hidden relative flex items-center justify-center">
                {/* Mock Map / List Area */}
                {view === "map" ? (
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-122.4194,37.7749,13,0/800x600?access_token=pk.mock')] bg-cover bg-center opacity-50 dark:opacity-20 flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm text-center">
                            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📍</div>
                            <h3 className="text-xl font-bold mb-2">Interactive Map Simulated</h3>
                            <p className="text-zinc-500 text-sm">For the MVP, this map placeholder represents the integration with a mapping provider like Mapbox or Google Maps. It would show 4 verified Safe Eats in your area.</p>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 p-6 overflow-auto bg-zinc-50 dark:bg-zinc-950 space-y-4">
                        {[
                            { name: "Green Leaf Bistro", type: "Restaurant", match: "100%", dist: "0.8 mi" },
                            { name: "Whole Foods Market", type: "Grocery", match: "95%", dist: "1.2 mi" },
                            { name: "The Vegan Joint", type: "Restaurant", match: "100%", dist: "2.5 mi" },
                            { name: "Trader Joe's", type: "Grocery", match: "80%", dist: "3.0 mi" },
                        ].map((place, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                                <div>
                                    <h3 className="font-bold text-lg">{place.name}</h3>
                                    <p className="text-sm text-zinc-500">{place.type} • {place.dist}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-green-500 font-black text-xl">{place.match} Match</div>
                                    <button className="text-sm font-medium text-orange-500 hover:underline mt-1">Get Directions</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
