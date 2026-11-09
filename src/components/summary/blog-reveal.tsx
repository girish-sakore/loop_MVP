import type { CSSProperties } from "react";

type Question = {
  q: string;
  ans: string;
  why: string;
  correct: boolean;
  sources: { label: string; href: string }[];
};

const QUESTIONS: Question[] = [
  {
    q: "When did humans first land on the Moon?",
    ans: "1969: Apollo 11",
    why: "The lunar module Eagle touched down in the Sea of Tranquility on 20 July 1969. Neil Armstrong stepped out first, followed by Buzz Aldrin, while Michael Collins stayed in orbit.",
    correct: true,
    sources: [{ label: "NASA, Apollo 11", href: "https://www.nasa.gov/mission/apollo-11/" }],
  },
  {
    q: "When was the World Wide Web first proposed?",
    ans: "1989: Tim Berners-Lee at CERN",
    why: "He wrote a proposal for a linked information system in March 1989 to help CERN’s scientists share documents. The first website went live in 1991.",
    correct: true,
    sources: [{ label: "CERN, The birth of the Web", href: "https://home.cern/science/computing/birth-web" }],
  },
  {
    q: "When did the Berlin Wall fall?",
    ans: "9 November 1989",
    why: "East Germany announced that its border crossings would open, and crowds streamed through that night. It fell the same year the Web was proposed, which is why the two sit so close on the timeline.",
    correct: false,
    sources: [
      { label: "Britannica, Berlin Wall", href: "https://www.britannica.com/topic/Berlin-Wall" },
      { label: "History.com", href: "https://www.history.com/topics/cold-war/berlin-wall" },
    ],
  },
];

const tagStyle = (correct: boolean) =>
  ({
    "--c": correct ? "var(--t3)" : "var(--red)",
    "--cf": correct ? "var(--tf3)" : "var(--on-red)",
  }) as CSSProperties;

export function BlogReveal() {
  return (
    <section className="blog" aria-label="Behind today’s box">
      <div className="sheet">
        <span className="handle" aria-hidden="true" />
        <h2>Behind today’s box</h2>
        <p>The story behind each answer, with sources if you want to read more.</p>

        <ul className="list">
          {QUESTIONS.map((item) => (
            <li key={item.q}>
              <article className="post">
                <span className="tag" style={tagStyle(item.correct)}>
                  {item.correct ? "You got it" : "Missed"}
                </span>
                <p className="q">{item.q}</p>
                <h3 className="ans">{item.ans}</h3>
                <p className="why">{item.why}</p>
                <ul className="src" aria-label="Sources">
                  {item.sources.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>

        <button type="button" className="more">
          Show all 11 questions
        </button>
      </div>
    </section>
  );
}