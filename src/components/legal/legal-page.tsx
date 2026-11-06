import type { ReactNode } from "react";
import "@/styles/marketing.css";
import { bricolage, inter } from "@/lib/marketing-fonts";
import { Header, Footer } from "@/components/landing/sections";

export type LegalSection = {
  title: string;
  content?: ReactNode;
  items?: string[];
};

type Props = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

// "Account Information: text" renders as a bold label followed by the text.
function Item({ text }: { text: string }) {
  const i = text.indexOf(":");
  if (i === -1) return <li>{text}</li>;
  return (
    <li>
      <b>{text.slice(0, i + 1)}</b>
      {text.slice(i + 1)}
    </li>
  );
}

export function LegalPage({ title, lastUpdated, intro, sections }: Props) {
  return (
    <main className={`landing ${bricolage.variable} ${inter.variable}`}>
      <Header />
      <article className="l-legal">
        <p className="l-kicker">Legal</p>
        <h1 className="l-display l-h1">{title}</h1>
        <p className="l-legal-meta">Last updated {lastUpdated}</p>
        <p className="l-lead">{intro}</p>

        <div className="l-legal-body">
          {sections.map((s) => (
            <section key={s.title} className="l-legal-sec">
              <h2 className="l-display">{s.title}</h2>
              {typeof s.content === "string" ? (
                <p>{s.content}</p>
              ) : s.content ? (
                <div>{s.content}</div>
              ) : null}
              {s.items && (
                <ul>
                  {s.items.map((t) => (
                    <Item key={t} text={t} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}