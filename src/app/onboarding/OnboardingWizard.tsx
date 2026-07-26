"use client";

import { useState } from "react";
import { saveOnboardingPreferences } from "@/lib/actions";

const STEPS = [
  { id: "dietary", title: "Dietary Preferences", subtitle: "Select all that apply to you", icon: "🥗" },
  { id: "allergies", title: "Food Allergies", subtitle: "We'll automatically flag these in recipes", icon: "⚠️" },
  { id: "cooking", title: "Cooking Preferences", subtitle: "How do you like to cook?", icon: "🍳" },
  { id: "goals", title: "Goals & Budget", subtitle: "Help us personalize your experience", icon: "🎯" },
  { id: "macros", title: "Daily Nutrition Goals", subtitle: "We'll track these for you automatically", icon: "📊" },
];

const DIETARY_OPTIONS = [
  { label: "Vegan", emoji: "🌿" },
  { label: "Vegetarian", emoji: "🥦" },
  { label: "Pescatarian", emoji: "🐟" },
  { label: "Keto", emoji: "🥑" },
  { label: "Paleo", emoji: "🍖" },
  { label: "Halal", emoji: "☪️" },
  { label: "Kosher", emoji: "✡️" },
  { label: "Gluten-Free", emoji: "🌾" },
  { label: "Dairy-Free", emoji: "🥛" },
];

const ALLERGY_OPTIONS = [
  { label: "Dairy", emoji: "🧀" },
  { label: "Gluten", emoji: "🌾" },
  { label: "Peanuts", emoji: "🥜" },
  { label: "Tree Nuts", emoji: "🌰" },
  { label: "Soy", emoji: "🫘" },
  { label: "Shellfish", emoji: "🦐" },
  { label: "Eggs", emoji: "🥚" },
  { label: "Fish", emoji: "🐠" },
];

const COOKING_OPTIONS = [
  { label: "Quick & Easy", emoji: "⏱️" },
  { label: "Meal Prep", emoji: "🍱" },
  { label: "Slow Cooker", emoji: "🍲" },
  { label: "Air Fryer", emoji: "💨" },
  { label: "Baking", emoji: "🥐" },
  { label: "Grilling", emoji: "🔥" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dietary: [] as string[],
    allergies: [] as string[],
    cookingPrefs: [] as string[],
    fitnessGoals: "",
    budget: "",
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 65,
  });

  const toggle = (key: "dietary" | "allergies" | "cookingPrefs", value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((i: string) => i !== value)
        : [...prev[key], value],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await saveOnboardingPreferences(formData);
      window.location.href = "/dashboard";
    } catch {
      alert("Failed to save. Please make sure you are logged in.");
    }
    setLoading(false);
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[520px]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{current.icon}</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{current.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{current.subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--brand-green)" }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--border)" }}>

          {/* Step 0 — Dietary */}
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map(({ label, emoji }) => (
                <button key={label} onClick={() => toggle("dietary", label)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: formData.dietary.includes(label) ? "var(--brand-green)" : "var(--border)",
                    background: formData.dietary.includes(label) ? "var(--brand-green-pale)" : "var(--surface-raised)",
                    color: formData.dietary.includes(label) ? "var(--brand-green-dark)" : "var(--foreground)",
                  }}>
                  <span className="text-2xl">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Step 1 — Allergies */}
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALLERGY_OPTIONS.map(({ label, emoji }) => (
                <button key={label} onClick={() => toggle("allergies", label)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: formData.allergies.includes(label) ? "#dc2626" : "var(--border)",
                    background: formData.allergies.includes(label) ? "#fef2f2" : "var(--surface-raised)",
                    color: formData.allergies.includes(label) ? "#dc2626" : "var(--foreground)",
                  }}>
                  <span className="text-2xl">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Cooking Preferences */}
          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COOKING_OPTIONS.map(({ label, emoji }) => (
                <button key={label} onClick={() => toggle("cookingPrefs", label)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: formData.cookingPrefs.includes(label) ? "var(--brand-green)" : "var(--border)",
                    background: formData.cookingPrefs.includes(label) ? "var(--brand-green-pale)" : "var(--surface-raised)",
                    color: formData.cookingPrefs.includes(label) ? "var(--brand-green-dark)" : "var(--foreground)",
                  }}>
                  <span className="text-2xl">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Step 3 — Goals & Budget */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Fitness Goal</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Weight Loss", emoji: "⬇️" },
                    { label: "Muscle Gain", emoji: "💪" },
                    { label: "Maintenance", emoji: "⚖️" },
                  ].map(({ label, emoji }) => (
                    <button key={label} onClick={() => setFormData(p => ({ ...p, fitnessGoals: label }))}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: formData.fitnessGoals === label ? "var(--brand-green)" : "var(--border)",
                        background: formData.fitnessGoals === label ? "var(--brand-green-pale)" : "var(--surface-raised)",
                        color: formData.fitnessGoals === label ? "var(--brand-green-dark)" : "var(--foreground)",
                      }}>
                      <span className="text-2xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Weekly Grocery Budget</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Budget", value: "$", emoji: "💰" },
                    { label: "Moderate", value: "$$", emoji: "💳" },
                    { label: "Premium", value: "$$$", emoji: "💎" },
                  ].map(({ label, value, emoji }) => (
                    <button key={value} onClick={() => setFormData(p => ({ ...p, budget: value }))}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{
                        borderColor: formData.budget === value ? "var(--brand-green)" : "var(--border)",
                        background: formData.budget === value ? "var(--brand-green-pale)" : "var(--surface-raised)",
                        color: formData.budget === value ? "var(--brand-green-dark)" : "var(--foreground)",
                      }}>
                      <span className="text-2xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Macros */}
          {step === 4 && (
            <div className="space-y-5">
              {[
                { key: "dailyCalories", label: "Daily Calories", unit: "kcal", min: 1000, max: 4000, step: 50 },
                { key: "dailyProtein", label: "Protein", unit: "g", min: 50, max: 300, step: 5 },
                { key: "dailyCarbs", label: "Carbohydrates", unit: "g", min: 50, max: 500, step: 5 },
                { key: "dailyFat", label: "Fat", unit: "g", min: 20, max: 200, step: 5 },
              ].map(field => (
                <div key={field.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{field.label}</label>
                    <span className="text-sm font-bold px-3 py-1 rounded-lg"
                      style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                      {formData[field.key as keyof typeof formData]} {field.unit}
                    </span>
                  </div>
                  <input type="range"
                    min={field.min} max={field.max} step={field.step}
                    value={formData[field.key as keyof typeof formData] as number}
                    onChange={e => setFormData(p => ({ ...p, [field.key]: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--brand-green)" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
              style={{ background: "var(--brand-green)" }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--brand-green)" }}>
              {loading ? "Setting up..." : "Complete Setup ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
