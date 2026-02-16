export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMYR(n: number): string {
  const v = round2(n);
  return `RM ${v.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMYRNoSpace(n: number): string {
  const v = round2(n);
  // Matches the sample PDFs: "RM 4,235.00" appears as "RM 4,235.00" in some places,
  // but in the table it’s often "RM 15.00" (space). Keeping a single space is fine.
  return formatMYR(v);
}

export function sumItems(items: { quantity: number; rate: number }[]): number {
  return round2(items.reduce((acc, it) => acc + it.quantity * it.rate, 0));
}

