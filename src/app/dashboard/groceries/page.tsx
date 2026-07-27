"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLatestGroceryList, toggleGroceryItem, addGroceryItem, generateGroceryList } from "@/lib/actions";

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

const AISLE_ICONS: Record<string, React.ReactNode> = {
    "Dairy": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3h6l1 5H8L9 3zM8 8v13h8V8" /></svg>,
    "Meat & Poultry": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    "Seafood": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12c-2.4 2.4-6 4-9 4s-6.6-1.6-9-4c2.4-2.4 6-4 9-4s6.6 1.6 9 4z" /><circle cx="12" cy="12" r="2" strokeWidth="1.8" /></svg>,
    "Produce": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    "Fruits": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth="1.8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4c0 0 2-2 4-2" /></svg>,
    "Bakery": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6z" /></svg>,
    "Grains & Pasta": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 6h18M3 12h18M3 18h18" /></svg>,
    "Spices & Herbs": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h8M12 8v8" /></svg>,
    "Condiments & Sauces": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 3h14M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2" /></svg>,
    "Baking & Sweeteners": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 15.5a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 15.5V8.5A2.5 2.5 0 015.5 6h13A2.5 2.5 0 0121 8.5v7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 6V4M16 6V4" /></svg>,
    "Beverages": <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3h6l1 17H8L9 3z" /></svg>,
};

function getAisleIcon(aisle: string) {
    return AISLE_ICONS[aisle] || (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    );
}

export default function GroceriesPage() {
    const [list, setList] = useState<Record<string, GroceryItem[]>>({});
    const [listId, setListId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    // Add item form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [newUnit, setNewUnit] = useState("unit");
    const [addingItem, setAddingItem] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const latest = await getLatestGroceryList();
        if (latest && latest.items) {
            setListId(latest.id);
            const grouped: Record<string, GroceryItem[]> = {};
            latest.items.forEach((item: any) => {
                const aisle = item.aisle || "Other";
                if (!grouped[aisle]) grouped[aisle] = [];
                grouped[aisle].push(item);
            });
            setList(grouped);
        } else {
            setList({});
            setListId(null);
        }
        setLoading(false);
    };

    const handleToggleItem = async (id: string, current: boolean) => {
        const updatedList = { ...list };
        for (const aisle in updatedList) {
            updatedList[aisle] = updatedList[aisle].map(item =>
                item.id === id ? { ...item, isChecked: !current } : item
            );
        }
        setList(updatedList);
        await toggleGroceryItem(id, !current);
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        await generateGroceryList(new Date(), new Date());
        await loadData();
        setRegenerating(false);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !listId) return;
        setAddingItem(true);
        await addGroceryItem(listId, newName.trim(), parseFloat(newAmount) || 1, newUnit);
        setNewName(""); setNewAmount(""); setNewUnit("unit");
        setShowAddForm(false);
        await loadData();
        setAddingItem(false);
    };

    const allItems = Object.values(list).flat();
    const checkedCount = allItems.filter(i => i.isChecked).length;
    const totalCount = allItems.length;
    const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <span className="inline-block w-8 h-8 border-4 border-[var(--brand-green-pale)] border-t-[var(--brand-green)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                <div>
                    <h1 className="text-[28px] md:text-[32px] font-bold text-zinc-900 tracking-tight">Grocery List</h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Auto-compiled from your meal plan, grouped by aisle.
                        {allItems.some(i => i.isSubstituted) && (
                            <span className="ml-3 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                                style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                                Smart Substituted
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Regenerate */}
                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                        {regenerating ? (
                            <span className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        Regenerate
                    </button>
                    {/* Progress */}
                    {totalCount > 0 && (
                        <div className="bg-white border border-zinc-200 rounded-xl px-4 py-2 shadow-sm text-right min-w-[120px]">
                            <p className="text-[11px] text-zinc-500">Progress</p>
                            <p className="text-[15px] font-semibold text-zinc-800">{checkedCount} / {totalCount}</p>
                            <div className="h-1 w-full rounded-full bg-zinc-100 mt-1 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--brand-green)" }} />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {totalCount === 0 ? (
                <div className="py-16 text-center rounded-[24px] border border-dashed bg-white flex flex-col items-center justify-center space-y-5" style={{ borderColor: "var(--border)" }}>
                    <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-2">
                        <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Your grocery list is empty</h2>
                        <p className="text-[15px] text-zinc-500">
                            We automatically compile your grocery list from your weekly meal plan. Head to the Planner to assign recipes first!
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
                <>
                    {/* Add Item Form */}
                    {listId && (
                        <div className="bg-white rounded-[20px] border border-zinc-200/80 p-4 shadow-sm">
                            {!showAddForm ? (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="flex items-center gap-2 text-sm font-semibold w-full py-2 px-3 rounded-xl border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Add item manually
                                </button>
                            ) : (
                                <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="Item name (e.g. Almond Milk)"
                                        className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 focus:bg-white focus:border-zinc-400 transition-colors"
                                        required
                                        autoFocus
                                    />
                                    <div className="flex gap-2 flex-shrink-0">
                                        <input
                                            type="number"
                                            value={newAmount}
                                            onChange={e => setNewAmount(e.target.value)}
                                            placeholder="Qty"
                                            className="w-20 px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 focus:bg-white focus:border-zinc-400 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={newUnit}
                                            onChange={e => setNewUnit(e.target.value)}
                                            placeholder="Unit"
                                            className="w-20 px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 focus:bg-white focus:border-zinc-400 transition-colors"
                                        />
                                        <button type="submit" disabled={addingItem}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                                            style={{ background: "var(--brand-green)" }}>
                                            {addingItem ? "Adding..." : "Add"}
                                        </button>
                                        <button type="button" onClick={() => setShowAddForm(false)}
                                            className="px-3 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {Object.entries(list).map(([aisle, items]) => (
                            <div key={aisle} className="bg-white rounded-[20px] shadow-sm border border-zinc-200/80 overflow-hidden">
                                <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4" style={{ background: "#f8faf9" }}>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e6f0eb] border border-[#d3e4dc]" style={{ color: "var(--brand-green)" }}>
                                        {getAisleIcon(aisle)}
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-900 text-[15px] leading-tight">{aisle}</h2>
                                        <span className="text-[12px] text-zinc-500">
                                            {items.filter(i => i.isChecked).length}/{items.length} checked
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
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                                Sub for {item.substituteFor}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={`text-[12px] ml-2 flex-shrink-0 ${item.isChecked ? 'text-zinc-400' : 'text-zinc-500'}`}>
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
                </>
            )}
        </div>
    );
}
