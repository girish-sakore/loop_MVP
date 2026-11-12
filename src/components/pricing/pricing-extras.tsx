import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/contact";

export function PricingExtras() {
  return (
    <>
      <section className="p-block" aria-labelledby="afford">
        <h2 id="afford" className="l-display">Can&apos;t afford it?</h2>
        <p>
          Loop should be for every curious adult, students included. If the
          price is a stretch, write to us and we&apos;ll try to work something
          out.
        </p>
        <a
          className="l-btn"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Loop Premium: price help")}`}
        >
          Email us
        </a>
      </section>

      <section className="p-block" aria-labelledby="brand">
        <h2 id="brand" className="l-display">Feature your brand</h2>
        <p>
          Have a product or company that fits a curious crowd? Let&apos;s build
          something playful around it.
        </p>
        <a
          className="l-btn"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Feature enquiry")}`}
        >
          Get in touch
        </a>
      </section>

      <section className="p-block p-faq" aria-labelledby="faq">
        <h2 id="faq" className="l-display">Questions</h2>
        <details>
          <summary>Can I cancel anytime?</summary>
          <p>
            Yes. Email support and your plan won&apos;t renew. You keep Premium
            until the period you&apos;ve paid for ends.
          </p>
        </details>
        <details>
          <summary>What happens to my progress if I stop paying?</summary>
          <p>
            Your progress stays saved. Premium games and past editions lock
            again until you resubscribe.
          </p>
        </details>
        <details>
          <summary>Is Loop really free?</summary>
          <p>
            Yes. Loop has free games every day, and you can start without
            signing up. Premium adds every game and the full archive.
          </p>
        </details>
      </section>
    </>
  );
}

export function SignInToSubscribe() {
  return (
    <section className="p-block" aria-labelledby="signin">
      <h2 id="signin" className="l-display">Sign in to go Premium</h2>
      <p>
        Play as much as you like first. Sign in with your email to subscribe,
        so Premium stays on your account.
      </p>
      <Link className="l-btn l-btn--primary" href="/login?next=/pricing">
        Sign in
      </Link>
    </section>
  );
}