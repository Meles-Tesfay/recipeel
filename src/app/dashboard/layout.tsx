import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-orange-500">ReciPeel</h1>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { name: "Nutrition Dashboard", href: "/dashboard" },
                        { name: "Recipe Library", href: "/dashboard/recipes" },
                        { name: "Meal Planner", href: "/dashboard/planner" },
                        { name: "Grocery List", href: "/dashboard/groceries" },
                        { name: "Safe Eats Near Me", href: "/dashboard/safe-eats" },
                    ].map((item) => (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className="block px-4 py-2 rounded-lg text-zinc-600 hover:bg-orange-50 hover:text-orange-600 dark:text-zinc-400 dark:hover:bg-orange-950/30 font-medium transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {session.user.name.charAt(0)}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{session.user.name}</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-[150px]">{session.user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
