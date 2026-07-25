"use client";

import { useState } from "react";
import { saveOnboardingPreferences } from "@/lib/actions";

const steps = [
    { title: "Dietary Preferences", id: "dietary" },
    { title: "Allergies", id: "allergies" },
    { title: "Fitness Goals & Budget", id: "goals" },
];

export function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dietary: [] as string[],
        allergies: [] as string[],
        fitnessGoals: "",
        budget: "",
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyCarbs: 200,
        dailyFat: 65,
    });

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            setLoading(true);
            try {
                await saveOnboardingPreferences(formData);
                window.location.href = "/dashboard";
            } catch (err) {
                console.error(err);
                alert("Failed to save preferences. Please make sure you are logged in.");
            }
            setLoading(false);
        }
    };

    const toggleArrayItem = (key: 'dietary' | 'allergies', item: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].includes(item) 
                ? prev[key].filter(i => i !== item)
                : [...prev[key], item]
        }));
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{steps[currentStep].title}</h2>
                <div className="flex gap-2 mt-4">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i <= currentStep ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                    ))}
                </div>
            </div>

            <div className="min-h-[300px]">
                {currentStep === 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {["Vegan", "Vegetarian", "Pescatarian", "Keto", "Paleo", "Halal", "Kosher"].map(diet => (
                            <button
                                key={diet}
                                onClick={() => toggleArrayItem('dietary', diet)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    formData.dietary.includes(diet) 
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' 
                                        : 'border-zinc-200 dark:border-zinc-800 hover:border-orange-300'
                                }`}
                            >
                                <span className="font-medium">{diet}</span>
                            </button>
                        ))}
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                        {["Dairy", "Gluten", "Peanuts", "Tree Nuts", "Soy", "Shellfish", "Eggs"].map(allergy => (
                            <button
                                key={allergy}
                                onClick={() => toggleArrayItem('allergies', allergy)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    formData.allergies.includes(allergy) 
                                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30' 
                                        : 'border-zinc-200 dark:border-zinc-800 hover:border-red-300'
                                }`}
                            >
                                <span className="font-medium">{allergy}</span>
                            </button>
                        ))}
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Fitness Goal</label>
                            <select 
                                value={formData.fitnessGoals}
                                onChange={e => setFormData(p => ({ ...p, fitnessGoals: e.target.value }))}
                                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            >
                                <option value="">Select a goal</option>
                                <option value="Weight Loss">Weight Loss</option>
                                <option value="Muscle Gain">Muscle Gain</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Weekly Budget</label>
                            <select 
                                value={formData.budget}
                                onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent"
                            >
                                <option value="">Select a budget</option>
                                <option value="$">$ (Low)</option>
                                <option value="$$">$$ (Medium)</option>
                                <option value="$$$">$$$ (High)</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between">
                <button
                    onClick={() => setCurrentStep(c => Math.max(0, c - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-2 rounded-lg font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                    {currentStep === steps.length - 1 ? (loading ? "Saving..." : "Complete") : "Next"}
                </button>
            </div>
        </div>
    );
}
