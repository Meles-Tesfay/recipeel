"use client";

import { useState } from "react";

export default function RecipesPage() {
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setRecipe(null);
    await new Promise(r => setTimeout(r, 2200));

    setRecipe({
      title: "Creamy Tuscan Chicken",
      cookTime: 30,
      servings: 4,
      calories: 550,
      protein: 42,
      carbs: 12,
      fat: 35,
      ingredients: [
        { name: "Chicken Breast", amount: "2 lbs", conflict: null },
        { name: "Heavy Cream", amount: "1 cup", conflict: "Dairy", suggestion: "Coconut Milk" },
        { name: "Parmesan", amount: "½ cup", conflict: "Dairy", suggestion: "Nutritional Yeast" },
        { name: "Spinach", amount: "2 cups", conflict: null },
        { name: "Sun-dried Tomatoes", amount: "½ cup", conflict: null },
        { name: "Garlic Cloves", amount: "4 cloves", conflict: null },
      ],
      instructions: [
        "Season chicken breast with salt, pepper, and Italian seasoning.",
        "Sear chicken in olive oil over medium-high heat until golden, about 4 minutes per side. Remove and set aside.",
        "In the same pan, sauté garlic until fragrant. Add heavy cream and parmesan to form the sauce.",
        "Stir in spinach and sun-dried tomatoes until spinach wilts.",
        "Return chicken to the pan. Simmer on low for 5 minutes until cooked through.",
      ],
    });
    setImporting(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Recipe Library</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Import recipes from social media or build your own.</p>
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Import from Social Media</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Paste a TikTok, Instagram Reel, or YouTube Shorts link below.</p>
        <form onSubmit={handleImport} className="flex gap-3">
          <input
            type="url" required value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@chef/video/..."
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--foreground)" }}
          />
          <button type="submit" disabled={importing || !importUrl}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--brand-green)" }}>
            {importing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Extracting...
              </>
            ) : "Import Recipe"}
          </button>
        </form>
      </div>

      {/* Imported Recipe */}
      {recipe && (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {/* Recipe Header */}
          <div className="p-6 border-b flex justify-between items-start" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{recipe.title}</h2>
              <div className="flex gap-4 mt-2">
                <span className="text-sm" style={{ color: "var(--muted)" }}>⏱ {recipe.cookTime} min</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>🍽 {recipe.servings} servings</span>
                <span className="text-sm" style={{ color: "var(--muted)" }}>🔥 {recipe.calories} kcal</span>
              </div>
            </div>
            <button onClick={() => setSaved(!saved)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${saved ? "text-white" : "border"}`}
              style={saved
                ? { background: "var(--brand-green)" }
                : { borderColor: "var(--border)", color: "var(--muted)" }}>
              {saved ? "✓ Saved" : "Save Recipe"}
            </button>
          </div>

          {/* Conflict Banner */}
          {recipe.ingredients.some((i: any) => i.conflict) && (
            <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Dietary Conflicts Detected</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Some ingredients conflict with your dietary profile. Review substitutions below.
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "var(--brand-green)" }}>
                    Replace All Automatically
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x"
            style={{ borderColor: "var(--border)" }}>
            {/* Ingredients */}
            <div className="p-6">
              <h3 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing: any, i: number) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: ing.conflict ? "#fef3c7" : "var(--surface-raised)" }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {ing.amount} {ing.name}
                      </span>
                      {ing.conflict && (
                        <p className="text-xs font-semibold text-amber-700 mt-0.5">⚠️ {ing.conflict} conflict</p>
                      )}
                    </div>
                    {ing.suggestion && (
                      <select className="text-xs px-2 py-1.5 rounded-lg border-0 font-semibold cursor-pointer"
                        style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                        <option>Original: {ing.name}</option>
                        <option>🔄 {ing.suggestion}</option>
                      </select>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="p-6">
              <h3 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--brand-green)" }}>
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Macros Footer */}
          <div className="p-4 border-t grid grid-cols-4 divide-x" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
            {[
              { label: "Calories", val: recipe.calories, unit: "kcal" },
              { label: "Protein", val: recipe.protein, unit: "g" },
              { label: "Carbs", val: recipe.carbs, unit: "g" },
              { label: "Fat", val: recipe.fat, unit: "g" },
            ].map(m => (
              <div key={m.label} className="px-4 text-center" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{m.label}</p>
                <p className="text-lg font-black" style={{ color: "var(--brand-green)" }}>{m.val}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{m.unit}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
