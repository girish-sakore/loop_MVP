export type StageType =
  | "image-select"
  | "swipe"
  | "fill-blank"
  | "fill-blank-text"
  | "timeline-builder"
  | "reorder"
  | "four-way-swipe"
  | "drag-drop"
  | "clue-connect"
  | "color-match"
  | "border-hop"
  | "word-root";

export type StageBase = {
  id: string;
  // Map metadata
  mapTitle: string;
  mapSubtitle: string;
  type: StageType;
  question: string;
  attemptsAllowed: number;
  points: number;
};

export type ImageSelectStage = StageBase & {
  type: "image-select";
  options: Array<{
    id: string;
    label: string;
    image: string;
    isCorrect: boolean;
    feedback: string;
  }>;
};

export type PlaceholderStage = StageBase & {
  type: "reorder";

  prompt: string;
  items?: Array<{
    id: string;
    label: string;
    order: number;
  }>;
};

export type LinkMapCard = {
  id: string;
  title: string;
  image?: string;
  color?: string;
};

export type LinkMapSlot = {
  id: string;
  label: string;
  answerCardId: string;
  x?: number;
  y?: number;
  anchor?: string;
};

export type LinkMapRelation = {
  id: string;
  label: string;
  slotIds: string[];
  x?: number;
  y?: number;
  anchor?: string;
  color?: string;
};

export type LinkMapPath = {
  id: string;
  points: Array<{
    x: number;
    y: number;
  }>;
};

export type DragDropStage = StageBase & {
  type: "drag-drop";

  prompt: string;
  introLabel?: string;
  hintsAllowed?: number;
  map: {
    title: string;
    pattern?: string;
    pathStyle?: "orthogonal" | "direct" | "curved";
    cardSize?: { width: number; height: number };
    bubbleSize?: number;
    slots: LinkMapSlot[];
    relations: LinkMapRelation[];
    paths?: LinkMapPath[];
  };
  cards: LinkMapCard[];
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type ClueConnectClue = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type ClueConnectSlot = {
  x: number;
  y: number;
};

export type ClueConnectCase = {
  id: string;
  category: string;
  answer: string;
  icon?: string;
  fact: string;
  clueSlots: ClueConnectSlot[];
  clues: ClueConnectClue[];
};

export type ClueConnectStage = StageBase & {
  type: "clue-connect";
  prompt: string;
  introLabel?: string;
  maxMistakes?: number;
  cases: ClueConnectCase[];
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type ColorMatchClue = {
  id: string;
  hex: string;
  clue1: string;
  hint: string;
  name: string;
};

export type ColorMatchStage = StageBase & {
  type: "color-match";
  prompt: string;
  introLabel?: string;
  eyebrow?: string;
  title?: string;
  clues: ColorMatchClue[];
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type FillBlankStage = StageBase & {
  type: "fill-blank";

  prompt: string; // Supports {{b1}} placeholders

  blanks: Array<{
    id: string;
    answer: string;
  }>;

  options: Array<{
    id: string;
    word: string;
  }>;
};
export type FillBlankTextStage = StageBase & {
  type: "fill-blank-text";
  prompt: string; // Supports {{b1}} placeholders
  introLabel?: string;
  hintsAllowed?: number;
  blanks: Array<{
    id: string;
    answer: string;
    hint?: string; // optional small-text hint shown in the popup
  }>;
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type SwipeStage = StageBase & {
  type: "swipe";

  statement: string;

  card: {
    title: string;
    subtitle?: string;
    image?: string;
  };

  left: {
    label: string;
    icon?: string;
  };

  right: {
    label: string;
    icon?: string;
  };

  correctDirection: "left" | "right";

  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type WordRootStage = StageBase & {
  type: "word-root";
  puzzle?: WordRootPuzzle;
};

export type WordRootPuzzle = {
  cols: number;
  rows: number;
  root: { word: string; x: number; y: number };
  clues: Array<{
    id: string;
    x: number;
    y: number;
    number: number;
    title: string;
    text: string;
    answer: string;
  }>;
};

export type FourWaySwipeDirection = "up" | "down" | "left" | "right";

export type FourWaySwipeStage = StageBase & {
  type: "four-way-swipe";
  category?: string;
  prompt?: string;
  answers: Record<FourWaySwipeDirection, {
    label: string;
    icon?: string;
  }>;
  correctDirection: FourWaySwipeDirection;
  feedback: {
    correct: string;
    incorrect: string;
  };
};
export type TimelineEvent = {
  id: string;
  title: string;
  year: string;
  description: string;
  order: number;
  image?: string;
};

export type TimelineBuilderStage = StageBase & {
  type: "timeline-builder";
  estimatedTime?: string;
  instructions: string;
  events: TimelineEvent[];
};

export type BorderHopStage = StageBase & {
  type: "border-hop";
  startCountry: string;
  targetCountry: string;
  prompt?: string;
  introLabel?: string;
  maxGuesses?: number;
  hintsAllowed?: number;
  feedback?: { correct: string; incorrect: string };
};



export type Stage =
  | BorderHopStage
  | ImageSelectStage
  | PlaceholderStage
  | SwipeStage
  | FourWaySwipeStage
  | FillBlankStage
  | FillBlankTextStage
  | TimelineBuilderStage
  | DragDropStage
  | ClueConnectStage
  | ColorMatchStage
  | WordRootStage

export interface EditionNode {
  id: string;
  type: string; // or your existing StageType union, e.g. "image-select" | "swipe" | "fill-blank" | "timeline-builder" | "reorder"
  mapTitle: string;
  mapSubtitle: string;
  subStages: Stage[]; // Stage = your existing per-question union type — unchanged
}

export type Edition = {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  nodes: EditionNode[];
  order: number;        // NEW — position on the map path
  theme: string;         // NEW — e.g. "salt-village", drives background image + node art
  category?: string;
  publishedAt?: string;
  weekLabel?: string;
  author?: string;
  coverImage?: string;
};
