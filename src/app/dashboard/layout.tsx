import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", emoji: "📊" },
  { name: "Import Recipe", href: "/dashboard/recipes", emoji: "📱" },
  { name: "Meal Planner", href: "/dashboard/planner", emoji: "📅" },
  { name: "Grocery List", href: "/dashboard/groceries", emoji: "🛒" },
  { name: "Safe Eats Near Me", href: "/dashboard/safe-eats", emoji: "📍" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const initials = session.user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>

      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand-green)" }}>
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--foreground)" }}>ReciPeel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-50"
              style={{ color: "var(--muted)" }}>
              <span className="text-base">{item.emoji}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: "var(--brand-green)" }}>
              {initials}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
                {session.user.name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                {session.user.email}
              </p>
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
