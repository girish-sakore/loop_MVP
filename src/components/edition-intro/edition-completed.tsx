import Link from "next/link";

interface EditionCompletedProps {
  score: number;
  completedAt: Date | null;
  totalStages: number;
  correctAnswers: number;
}

export function EditionCompleted({
  score,
  completedAt,
  totalStages,
  correctAnswers,
}: EditionCompletedProps) {
  const completedLabel = completedAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(completedAt))
    : null;

  const accuracy =
    totalStages > 0
      ? Math.round((correctAnswers / totalStages) * 100)
      : 0;

  return (
    <section className="flex flex-col items-center text-center gap-8">
      {/* Icon */}
      <div className="relative">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "var(--secondary-container)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 56,
              color: "var(--secondary)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            workspace_premium
          </span>
        </div>
        {/* Sparkle */}
        <span
          className="material-symbols-outlined absolute -top-2 -right-2"
          style={{
            fontSize: 28,
            color: "var(--secondary-fixed-dim)",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          auto_awesome
        </span>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-2">
        <span
          className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full self-center"
          style={{
            backgroundColor: "var(--secondary-container)",
            color: "var(--on-secondary-container)",
          }}
        >
          Edition Complete
        </span>
        <h2
          className="text-[28px] font-extrabold leading-tight"
          style={{ color: "var(--on-surface)" }}
        >
          You nailed it!
        </h2>
        {completedLabel && (
          <p
            className="text-sm"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Completed on {completedLabel}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div
          className="p-5 rounded-2xl flex flex-col items-center gap-1"
          style={{ backgroundColor: "var(--surface-container-low)" }}
        >
          <span
            className="text-[32px] font-extrabold leading-none"
            style={{ color: "var(--secondary)" }}
          >
            {score}
          </span>
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Score
          </span>
        </div>
        <div
          className="p-5 rounded-2xl flex flex-col items-center gap-1"
          style={{ backgroundColor: "var(--surface-container-low)" }}
        >
          <span
            className="text-[32px] font-extrabold leading-none"
            style={{ color: "var(--tertiary)" }}
          >
            {accuracy}%
          </span>
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Accuracy
          </span>
        </div>
      </div>

      {/* Next edition teaser */}
      <div
        className="w-full p-5 rounded-2xl flex items-center gap-4"
        style={{ backgroundColor: "var(--tertiary-container)" }}
      >
        <span
          className="material-symbols-outlined shrink-0"
          style={{
            fontSize: 28,
            color: "var(--tertiary)",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          calendar_month
        </span>
        <div className="text-left">
          <p
            className="text-[15px] font-bold"
            style={{ color: "var(--on-tertiary-container)" }}
          >
            Next edition coming soon
          </p>
          <p
            className="text-sm opacity-75"
            style={{ color: "var(--on-tertiary-container)" }}
          >
            New weekly content drops every Monday.
          </p>
        </div>
      </div>

      {/* Review CTA */}
      <Link
        href="/summary"
        className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
        style={{
          backgroundColor: "var(--surface-container-high)",
          color: "var(--on-surface)",
          boxShadow: "0 4px 0 0 var(--surface-variant)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          history
        </span>
        Review My Session
      </Link>
    </section>
  );
}