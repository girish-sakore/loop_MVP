import Link from "next/link";
import type { ReactNode } from "react";

type LegalSection = {
  title: string;
  content?: ReactNode;
  items?: string[];
};

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="bg-[#fffdf7] px-6 py-16 text-[#0b0b0f] md:px-8 md:py-24">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-12 inline-flex text-sm font-extrabold uppercase tracking-widest text-[#3a6757] hover:underline"
        >
          Back to Loop
        </Link>

        <header className="mb-12 border-b-[3px] border-[#0b0b0f] pb-8">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-widest text-[#3a6757]">
            The LOOP
          </p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">
            {title}
          </h1>
          <p className="mt-5 text-sm font-bold text-[#343238]">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <p className="mb-12 text-lg leading-8 text-[#343238]">{intro}</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-2xl font-extrabold tracking-tight md:text-3xl">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-base leading-8 text-[#343238]">
                  {section.content}
                </p>
              )}
              {section.items && (
                <ul className="list-disc space-y-3 pl-6 text-base leading-8 text-[#343238]">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
