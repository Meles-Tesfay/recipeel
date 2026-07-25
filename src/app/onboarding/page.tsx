import { OnboardingWizard } from "./OnboardingWizard";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <OnboardingWizard />
            </div>
        </div>
    );
}
