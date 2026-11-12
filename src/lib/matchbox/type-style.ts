export const topicColour: Record<string, number> = { History: 0, Art: 1, Literature: 4, Science: 6 };

// Stable fallback: the same category always gets the same slot,
// regardless of data order.
const hashSlot = (s: string) =>
  [...s].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 0) % 11;

export const typeStyle = (category: string) => {
  const i = topicColour[category] ?? hashSlot(category);
  return { ["--c" as string]: `var(--mb-t${i})`, ["--f" as string]: `var(--mb-tf${i})` };
};