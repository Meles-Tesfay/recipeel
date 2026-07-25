"use client";

import { useState } from "react";

export default function RecipesPage() {
    const [importUrl, setImportUrl] = useState("");
    const [importing, setImporting] = useState(false);
    const [importedData, setImportedData] = useState<any>(null);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setImporting(true);
        // Simulate AI extraction delay
        await new Promise(r => setTimeout(r, 2000));
        
        setImportedData({
            title: "Creamy Tuscan Chicken",
            cookTime: 30,
            calories: 550,
            ingredients: [
                { name: "Chicken Breast", amount: 2, unit: "lbs" },
                { name: "Heavy Cream", amount: 1, unit: "cup", conflict: "Dairy Allergy Detected", suggestion: "Coconut Milk" },
                { name: "Parmesan", amount: 0.5, unit: "cup", conflict: "Dairy Allergy Detected", suggestion: "Nutritional Yeast" },
                { name: "Spinach", amount: 2, unit: "cups" },
                { name: "Sun-dried Tomatoes", amount: 0.5, unit: "cup" }
            ],
            instructions: [
                "Season chicken and sear in a pan until golden.",
                "Remove chicken, add heavy cream and parmesan to make the sauce.",
                "Stir in spinach and sun-dried tomatoes until wilted.",
                "Return chicken to pan and simmer for 5 minutes."
            ]
        });
        setImporting(false);
        setImportUrl("");
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Recipe Library</h1>
                    <p className="text-zinc-500 mt-2">Manage your recipes, or import new ones using AI.</p>
                </div>
            </header>

            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-4">Import from Social Media</h2>
                <form onSubmit={handleImport} className="flex gap-4">
                    <input 
                        type="url" 
                        required
                        value={importUrl}
                        onChange={e => setImportUrl(e.target.value)}
                        placeholder="Paste TikTok, Instagram Reel, or YouTube Shorts link..."
                        className="flex-1 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={importing || !importUrl}
                        className="px-6 py-3 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {importing ? (
                            <>
                                <span className="animate-spin text-xl">↻</span> Extracting...
                            </>
                        ) : "Import Recipe"}
                    </button>
                </form>
            </section>

            {importedData && (
                <section className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border-2 border-orange-500/20 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{importedData.title}</h2>
                            <p className="text-zinc-500 mt-1">{importedData.cookTime} mins • {importedData.calories} kcal</p>
                        </div>
                        <button className="px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200">
                            Save Recipe
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">Ingredients</h3>
                            <ul className="space-y-4">
                                {importedData.ingredients.map((ing: any, i: number) => (
                                    <li key={i} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">{ing.amount} {ing.unit} {ing.name}</span>
                                            {ing.conflict && (
                                                <p className="text-xs font-semibold text-red-500 mt-1">⚠️ {ing.conflict}</p>
                                            )}
                                        </div>
                                        {ing.suggestion && (
                                            <select className="text-sm p-1.5 rounded bg-orange-50 text-orange-700 font-medium border-0 cursor-pointer">
                                                <option>Original: {ing.name}</option>
                                                <option>Substitute: {ing.suggestion}</option>
                                            </select>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4">Instructions</h3>
                            <ol className="space-y-4 list-decimal list-inside text-zinc-600 dark:text-zinc-400">
                                {importedData.instructions.map((step: string, i: number) => (
                                    <li key={i} className="leading-relaxed">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
