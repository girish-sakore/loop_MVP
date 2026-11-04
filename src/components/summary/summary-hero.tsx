"use client";
import { typeStyle } from "@/lib/matchbox/type-style";

interface SummaryHeroProps {
  editionTitle: string;
  totalStages: number;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  category: string;
}

export function SummaryHero({ editionTitle, totalStages, score, correctAnswers, totalAnswers, category }: SummaryHeroProps) {
  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  // Optional: make the headline reflect performance instead of always "Nicely done."
  const headline =
    accuracy >= 90 ? "Outstanding!" : accuracy >= 70 ? "Nicely done." : "Good effort.";
  const subline =
    accuracy >= 90
      ? "You really know your stuff."
      : accuracy >= 70
        ? "You know your stuff."
        : "Every run makes you sharper.";

  return (
    <div className="stage">
      <section className="card" aria-label="Session result" style={typeStyle(category)}>
        <div className="top">
          <span className="chip">Completed</span>
          <p className="game">
            <span className="font-bold">{editionTitle}</span>
          </p>
          <h1 className="head">{headline}</h1>
          <p className="sub">{subline}</p>
        </div>

        <dl className="stats">
          <div>
            <dd>{score}</dd>
            <dt>score</dt>
          </div>
          <div>
            <dd>{accuracy}%</dd>
            <dt>accuracy</dt>
          </div>
          <div>
            <dd>
              {correctAnswers}/{totalStages}
            </dd>
            <dt>correct</dt>
          </div>
        </dl>

        <div className="share">
          <button
            type="button"
            className="share-btn"
            id="shareBtn"
            aria-expanded="false"
            aria-controls="shareTray"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
            </svg>
            Share your score
          </button>
          <div className="share-tray" id="shareTray" hidden>
            <a className="wa" id="shWa" target="_blank" rel="noopener" href="#">
              WhatsApp
            </a>
            <a className="xx" id="shX" target="_blank" rel="noopener" href="#">
              X
            </a>
            <button type="button" id="shCopy">
              Copy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}