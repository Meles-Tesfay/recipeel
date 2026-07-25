"use client";

import { useState } from "react";

// Mock data grouped by aisle
const mockList = {
    "Produce": [
        { id: 1, name: "Avocado", amount: 2, unit: "whole", checked: false },
        { id: 2, name: "Spinach", amount: 2, unit: "cups", checked: false },
        { id: 3, name: "Sun-dried Tomatoes", amount: 0.5, unit: "cup", checked: true },
    ],
    "Meat & Seafood": [
        { id: 4, name: "Chicken Breast", amount: 2, unit: "lbs", checked: false },
    ],
    "Dairy & Alternatives": [
        { id: 5, name: "Coconut Milk", amount: 1, unit: "cup", checked: false, note: "Substituted for Heavy Cream" },
        { id: 6, name: "Nutritional Yeast", amount: 0.5, unit: "cup", checked: false, note: "Substituted for Parmesan" },
    ],
    "Bakery": [
        { id: 7, name: "Sourdough Bread", amount: 1, unit: "loaf", checked: false },
    ]
};

export default function GroceriesPage() {
    const [list, setList] = useState(mockList);

    const toggleItem = (aisle: keyof typeof mockList, id: number) => {
        setList(prev => ({
            ...prev,
            [aisle]: prev[aisle].map(item => 
                item.id === id ? { ...item, checked: !item.checked } : item
            )
        }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Grocery List</h1>
                    <p className="text-zinc-500 mt-2 flex items-center gap-2">
                        <span>Generated from this week's Meal Planner.</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase">Smart Substituted</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-zinc-400">Total Items</p>
                    <p className="text-3xl font-black text-orange-500">
                        {Object.values(list).flat().filter(i => !i.checked).length}
                    </p>
                </div>
            </header>

            <div className="space-y-8">
                {Object.entries(list).map(([aisle, items]) => (
                    <div key={aisle} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="bg-zinc-50 dark:bg-zinc-950 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">{aisle}</h2>
                            <span className="text-sm font-medium text-zinc-400">{items.filter(i => i.checked).length} / {items.length}</span>
                        </div>
                        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {items.map(item => (
                                <li key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <label className="flex items-center p-4 pr-6 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                                            <input 
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => toggleItem(aisle as any, item.id)}
                                                className="peer appearance-none w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 rounded-md checked:border-orange-500 checked:bg-orange-500 transition-all cursor-pointer"
                                            />
                                            <svg className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <span className={`font-medium text-lg transition-all ${item.checked ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                {item.name}
                                            </span>
                                            {item.note && (
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                                                    <span>🔄</span> {item.note}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg ${item.checked ? 'text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                {item.amount} {item.unit}
                                            </span>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
