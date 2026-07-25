import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
      <div className="max-w-3xl space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold tracking-wide text-sm mb-4">
          ✨ The Smart Recipe Assistant
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
          Your meals, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">perfectly peeled.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          ReciPeel automatically imports recipes from any social media link, adapts them to your dietary needs with smart substitutions, and plans your week in seconds.
        </p>

        <div className="pt-8 flex gap-4 justify-center">
          <Link 
            href="/api/auth/signin"
            className="px-8 py-4 rounded-xl font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-105 transition-transform"
          >
            Log In
          </Link>
          <Link 
            href="/onboarding"
            className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:scale-105 shadow-lg shadow-orange-500/25 transition-transform"
          >
            Get Started Free
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="font-bold text-lg mb-2">Social Import</h3>
            <p className="text-zinc-500 text-sm">Paste a TikTok or Reels link and we extract the recipe instantly.</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="font-bold text-lg mb-2">Smart Substitutions</h3>
            <p className="text-zinc-500 text-sm">Automatic ingredient swaps based on your allergies and diets.</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-3xl mb-4">🛒</div>
            <h3 className="font-bold text-lg mb-2">Auto Groceries</h3>
            <p className="text-zinc-500 text-sm">Your meal plan instantly converts into a grouped shopping list.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
