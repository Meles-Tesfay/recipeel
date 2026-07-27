"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLatestGroceryList, toggleGroceryItem } from "@/lib/actions";

interface GroceryItem {
    id: string;
    name: string;
    amount: number;
    unit: string;
    aisle: string;
    isChecked: boolean;
    isSubstituted?: boolean;
    substituteFor?: string;
}

export default function GroceriesPage() {
    const [list, setList] = useState<Record<string, GroceryItem[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const latest = await getLatestGroceryList();
        if (latest && latest.items) {
            // Group by aisle
            const grouped: Record<string, GroceryItem[]> = {};
            latest.items.forEach((item: any) => {
                const aisle = item.aisle || "Other";
                if (!grouped[aisle]) grouped[aisle] = [];
                grouped[aisle].push(item);
            });
            setList(grouped);
        }
        setLoading(false);
    };

    const handleToggleItem = async (id: string, current: boolean) => {
        // Optimistic UI update
        const updatedList = { ...list };
        for (const aisle in updatedList) {
            updatedList[aisle] = updatedList[aisle].map(item => 
                item.id === id ? { ...item, isChecked: !current } : item
            );
        }
        setList(updatedList);

        // Update DB
        await toggleGroceryItem(id, !current);
    };

    const allItems = Object.values(list).flat();
    const checkedCount = allItems.filter(i => i.isChecked).length;
    const totalCount = allItems.length;

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <span className="inline-block w-8 h-8 border-4 border-[var(--brand-green-pale)] border-t-[var(--brand-green)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
            <header className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight">Grocery List</h1>
                    <p className="text-zinc-500 mt-1">
                        Auto-compiled from your meal plan, grouped by aisle, with substitutions applied.
                        {allItems.some(i => i.isSubstituted) && (
                            <span className="ml-3 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider" 
                                style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                                Smart Substituted
                            </span>
                        )}
                    </p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl px-4 py-2 shadow-sm text-right min-w-[120px]">
                    <p className="text-[11px] text-zinc-500">Progress</p>
                    <p className="text-[15px] font-semibold text-zinc-800">
                        {checkedCount} / {totalCount} items
                    </p>
                </div>
            </header>

            {totalCount === 0 ? (
                <div className="py-16 text-center rounded-[24px] border border-dashed bg-white flex flex-col items-center justify-center space-y-5" style={{ borderColor: "var(--border)" }}>
                    <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-2">
                        <span className="text-4xl">🛒</span>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Your grocery list is empty</h2>
                        <p className="text-[15px] text-zinc-500">
                            We automatically compile your grocery list based on your weekly meal plan. Head over to the Planner to get started!
                        </p>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <Link href="/dashboard/recipes" className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors">
                            Browse Recipes
                        </Link>
                        <Link href="/dashboard/planner" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity" style={{ background: "var(--brand-green)" }}>
                            Go to Meal Planner
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {Object.entries(list).map(([aisle, items]) => {
                        let icon = "🛒";
                        if (aisle.includes("Produce") || aisle.includes("Fruit") || aisle.includes("Vegetable")) icon = "🍏";
                        else if (aisle.includes("Dairy")) icon = "🥛";
                        else if (aisle.includes("Meat") || aisle.includes("Poultry")) icon = "🥩";
                        else if (aisle.includes("Bakery") || aisle.includes("Bread")) icon = "🍞";

                        return (
                        <div key={aisle} className="bg-white rounded-[20px] shadow-sm border border-zinc-200/80 overflow-hidden">
                            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4" style={{ background: "#f8faf9" }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#e6f0eb] border border-[#d3e4dc]">
                                    {icon}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-900 text-[15px] leading-tight">{aisle}</h2>
                                    <span className="text-[12px] text-zinc-500">
                                        {items.length} items
                                    </span>
                                </div>
                            </div>
                            <ul className="divide-y divide-zinc-100/80 px-2">
                                {items.map(item => (
                                    <li key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <label className="flex items-center p-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                                                <input 
                                                    type="checkbox"
                                                    checked={item.isChecked}
                                                    onChange={() => handleToggleItem(item.id, item.isChecked)}
                                                    className="peer appearance-none w-5 h-5 border-[1.5px] rounded-full transition-all cursor-pointer border-zinc-200 checked:border-[var(--brand-green)] checked:bg-[var(--brand-green)]"
                                                />
                                                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <div className="flex-1 flex justify-between items-center">
                                                <div>
                                                    <span className={`text-[14px] transition-all ${item.isChecked ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.isSubstituted && (
                                                        <p className="text-[11px] font-medium flex items-center gap-1 text-[var(--brand-green-dark)]">
                                                            <span>🔄</span> Substituted for {item.substituteFor}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`text-[12px] ${item.isChecked ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                    {item.amount} {item.unit}
                                                </span>
                                            </div>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
}
