type HeroIllustrationProps = {
  category?: string;
};

function HistoryArt() {
  return (
    <>
      <circle cx="86" cy="94" r="47" fill="var(--feature-accent)" stroke="var(--feature-ink)" strokeWidth="3" style={{ mixBlendMode: "multiply" }} />
      <circle cx="154" cy="94" r="47" fill="var(--feature-contrast)" stroke="var(--feature-ink)" strokeWidth="3" style={{ mixBlendMode: "multiply" }} />
      <circle cx="120" cy="54" r="47" fill="var(--feature-ray-1)" stroke="var(--feature-ink)" strokeWidth="3" style={{ mixBlendMode: "multiply" }} />
    </>
  );
}

function ArtArt() {
  return (
    <>
      <rect x="48" y="27" width="144" height="112" rx="2" fill="var(--feature-paper)" stroke="var(--feature-ink)" strokeWidth="4" />
      <circle cx="157" cy="56" r="13" fill="var(--feature-ray-1)" stroke="var(--feature-ink)" strokeWidth="2.5" />
      <path d="m54 130 44-55 31 36 24-29 33 48Z" fill="var(--feature-ray-2)" stroke="var(--feature-ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="m76 140-15 26m104-26 15 26" stroke="var(--feature-ink)" strokeWidth="5" strokeLinecap="round" />
    </>
  );
}

function LiteratureArt() {
  return (
    <>
      <path d="M120 49c-28-19-60-17-87-7v104c27-10 59-12 87 8Z" fill="var(--feature-paper)" stroke="var(--feature-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M120 49c28-19 60-17 87-7v104c-27-10-59-12-87 8Z" fill="var(--feature-ray-1)" stroke="var(--feature-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M53 73h46m-46 20h46m-46 20h46m42-40h46m-46 20h46m-46 20h46" stroke="var(--feature-ink)" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function ScienceArt() {
  return (
    <>
      <path d="M98 27h44v52l39 70c8 15-2 25-17 25H76c-15 0-25-10-17-25l39-70Z" fill="var(--feature-paper)" stroke="var(--feature-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M69 139h102l10 18c5 9-2 17-14 17H73c-12 0-19-8-14-17Z" fill="var(--feature-accent)" stroke="var(--feature-ink)" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="105" cy="117" r="6" fill="var(--feature-ray-1)" stroke="var(--feature-ink)" strokeWidth="2" />
      <circle cx="132" cy="103" r="4" fill="var(--feature-ray-1)" stroke="var(--feature-ink)" strokeWidth="2" />
    </>
  );
}

function GeographyArt() {
  return (
    <>
      <circle cx="120" cy="99" r="64" fill="var(--feature-paper)" stroke="var(--feature-ink)" strokeWidth="4" />
      <path d="M64 99h112M120 35c-20 17-29 41-29 64s9 47 29 64m0-128c20 17 29 41 29 64s-9 47-29 64M74 65c27 11 65 11 92 0m-92 68c27-11 65-11 92 0" fill="none" stroke="var(--feature-ink)" strokeWidth="3" />
      <path d="m101 65 20 13-5 22 18 12-11 19-26-4-13-24Z" fill="var(--feature-accent)" stroke="var(--feature-ink)" strokeWidth="2.5" strokeLinejoin="round" />
    </>
  );
}

export default function HeroIllustration({ category = "" }: HeroIllustrationProps) {
  const normalizedCategory = category.trim().toLowerCase();
  const art = normalizedCategory.includes("history") ? <HistoryArt />
    : normalizedCategory.includes("art") ? <ArtArt />
      : normalizedCategory.includes("literature") || normalizedCategory.includes("book") ? <LiteratureArt />
        : normalizedCategory.includes("science") ? <ScienceArt />
          : <GeographyArt />;

  return (
    <svg viewBox="0 0 240 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {art}
      <path d="M0 177h240" stroke="var(--feature-ink)" strokeWidth="4" />
    </svg>
  );
}
