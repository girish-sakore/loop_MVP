const FREE = [
  "Get started with a simple sign-up",
  "Access a new free edition every day",
  "Keep track of your daily progress",
];

const PREMIUM = [
  "Unlock the complete archive of past editions",
  "Personalize your experience with exclusive themes",
  "Share your thoughts and feedback",
  "Help support what we do",
];

export function PricingBenefits() {
  return (
    <section className="p-compare" aria-label="Free and Premium compared">
      <article className="p-card">
        <h2 className="l-display">Free</h2>
        <ul>
          {FREE.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </article>
      <article className="p-card p-card--hl">
        <h2 className="l-display">Premium</h2>
        <ul>
          {PREMIUM.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}