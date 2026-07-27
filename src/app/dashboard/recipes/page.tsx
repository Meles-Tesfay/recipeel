"use client";

import { useState, useEffect, useRef } from "react";
import {
    searchRecipesByName,
    extractRecipeFromUrl,
    saveRecipe,
    getUserRecipes,
    deleteRecipe,
    toggleFavorite,
    updateIngredient,
    updateRecipeTags,
} from "@/lib/actions";

const CARD_GRADIENTS = [
    "from-emerald-400 to-teal-500",
    "from-teal-400 to-cyan-500",
    "from-orange-400 to-amber-500",
    "from-green-500 to-emerald-600",
    "from-violet-400 to-purple-500",
    "from-rose-400 to-pink-500",
];

const SOURCES = ["TikTok", "Instagram", "YouTube", "Website"];

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

// ─── Search Result Card ────────────────────────────────────────────────────
function SearchResultCard({ result, onSelect }: { result: any; onSelect: () => void }) {
    const conflictCount = (result.ingredients || []).filter((i: any) => i.conflict).length;
    return (
        <div
            onClick={onSelect}
            className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
            {/* Thumbnail */}
            {result.thumbnail ? (
                <div className="h-36 overflow-hidden relative">
                    <img
                        src={result.thumbnail}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {result.area && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
                            {result.area}
                        </span>
                    )}
                    {conflictCount > 0 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold">
                            ⚠️ {conflictCount} conflict{conflictCount > 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            ) : (
                <div className={`h-36 bg-gradient-to-br ${getGradient(result.id || result.title)} flex items-center justify-center`}>
                    <span className="text-4xl">🍽️</span>
                </div>
            )}

            <div className="p-4">
                <h3 className="font-bold text-[14px] text-zinc-900 leading-tight mb-1 line-clamp-2">{result.title}</h3>
                <div className="flex items-center gap-3 text-zinc-400 text-[11px] mb-3">
                    {result.category && <span>🏷️ {result.category}</span>}
                    <span>⏱ {result.cookTime}m</span>
                    <span>🔥 {result.calories} kcal</span>
                </div>
                <button className="w-full py-1.5 rounded-lg text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)" }}>
                    View & Add Recipe
                </button>
            </div>
        </div>
    );
}

export default function RecipesPage() {
    // Tab state
    const [activeTab, setActiveTab] = useState<"search" | "url">("search");

    // Search mode state
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // URL import mode state
    const [importUrl, setImportUrl] = useState("");
    const [importing, setImporting] = useState(false);

    // Shared draft recipe state
    const [recipe, setRecipe] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    // Library state
    const [library, setLibrary] = useState<any[]>([]);
    const [activeFolder, setActiveFolder] = useState("All");
    const [libSearchQuery, setLibSearchQuery] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

    // Tag/folder editing
    const [editingTags, setEditingTags] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [selectedFolder, setSelectedFolder] = useState("");

    // Popular searches
    const popularSearches = ["Pasta", "Chicken", "Salad", "Soup", "Burger", "Pizza", "Fish", "Beef"];

    useEffect(() => { loadLibrary(); }, []);

    const loadLibrary = async () => {
        const res = await getUserRecipes();
        setLibrary(res);
    };

    const handleSearch = async (e: React.FormEvent | null, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const q = overrideQuery ?? searchQuery;
        if (!q.trim()) return;
        setSearching(true);
        setRecipe(null);
        setSaved(false);
        setHasSearched(true);
        try {
            const results = await searchRecipesByName(q.trim());
            setSearchResults(results);
        } catch {
            alert("Search failed. Please try again.");
        }
        setSearching(false);
    };

    const handleUrlImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setImporting(true);
        setRecipe(null);
        setSaved(false);
        try {
            const extracted = await extractRecipeFromUrl(importUrl);
            setRecipe(extracted);
            setSearchResults([]);
        } catch {
            alert("Failed to import recipe.");
        }
        setImporting(false);
    };

    const handleSelectSearchResult = (result: any) => {
        setRecipe(result);
        setSaved(false);
        // Scroll to draft panel
        setTimeout(() => {
            document.getElementById("recipe-draft")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
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
        if (selectedRecipe && selectedRecipe.id === id) setSelectedRecipe(null);
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

    const openRecipeDetail = (recipe: any) => {
        setSelectedRecipe(recipe);
        setTagInput((recipe.tags || []).join(", "));
        setSelectedFolder(recipe.folder || "");
        setEditingTags(false);
    };

    const handleSaveTagsAndFolder = async () => {
        if (!selectedRecipe) return;
        const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
        await updateRecipeTags(selectedRecipe.id, tags, selectedFolder);
        const updatedLibrary = await getUserRecipes();
        setLibrary(updatedLibrary);
        const updated = updatedLibrary.find(r => r.id === selectedRecipe.id);
        setSelectedRecipe(updated);
        setEditingTags(false);
    };



    const allTags = Array.from(new Set(library.flatMap(r => r.tags || [])));
    const filtered = library.filter(r => {
        const matchesSearch = !libSearchQuery || r.title.toLowerCase().includes(libSearchQuery.toLowerCase());
        let matchesFolder = true;
        if (activeFolder === "Favorites") matchesFolder = r.isFavorite;
        else if (activeFolder !== "All") matchesFolder = (r.tags || []).includes(activeFolder);
        return matchesSearch && matchesFolder;
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-zinc-900 tracking-tight">Recipes</h1>
                <p className="text-sm text-zinc-500 mt-1">Find recipes from the web, import from social media, and save to your library.</p>
            </div>

            {/* ─── Import / Search Panel ─── */}
            <div className="bg-white rounded-[20px] border border-zinc-200/80 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-zinc-100">
                    <button
                        onClick={() => { setActiveTab("search"); setRecipe(null); setSaved(false); }}
                        className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                            activeTab === "search"
                                ? "border-b-2 text-zinc-900"
                                : "text-zinc-400 hover:text-zinc-600"
                        }`}
                        style={{ borderColor: activeTab === "search" ? "var(--brand-green)" : "transparent" }}
                    >
                        🔍 Search by Name
                    </button>
                    <button
                        onClick={() => { setActiveTab("url"); setSearchResults([]); setHasSearched(false); }}
                        className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                            activeTab === "url"
                                ? "border-b-2 text-zinc-900"
                                : "text-zinc-400 hover:text-zinc-600"
                        }`}
                        style={{ borderColor: activeTab === "url" ? "var(--brand-green)" : "transparent" }}
                    >
                        🔗 Import from URL
                    </button>
                </div>

                <div className="p-4 md:p-6">
                    {activeTab === "search" ? (
                        <>
                            <p className="text-sm text-zinc-500 mb-4">Search thousands of real recipes. Results are automatically adapted to your dietary profile.</p>
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="relative flex-1">
                                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="e.g. Chicken Pasta, Beef Stir Fry..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 text-zinc-800 focus:border-zinc-400 transition-colors"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={searching || !searchQuery.trim()}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {searching ? (
                                        <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Searching...</>
                                    ) : "Search"}
                                </button>
                            </form>

                            {/* Popular searches */}
                            {!hasSearched && (
                                <div className="mt-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Popular</p>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSearches.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setSearchQuery(s); handleSearch(null, s); }}
                                                className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 transition-colors bg-white"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-zinc-500 mb-4">Paste a TikTok, Instagram Reel, YouTube Shorts, or any recipe website link.</p>
                            <form onSubmit={handleUrlImport} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="url"
                                    required
                                    value={importUrl}
                                    onChange={e => setImportUrl(e.target.value)}
                                    placeholder="https://www.tiktok.com/@chef/video/..."
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none bg-zinc-50 text-zinc-800 focus:border-zinc-400 transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={importing || !importUrl}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all whitespace-nowrap"
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {importing ? (
                                        <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Extracting...</>
                                    ) : "Import Recipe"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Search Results Grid ─── */}
            {activeTab === "search" && hasSearched && !recipe && (
                <div>
                    {searching ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-3">
                                <span className="inline-block w-10 h-10 border-4 border-zinc-100 border-t-[var(--brand-green)] rounded-full animate-spin" />
                                <p className="text-sm text-zinc-500 font-medium">Searching real recipes...</p>
                            </div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="p-8 text-center rounded-[20px] border border-dashed border-zinc-200 bg-white">
                            <p className="text-2xl mb-2">🍽️</p>
                            <p className="text-sm font-semibold text-zinc-700">No recipes found for &quot;{searchQuery}&quot;</p>
                            <p className="text-xs text-zinc-400 mt-1">Try a different keyword like &quot;chicken&quot;, &quot;pasta&quot;, or &quot;salad&quot;</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-zinc-500 mb-4">
                                Found <span className="font-bold text-zinc-800">{searchResults.length}</span> recipes for &ldquo;<span className="font-bold text-zinc-800">{searchQuery}</span>&rdquo; · click a card to review and save
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {searchResults.map(result => (
                                    <SearchResultCard
                                        key={result.id || result.title}
                                        result={result}
                                        onSelect={() => handleSelectSearchResult(result)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Recipe Draft Panel ─── */}
            {recipe && (
                <div id="recipe-draft" className="bg-white rounded-[20px] border border-zinc-200/80 overflow-hidden shadow-sm">
                    {/* Draft Header */}
                    <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/60">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex gap-4">
                                {recipe.thumbnail && (
                                    <img
                                        src={recipe.thumbnail}
                                        alt={recipe.title}
                                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                    />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Draft</span>
                                        {recipe.source === "TheMealDB" && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-md">✓ Real Recipe</span>
                                        )}
                                        {recipe.source && recipe.source !== "TheMealDB" && (
                                            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                                                From {recipe.source}
                                            </span>
                                        )}
                                        <h2 className="text-lg md:text-xl font-bold text-zinc-900">{recipe.title}</h2>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-zinc-500 text-sm">
                                        <span>⏱ {recipe.cookTime} min</span>
                                        <span>🍽 {recipe.servings} servings</span>
                                        <span>🔥 {recipe.calories} kcal</span>
                                        {recipe.area && <span>📍 {recipe.area}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    onClick={() => { setRecipe(null); setSaved(false); }}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saved}
                                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all text-white ${saved ? "opacity-70" : "hover:-translate-y-0.5 shadow-md"}`}
                                    style={{ background: "var(--brand-green)" }}
                                >
                                    {saved ? "✓ Saved!" : "Save Recipe"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Conflict Alert */}
                    {recipe.ingredients.some((i: any) => i.conflict) && (
                        <div className="mx-4 md:mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">⚠️</span>
                            <div>
                                <p className="text-sm font-bold text-amber-800">Dietary Conflicts Detected</p>
                                <p className="text-sm text-amber-700 mt-0.5">Some ingredients conflict with your dietary profile.</p>
                                <button onClick={handleReplaceAll} className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90" style={{ background: "var(--brand-green)" }}>
                                    Replace All Automatically
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Ingredients + Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                        <div className="p-4 md:p-6">
                            <h3 className="font-bold mb-4 flex items-center justify-between text-zinc-900">
                                <span>Ingredients</span>
                                <span className="text-xs font-semibold text-zinc-400">{recipe.ingredients.length} items</span>
                            </h3>
                            <ul className="space-y-2">
                                {recipe.ingredients.map((ing: any, i: number) => (
                                    <li key={i} className={`flex items-center justify-between p-3 rounded-xl border ${ing.conflict ? 'border-amber-200 bg-amber-50' : ing.isSubstituted ? 'border-blue-200 bg-blue-50' : 'border-transparent bg-zinc-50'}`}>
                                        <div className="min-w-0 flex-1 mr-2">
                                            <span className={`text-sm font-medium ${ing.conflict ? 'text-amber-900' : 'text-zinc-900'}`}>
                                                {ing.amount} {ing.unit} {ing.name}
                                            </span>
                                            {ing.conflict && <p className="text-xs font-bold text-amber-700 mt-0.5">⚠️ {ing.conflict} conflict</p>}
                                            {ing.isSubstituted && <p className="text-xs font-bold text-blue-600 mt-0.5">🔄 Sub for {ing.substituteFor}</p>}
                                        </div>
                                        {ing.suggestion && !ing.isSubstituted && (
                                            <select onChange={e => handleReplaceSingle(i, e.target.value)}
                                                className="text-xs px-2 py-1.5 rounded-lg font-bold cursor-pointer outline-none shadow-sm border border-zinc-100 bg-white flex-shrink-0"
                                                style={{ color: "var(--brand-green)" }}>
                                                <option>Original: {ing.name}</option>
                                                <option>🔄 {ing.suggestion}</option>
                                            </select>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 md:p-6">
                            <h3 className="font-bold mb-4 text-zinc-900">Instructions</h3>
                            <ol className="space-y-3">
                                {recipe.instructions.map((step: string, i: number) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ background: "var(--brand-green)" }}>{i + 1}</span>
                                        <p className="text-sm leading-relaxed text-zinc-600">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Macros Footer */}
                    <div className="p-3 md:p-4 border-t border-zinc-100 grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/60">
                        {[
                            { label: "Calories", val: recipe.calories, unit: "kcal" },
                            { label: "Protein", val: recipe.protein, unit: "g" },
                            { label: "Carbs", val: recipe.carbs, unit: "g" },
                            { label: "Fat", val: recipe.fat, unit: "g" },
                        ].map(m => (
                            <div key={m.label} className="px-2 md:px-4 text-center">
                                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                                <p className="text-base md:text-lg font-black" style={{ color: "var(--brand-green)" }}>{m.val}</p>
                                <p className="text-[10px] text-zinc-400">{m.unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Library ─── */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-2">
                {/* Left Sidebar — hidden on mobile, shown as row on tablet */}
                <div className="w-full md:w-52 md:flex-shrink-0 space-y-4">
                    {/* Folders */}
                    <div className="bg-white rounded-[20px] border border-zinc-200/80 p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">FOLDERS</p>
                        <ul className="space-y-0.5">
                            {FOLDERS.map(folder => {
                                const count = folder === "All"
                                    ? library.length
                                    : folder === "Favorites"
                                        ? library.filter(r => r.isFavorite).length
                                        : library.filter(r => (r.tags || []).includes(folder)).length;
                                const isActive = activeFolder === folder;
                                return (
                                    <li key={folder}>
                                        <button
                                            onClick={() => setActiveFolder(folder)}
                                            className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive ? "text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
                                            style={{ background: isActive ? "var(--brand-green-dark)" : "" }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{isActive ? (folder === "Favorites" ? "⭐" : "🗂️") : (folder === "Favorites" ? "☆" : "📁")}</span>
                                                {folder}
                                            </span>
                                            <span className={`text-[11px] font-bold ${isActive ? "text-white/70" : "text-zinc-400"}`}>{count}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div className="bg-white rounded-[20px] border border-zinc-200/80 p-4 shadow-sm">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">TAGS</p>
                            <div className="flex flex-wrap gap-1.5">
                                {allTags.map(tag => (
                                    <button key={tag} onClick={() => setActiveFolder(tag)}
                                        className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all">
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Recipe Grid */}
                <div className="flex-1 min-w-0">
                    {/* Library Search */}
                    <div className="relative mb-5">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={libSearchQuery} onChange={e => setLibSearchQuery(e.target.value)}
                            placeholder="Search your library..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-[16px] text-[14px] outline-none shadow-sm focus:border-zinc-300 transition-colors text-zinc-800"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="p-8 text-center rounded-[20px] border border-dashed border-zinc-200 bg-white">
                            <p className="text-3xl mb-3">🍽️</p>
                            <p className="text-sm font-semibold text-zinc-700">No recipes in your library yet</p>
                            <p className="text-xs text-zinc-400 mt-1">Search for a recipe above and save it to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {filtered.map(item => {
                                const source = getSource(item.id);
                                const gradient = getGradient(item.id);
                                return (
                                    <div key={item.id}
                                        onClick={() => openRecipeDetail(item)}
                                        className="bg-white rounded-[20px] border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                        <div className={`h-[100px] bg-gradient-to-br ${gradient} relative`}>
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">{source}</span>
                                            <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full">{item.calories} cal</span>
                                            <button onClick={e => { e.stopPropagation(); handleToggleFav(item.id, !item.isFavorite); }}
                                                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-110">
                                                {item.isFavorite ? "❤️" : "🤍"}
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-[14px] text-zinc-900 leading-tight mb-2 line-clamp-2">{item.title}</h3>
                                            <div className="flex items-center gap-3 text-zinc-400 text-[12px] mb-3">
                                                <span>⏱ {item.cookTime}m</span>
                                                <span>👥 {item.servings || 2}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {(item.tags || []).map((tag: string) => (
                                                    <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-zinc-200 text-zinc-600 bg-zinc-50">{tag}</span>
                                                ))}
                                            </div>
                                            <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="text-[12px] font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                                                Remove from library
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Saved Recipe Detail Modal ─── */}
            {selectedRecipe && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
                    onClick={() => setSelectedRecipe(null)}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/60 flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                    <button onClick={() => handleToggleFav(selectedRecipe.id, !selectedRecipe.isFavorite)} className="text-2xl hover:scale-110 transition-transform">
                                        {selectedRecipe.isFavorite ? "❤️" : "🤍"}
                                    </button>
                                    <h2 className="text-lg md:text-xl font-bold text-zinc-900">{selectedRecipe.title}</h2>
                                </div>
                                <div className="flex flex-wrap gap-3 text-zinc-500 text-sm">
                                    <span>⏱ {selectedRecipe.cookTime} min</span>
                                    <span>🍽 {selectedRecipe.servings || 2} servings</span>
                                    <span>🔥 {selectedRecipe.calories} kcal</span>
                                </div>
                                
                                {/* Tag/Folder Editing */}
                                <div className="mt-4">
                                    {!editingTags ? (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {(selectedRecipe.tags || []).map((t: string) => (
                                                <span key={t} className="px-2 py-1 rounded-md text-[11px] font-bold border border-zinc-200 text-zinc-600 bg-white">{t}</span>
                                            ))}
                                            {selectedRecipe.folder && (
                                                <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">📁 {selectedRecipe.folder}</span>
                                            )}
                                            <button onClick={() => setEditingTags(true)} className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 ml-1">✎ Edit</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mt-2 p-3 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={e => setTagInput(e.target.value)}
                                                placeholder="Tags (comma separated)"
                                                className="flex-1 text-xs px-2 py-1.5 border border-zinc-200 rounded-lg outline-none focus:border-zinc-400"
                                            />
                                            <select
                                                value={selectedFolder}
                                                onChange={e => setSelectedFolder(e.target.value)}
                                                className="text-xs px-2 py-1.5 border border-zinc-200 rounded-lg outline-none cursor-pointer"
                                            >
                                                <option value="">No folder</option>
                                                <option value="Breakfast">Breakfast</option>
                                                <option value="Lunch">Lunch</option>
                                                <option value="Dinner">Dinner</option>
                                                <option value="Snacks">Snacks</option>
                                                <option value="Desserts">Desserts</option>
                                            </select>
                                            <div className="flex gap-1">
                                                <button onClick={handleSaveTagsAndFolder} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity" style={{ background: "var(--brand-green)" }}>Save</button>
                                                <button onClick={() => { setEditingTags(false); setTagInput((selectedRecipe.tags || []).join(", ")); setSelectedFolder(selectedRecipe.folder || ""); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-200 text-zinc-500 hover:bg-zinc-50">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedRecipe(null)}
                                className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-sm flex-shrink-0">
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                            <div className="p-4 md:p-6">
                                <h3 className="font-bold mb-4 flex items-center justify-between text-zinc-900">
                                    <span>Ingredients</span>
                                    <span className="text-xs font-semibold text-zinc-400">{(selectedRecipe.ingredients || []).length} items</span>
                                </h3>
                                <ul className="space-y-2">
                                    {(selectedRecipe.ingredients || []).map((ing: any, i: number) => {
                                        const suggestion = getSuggestionForIngredient(ing.originalName || ing.name);
                                        return (
                                            <li key={i} className={`flex items-center justify-between p-3 rounded-xl border ${ing.isSubstituted ? 'border-blue-200 bg-blue-50' : 'border-transparent bg-zinc-50'}`}>
                                                <div className="min-w-0 flex-1 mr-2">
                                                    <span className="text-sm font-medium text-zinc-900">{ing.amount} {ing.unit} {ing.name}</span>
                                                    {ing.isSubstituted && <p className="text-xs font-bold text-blue-600 mt-0.5">🔄 Sub for {ing.substituteFor}</p>}
                                                </div>
                                                {suggestion && (
                                                    <select
                                                        value={ing.isSubstituted ? `🔄 ${ing.name}` : `Original: ${ing.name}`}
                                                        onChange={e => handleSavedIngredientSubstitution(ing.id, e.target.value)}
                                                        className="text-xs px-2 py-1.5 rounded-lg font-bold cursor-pointer outline-none shadow-sm border border-zinc-100 bg-white flex-shrink-0"
                                                        style={{ color: "var(--brand-green)" }}>
                                                        <option value={`Original: ${ing.originalName || ing.name}`}>Original: {ing.originalName || ing.name}</option>
                                                        <option value={`🔄 ${suggestion}`}>🔄 {suggestion}</option>
                                                    </select>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="p-4 md:p-6">
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
                        <div className="p-3 md:p-4 border-t border-zinc-100 grid grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/60 flex-shrink-0">
                            {[
                                { label: "Calories", val: selectedRecipe.calories, unit: "kcal" },
                                { label: "Protein", val: selectedRecipe.protein, unit: "g" },
                                { label: "Carbs", val: selectedRecipe.carbs, unit: "g" },
                                { label: "Fat", val: selectedRecipe.fat, unit: "g" },
                            ].map(m => (
                                <div key={m.label} className="px-2 md:px-4 text-center">
                                    <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400">{m.label}</p>
                                    <p className="text-base md:text-lg font-black" style={{ color: "var(--brand-green)" }}>{m.val}</p>
                                    <p className="text-[10px] text-zinc-400">{m.unit}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
