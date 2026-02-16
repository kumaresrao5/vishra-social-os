// Minimal English number-to-words for totals (MYR). Covers the typical invoice range.
const ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function under100(n: number): string {
  if (n < 20) return ONES[n]!;
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o ? `${TENS[t]} ${ONES[o]}` : `${TENS[t]}`;
}

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (!h) return under100(r);
  if (!r) return `${ONES[h]} Hundred`;
  return `${ONES[h]} Hundred ${under100(r)}`;
}

export function numberToWordsTitleCase(n: number): string {
  const v = Math.floor(Math.abs(n));
  if (v === 0) return "Zero";

  const parts: string[] = [];
  const billions = Math.floor(v / 1_000_000_000);
  const millions = Math.floor((v % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((v % 1_000_000) / 1_000);
  const rest = v % 1_000;

  if (billions) parts.push(`${under1000(billions)} Billion`);
  if (millions) parts.push(`${under1000(millions)} Million`);
  if (thousands) parts.push(`${under1000(thousands)} Thousand`);
  if (rest) parts.push(`${under1000(rest)}`);

  return parts.join(" ");
}

