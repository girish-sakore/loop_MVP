// TODO: decide guest play (see notes). Until then this sends people to sign-in first.
export const PLAY_HREF = "/login?next=/map";

export const HERO = {
  eyebrow: "The daily game for curious adults",
  title: "Ten minutes you'll actually remember.",
  body:
    "Loop is a daily game for curious adults. Bite-sized, and built to make you feel smarter, more curious and more playful about what you learn.",
  fine: "Free · 10–15 minutes a day · Play first, sign in later",
};

export const VIDEO = {
  src: "landing/loop-games-demo.mp4", // R2 key, uploaded to the bucket
  poster: "landing/loop-games-poster.webp",
  caption:
    "Loop turns facts into games, so you discover the answer instead of just reading it.",
};

export const GAMES_HEAD = {
  title: "Eight games. A new theme every day.",
  body: "Every theme is played through a different game, so it never feels like homework.",
};

// TODO: two games missing from the sheet (see notes)
export const GAMES: { name: string; line: string }[] = [
  { name: "Decode", line: "Drag each card to where it belongs." },
  { name: "Division Bell", line: "Is it...This or that? Make the call, one pair at a time." },
  { name: "Spot It", line: "Identify the right image from the lineup." },
  { name: "The Blank", line: "Fill in the missing word to finish the fact." },
  { name: "Border Hopp", line: "Hop country to country by the shortest route." },
  { name: "Chain of Events", line: "Put events in order, first to last." },
];

export const GAMES_NOTE =
  "We don't stick to one format. We're always trying to build the best game for each idea, so you might meet a brand-new game once a week.";

export const WHY = {
  kicker: "Why we made Loop",
  title: "Adults have crosswords and sudoku, and almost nothing else.",
  body:
    "Meanwhile, endless scrolling fills your day and leaves you with nothing. Loop trades that for ten minutes you'll actually remember.",
};

export const VALUES = [
  { title: "Is it for me?", body: "Topics that match your interests, in a tone that never feels childish or like homework.", highlight: true },
  { title: "What's in it for me?", body: "The rush of working something out yourself, and walking away knowing something new." },
  { title: "What will it cost?", body: "10–15 minutes a day. Free, at least for now." },
  { title: "Do I need an account?", body: "No. Play first. Sign in later if you like it, to keep your streak." },
];

export const PLAY_BAND = { title: "Swap one scroll for one Loop." };

export const FOOTER = {
  links: [
    { label: "Privacy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms-of-service" },
    { label: "Contact", href: "mailto:support@thelooplearn.com" }, // replace
  ],
};