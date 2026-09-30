export const stackCategories = ["FRONTEND", "BACKEND", "AI / DATA", "INFRASTRUCTURE", "TOOLS"] as const;
export type StackCategory = (typeof stackCategories)[number];
export type StackGroup = { category: StackCategory; items: string[]; note: string | null };

/** Structural placeholders only; no claim of proficiency or technologies used. */
export const stack: StackGroup[] = stackCategories.map((category, index) => ({
  category,
  items: Array.from({ length: index === 3 ? 4 : 3 }, (_, item) =>
    `STACK_ITEM_${String(index * 4 + item + 1).padStart(2, "0")}`,
  ),
  note: null,
}));
