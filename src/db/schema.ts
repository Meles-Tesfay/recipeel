import { pgTable, text, timestamp, boolean, uuid, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Better Auth Tables
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	expiresAt: timestamp("expiresAt"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

// App Tables
export const preferences = pgTable("preferences", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id).unique(),
    dietary: json("dietary").default([]), // array of strings e.g. ["Vegan", "Gluten-Free"]
    allergies: json("allergies").default([]),
    fitnessGoals: text("fitnessGoals"),
    budget: text("budget"),
    dailyCalories: integer("dailyCalories"),
    dailyProtein: integer("dailyProtein"),
    dailyCarbs: integer("dailyCarbs"),
    dailyFat: integer("dailyFat"),
    cookingPrefs: json("cookingPrefs").default([]),
    cuisinePrefs: json("cuisinePrefs").default([]),
    skillLevel: text("skillLevel"),
});

export const recipes = pgTable("recipes", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id),
    title: text("title").notNull(),
    originalUrl: text("originalUrl"),
    cookTime: integer("cookTime"),
    instructions: text("instructions"), // Could be JSON array of strings
    calories: integer("calories"),
    protein: integer("protein"),
    carbs: integer("carbs"),
    fat: integer("fat"),
    isFavorite: boolean("isFavorite").default(false),
    tags: json("tags").default([]),
    notes: text("notes"),
    folder: text("folder"),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const ingredients = pgTable("ingredients", {
    id: uuid("id").primaryKey().defaultRandom(),
    recipeId: uuid("recipeId").notNull().references(() => recipes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: integer("amount"),
    unit: text("unit"),
    originalName: text("originalName"),
    substitutedWith: text("substitutedWith"), // Name of substitution ingredient
    isSubstituted: boolean("isSubstituted").default(false),
    substituteFor: text("substituteFor"), // Name of the original ingredient this replaces
});

export const mealPlans = pgTable("meal_plans", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id),
    date: timestamp("date").notNull(),
    mealType: text("mealType").notNull(), // Breakfast, Lunch, Dinner, Snack
    recipeId: uuid("recipeId").notNull().references(() => recipes.id),
});

export const groceryLists = pgTable("grocery_lists", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    createdAt: timestamp("createdAt").defaultNow(),
});

export const groceryItems = pgTable("grocery_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("listId").notNull().references(() => groceryLists.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amount: integer("amount"),
    unit: text("unit"),
    aisle: text("aisle"),
    isChecked: boolean("isChecked").default(false),
});

export const recipesRelations = relations(recipes, ({ many }) => ({
    ingredients: many(ingredients),
    mealPlans: many(mealPlans),
}));

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
    recipe: one(recipes, {
        fields: [ingredients.recipeId],
        references: [recipes.id],
    }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
    recipe: one(recipes, {
        fields: [mealPlans.recipeId],
        references: [recipes.id],
    }),
}));

export const groceryListsRelations = relations(groceryLists, ({ many }) => ({
    items: many(groceryItems),
}));

export const groceryItemsRelations = relations(groceryItems, ({ one }) => ({
    list: one(groceryLists, {
        fields: [groceryItems.listId],
        references: [groceryLists.id],
    }),
}));
