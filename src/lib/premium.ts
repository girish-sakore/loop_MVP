export function hasPremium(u: { isPremium?: boolean | null; subscriptionEnd?: Date | string | null }) {
  if (!u.isPremium) return false;
  return !u.subscriptionEnd || new Date(u.subscriptionEnd) > new Date();
}