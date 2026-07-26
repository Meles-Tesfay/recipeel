"use client";

import { useState, useEffect } from "react";
import { extractRecipeFromUrl, saveRecipe, getUserRecipes, deleteRecipe, toggleFavorite, updateIngredient } from "@/lib/actions";

const CARD_GRADIENTS = [
    "from-emerald-400 to-teal-500",
    "from-teal-400 to-cyan-500",
    "from-orange-400 to-amber-500",
    "from-green-500 to-emerald-600",
    "from-violet-400 to-purple-500",
    "from-rose-400 to-pink-500",
];

const SOURCES = ["TikTok", "Instagram", "YouTube", "Website"];

// Derive mock source from recipe id for stable display
function getSource(id: string) {
    const h = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    return SOURCES[h % SOURCES.length];
}
function getGradient(id: string) {
    const h = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    return CARD_GRADIENTS[h % CARD_GRADIENTS.length];
}

function getSuggestionForIngredient(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("cream")) return "Coconut Milk";
    if (lower.includes("parmesan")) return "Nutritional Yeast";
    if (lower.includes("peanut")) return "Sunflower Seed Butter";
    if (lower.includes("wheat") || (lower.includes("noodles") && !lower.includes("rice"))) return "Rice Noodles";
    if (lower.includes("chicken")) return "Tofu";
    if (lower.includes("soy sauce")) return "Coconut Aminos";
    return null;
}

const FOLDERS = ["All", "Favorites", "Breakfast", "Quick Prep", "High-Protein", "Dinner"];

export default function RecipesPage() {
    const [importUrl, setImportUrl] = useState("");
    const [importing, setImporting] = useState(false);
    const [recipe, setRecipe] = useState<any>(null);
    const [saved, setSaved] = useState(false);
    const [library, setLibrary] = useState<any[]>([]);
    const [activeFolder, setActiveFolder] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    useEffect(() => { loadLibrary(); }, []);

    const loadLibrary = async () => {
        const res = await getUserRecipes();
        setLibrary(res);
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setImporting(true);
        setRecipe(null);
        setSaved(false);
        try {
            const extracted = await extractRecipeFromUrl(importUrl);
            setRecipe(extracted);
        } catch {
            alert("Failed to import recipe.");
        }
        setImporting(false);
    };

    const handleSave = async () => {
        if (!recipe || saved) return;
        try {
            await saveRecipe(recipe);
            setSaved(true);
            loadLibrary();
        } catch {
            alert("Failed to save recipe.");
        }
    };

    const handleReplaceAll = () => {
        if (!recipe) return;
        const updatedIngredients = recipe.ingredients.map((ing: any) => {
            if (ing.conflict && ing.suggestion) {
                return { ...ing, name: ing.suggestion, originalName: ing.name, conflict: null, isSubstituted: true, substituteFor: ing.name };
            }
            return ing;
        });
        setRecipe({ ...recipe, ingredients: updatedIngredients });
    };

    const handleReplaceSingle = (index: number, newName: string) => {
        if (!recipe) return;
        const updated = [...recipe.ingredients];
        const ing = updated[index];
        if (newName !== `Original: ${ing.originalName || ing.name}`) {
            updated[index] = { ...ing, name: newName.replace("🔄 ", ""), conflict: null, isSubstituted: true, substituteFor: ing.originalName || ing.name };
        } else {
            updated[index] = { ...ing, name: ing.originalName || ing.name, isSubstituted: false, substituteFor: null };
        }
        setRecipe({ ...recipe, ingredients: updated });
    };

    const handleDelete = async (id: string) => {
        if (selectedRecipe && selectedRecipe.id === id) {
            setSelectedRecipe(null);
        }
        await deleteRecipe(id);
        loadLibrary();
    };

    const handleToggleFav = async (id: string, isFav: boolean) => {
        await toggleFavorite(id, isFav);
        loadLibrary();
        if (selectedRecipe && selectedRecipe.id === id) {
            setSelectedRecipe((prev: any) => prev ? { ...prev, isFavorite: isFav } : null);
        }
    };

    const handleSavedIngredientSubstitution = async (ingId: string, value: string) => {
        await updateIngredient(ingId, value);
        const updatedLibrary = await getUserRecipes();
        setLibrary(updatedLibrary);
        if (selectedRecipe) {
            const updatedSelected = updatedLibrary.find(r => r.id === selectedRecipe.id);
            setSelectedRecipe(updatedSelected);
        }
    };

    // Derive all tags from library
    const allTags = Array.from(new Set(library.flatMap(r => r.tags || [])));

    // Filter library
    const filtered = library.filter(r => {
        const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesFolder = true;
        if (activeFolder === "Favorites") {
            matchesFolder = r.isFavorite;
        } else if (activeFolder !== "All") {
            matchesFolder = (r.tags || []).includes(activeFolder);
        }
        return matchesSearch && matchesFolder;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Saved Recipes</h1>
                <p className="text-[14px] text-zinc-500 mt-1">Organize imported and favorite recipes into folders &amp; tags.</p>
            </div>

            {/* Import Form */}
            <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
                <h2 className="font-bold text-zinc-900 mb-1">Import from Social Media</h2>
                <p className="text-sm mb-4 text-zinc-500">Paste a TikTok, Instagram Reel, or YouTube Shorts link below.</p>
                <form onSubmit={handleImport} className="flex gap-3">
                    <input
                        type="url" required value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        placeholder="https://www.tiktok.com/@chef/video/..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 text-zinc-800 focus:border-zinc-400 transition-colors"
                    />
                    <button type="submit" disabled={importing || !importUrl}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                        style={{ background: "var(--brand-green)" }}>
                        {importing ? (
                            <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Extracting...</>
                        ) : "Import Recipe"}
                    </button>
                </form>
            </div>

            {/* Imported Recipe Draft */}
            {recipe && (
                <div className="bg-white rounded-[20px] border border-zinc-200/80 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/60">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Draft</span>
                                <h2 className="text-xl font-bold text-zinc-900">{recipe.title}</h2>
                            </div>
                            <div className="flex gap-4 mt-2 text-zinc-500">
                                <span className="text-sm">⏱ {recipe.cookTime} min</span>
                                <span className="text-sm">🍽 {recipe.servings} servings</span>
                                <span className="text-sm">🔥 {recipe.calories} kcal</span>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={saved}
                            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all text-white ${saved ? "opacity-70" : "hover:-translate-y-0.5 shadow-md"}`}
                            style={{ background: "var(--brand-green)" }}>
                            {saved ? "✓ Saved to Library" : "Save Recipe"}
                        </button>
                    </div>

                    {recipe.ingredients.some((i: any) => i.conflict) && (
                        <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800">Dietary Conflicts Detected</p>
                                <p className="text-sm text-amber-700 mt-0.5">Some ingredients conflict with your dietary profile.</p>
                                <button onClick={handleReplaceAll} className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ background: "var(--brand-green)" }}>
                                    Replace All Automatically
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                        <div className="p-6">
                            <h3 className="font-bold mb-4 flex items-center justify-between text-zinc-900">
                                <span>Ingredients</span>
                                <span className="text-xs font-semibold text-zinc-400">{recipe.ingredients.length} items</span>
                            </h3>
                            <ul className="space-y-2">
                                {recipe.ingredients.map((ing: any, i: number) => (
                                    <li key={i} className={`flex items-center justify-between p-3 rounded-xl border ${ing.conflict ? 'border-amber-200 bg-amber-50' : ing.isSubstituted ? 'border-blue-200 bg-blue-50' : 'border-transparent bg-zinc-50'}`}>
                                        <div>
                                            <span className={`text-sm font-medium ${ing.conflict ? 'text-amber-900' : 'text-zinc-900'}`}>{ing.amount} {ing.unit} {ing.name}</span>
                                            {ing.conflict && <p className="text-xs font-bold text-amber-700 mt-0.5">⚠️ {ing.conflict} conflict</p>}
                                            {ing.isSubstituted && <p className="text-xs font-bold text-blue-600 mt-0.5">🔄 Substituted for {ing.substituteFor}</p>}
                                        </div>
                                        {ing.suggestion && !ing.isSubstituted && (
                                            <select onChange={(e) => handleReplaceSingle(i, e.target.value)}
                                                className="text-xs px-2 py-1.5 rounded-lg font-bold cursor-pointer outline-none shadow-sm border border-zinc-100 bg-white text-[#2c7a51]">
                                                <option>Original: {ing.name}</option>
                                                <option>🔄 {ing.suggestion}</option>
                                            </select>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold mb-4 text-zinc-900">Instructions</h3>
                            <ol className="space-y-4">
                                {recipe.instructions.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: "var(--brand-green)" }}>{i + 1}</span>
                                        <p className="text-sm leading-relaxed text-zinc-500">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="p-4 border-t border-zinc-100 grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/60">
                        {[
                            { label: "Calories", val: recipe.calories, unit: "kcal" },
                            { label: "Protein", val: recipe.protein, unit: "g" },
                            { label: "Carbs", val: recipe.carbs, unit: "g" },
                            { label: "Fat", val: recipe.fat, unit: "g" },
                        ].map(m => (
                            <div key={m.label} className="px-4 text-center">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                                <p className="text-lg font-black" style={{ color: "var(--brand-green)" }}>{m.val}</p>
                                <p className="text-xs text-zinc-400">{m.unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Library with sidebar */}
            <div className="flex gap-8 items-start pt-2">
                {/* Left Sidebar */}
                <div className="w-52 flex-shrink-0 space-y-6">
                    {/* Folders */}
                    <div className="bg-white rounded-[20px] border border-zinc-200/80 p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">FOLDERS</p>
                        <ul className="space-y-1">
                            {FOLDERS.map(folder => {
                                const count = folder === "All" 
                                    ? library.length 
                                    : folder === "Favorites"
                                        ? library.filter(r => r.isFavorite).length
                                        : library.filter(r => (r.tags || []).includes(folder)).length;
                                const isActive = activeFolder === folder;
                                return (
                                    <li key={folder}>
                                        <button onClick={() => setActiveFolder(folder)}
                                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive ? 'text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                            style={{ background: isActive ? "var(--brand-green-dark)" : "" }}>
                                            <span className="flex items-center gap-2">
                                                <span>{isActive ? (folder === "Favorites" ? "⭐" : "🗂️") : (folder === "Favorites" ? "☆" : "📁")}</span>
                                                {folder}
                                            </span>
                                            <span className={`text-[11px] font-bold ${isActive ? "text-white/70" : "text-zinc-400"}`}>{count}</span>
                                        </button>
                                    </li>
                                );
                            })}
                            <li>
                                <button className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-400 hover:bg-zinc-50 transition-all">
                                    <span>➕</span> New folder
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div className="bg-white rounded-[20px] border border-zinc-200/80 p-4 shadow-sm">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">TAGS</p>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button key={tag} onClick={() => setActiveFolder(tag)}
                                        className="px-3 py-1 rounded-full text-[11px] font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recipe Grid */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <div className="relative mb-5">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search recipes..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-[16px] text-[14px] outline-none shadow-sm focus:border-zinc-300 transition-colors text-zinc-800"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="p-8 text-center rounded-[20px] border border-dashed border-zinc-200 bg-white">
                            <p className="text-sm font-medium text-zinc-400">No recipes found. Import a recipe above to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((item) => {
                                const source = getSource(item.id);
                                const gradient = getGradient(item.id);
                                return (
                                    <div key={item.id} 
                                        onClick={() => setSelectedRecipe(item)}
                                        className="bg-white rounded-[20px] border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                        {/* Color Block Header */}
                                        <div className={`h-[110px] bg-gradient-to-br ${gradient} relative`}>
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">
                                                {source}
                                            </span>
                                            <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">
                                                {item.calories} cal/srv
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleFav(item.id, !item.isFavorite); }}
                                                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-110">
                                                {item.isFavorite ? "❤️" : "🤍"}
                                            </button>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-[15px] text-zinc-900 leading-tight mb-2">{item.title}</h3>
                                            <div className="flex items-center gap-3 text-zinc-400 text-[12px] mb-3">
                                                <span className="flex items-center gap-1">⏱ {item.cookTime}m</span>
                                                <span className="flex items-center gap-1">👥 {item.servings || 2}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {(item.tags || []).map((tag: string) => (
                                                    <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-200 text-zinc-600 bg-zinc-50">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="text-[12px] font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                                                Remove from vault
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Saved Recipe Details Modal */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/60 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <button onClick={() => handleToggleFav(selectedRecipe.id, !selectedRecipe.isFavorite)}
                                        className="text-2xl hover:scale-110 transition-transform">
                                        {selectedRecipe.isFavorite ? "❤️" : "🤍"}
                                    </button>
                                    <h2 className="text-xl font-bold text-zinc-900">{selectedRecipe.title}</h2>
                                </div>
                                <div className="flex gap-4 mt-2 text-zinc-500">
                                    <span className="text-sm">⏱ {selectedRecipe.cookTime} min</span>
                                    <span className="text-sm">🍽 {selectedRecipe.servings || 2} servings</span>
                                    <span className="text-sm">🔥 {selectedRecipe.calories} kcal</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRecipe(null)}
                                className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-sm">
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                            {/* Ingredients */}
                            <div className="p-6">
                                <h3 className="font-bold mb-4 flex items-center justify-between text-zinc-900">
                                    <span>Ingredients</span>
                                    <span className="text-xs font-semibold text-zinc-400">{(selectedRecipe.ingredients || []).length} items</span>
                                </h3>
                                <ul className="space-y-2">
                                    {(selectedRecipe.ingredients || []).map((ing: any, i: number) => {
                                        const suggestion = getSuggestionForIngredient(ing.originalName || ing.name);
                                        return (
                                            <li key={i} className={`flex items-center justify-between p-3 rounded-xl border ${ing.isSubstituted ? 'border-blue-200 bg-blue-50' : 'border-transparent bg-zinc-50'}`}>
                                                <div>
                                                    <span className="text-sm font-medium text-zinc-900">
                                                        {ing.amount} {ing.unit} {ing.name}
                                                    </span>
                                                    {ing.isSubstituted && (
                                                        <p className="text-xs font-bold text-blue-600 mt-0.5">
                                                            🔄 Substituted for {ing.substituteFor}
                                                        </p>
                                                    )}
                                                </div>
                                                {suggestion && (
                                                    <select 
                                                        value={ing.isSubstituted ? `🔄 ${ing.name}` : `Original: ${ing.name}`}
                                                        onChange={(e) => handleSavedIngredientSubstitution(ing.id, e.target.value)}
                                                        className="text-xs px-2 py-1.5 rounded-lg font-bold cursor-pointer outline-none shadow-sm border border-zinc-100 bg-white text-[#2c7a51]">
                                                        <option value={`Original: ${ing.originalName || ing.name}`}>Original: {ing.originalName || ing.name}</option>
                                                        <option value={`🔄 ${suggestion}`}>🔄 {suggestion}</option>
                                                    </select>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="p-6">
                                <h3 className="font-bold mb-4 text-zinc-900">Instructions</h3>
                                <ol className="space-y-4">
                                    {(JSON.parse(selectedRecipe.instructions || "[]")).map((step: string, i: number) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: "var(--brand-green)" }}>{i + 1}</span>
                                            <p className="text-sm leading-relaxed text-zinc-500">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {/* Macros Footer */}
                        <div className="p-4 border-t border-zinc-100 grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/60 flex-shrink-0">
                            {[
                                { label: "Calories", val: selectedRecipe.calories, unit: "kcal" },
                                { label: "Protein", val: selectedRecipe.protein, unit: "g" },
                                { label: "Carbs", val: selectedRecipe.carbs, unit: "g" },
                                { label: "Fat", val: selectedRecipe.fat, unit: "g" },
                            ].map(m => (
                                <div key={m.label} className="px-4 text-center">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                                    <p className="text-lg font-black" style={{ color: "var(--brand-green)" }}>{m.val}</p>
                                    <p className="text-xs text-zinc-400">{m.unit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
