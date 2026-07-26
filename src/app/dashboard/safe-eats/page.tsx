import { db } from "@/db";
import { preferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import SafeEatsClient from "./SafeEatsClient";

export default async function SafeEatsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    
    const userPrefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, session!.user.id)
    });

    const dietary = (userPrefs?.dietary as string[] | null) ?? [];
    const allergies = (userPrefs?.allergies as string[] | null) ?? [];

    const activeFilters = [...dietary, ...allergies];

    return <SafeEatsClient activeFilters={activeFilters} />;
}
