import type { Edition } from "@/types/gameplay";

interface EditionProgressProps {
  edition: Edition;
  completedNodes?: number;
}

export function EditionProgress({
  edition,
  completedNodes = 0,
}: EditionProgressProps) {
  const total = edition.nodes.length || 1;

  return (
    <section className="grid grid-cols-3 gap-3">
      {/* Progress card — spans 2 cols */}
      <div
        className="col-span-2 p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between gap-6"
        style={{ backgroundColor: "var(--surface-container-low)" }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="text-[18px] font-bold"
              style={{ color: "var(--on-surface)" }}
            >
              Weekly Journey
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--on-surface-variant)" }}
            >
              {total} stage{total !== 1 ? "s" : ""} to mastery
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: "var(--secondary-container)" }}
          >
            <span
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ color: "var(--on-secondary-container)" }}
            >
              {completedNodes} / {total} Stages
            </span>
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex gap-1.5 w-full h-10">
          {edition.nodes.map((stage, i) => {
            const isCompleted = i < completedNodes;
            const isCurrent = i === completedNodes;
            return (
              <div
                key={stage.id}
                className="flex-1 rounded-lg relative overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: isCompleted
                    ? "var(--secondary)"
                    : isCurrent
                    ? "var(--secondary-fixed-dim)"
                    : "var(--surface-variant)",
                  opacity: isCompleted || isCurrent ? 1 : Math.max(0.15, 1 - i * 0.07),
                }}
              >
                {isCurrent && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time card */}
      <div
        className="p-5 rounded-[1.5rem] shadow-sm flex flex-col justify-center items-center text-center gap-3"
        style={{ backgroundColor: "var(--tertiary-container)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 28, color: "var(--tertiary)" }}
          >
            schedule
          </span>
        </div>
        <div>
          <p
            className="text-[18px] font-bold leading-tight"
            style={{ color: "var(--on-tertiary-container)" }}
          >
            {edition.estimatedTime}
          </p>
          <p
            className="text-xs opacity-80"
            style={{ color: "var(--on-tertiary-container)" }}
          >
            Estimated Session
          </p>
        </div>
      </div>
    </section>
  );
}