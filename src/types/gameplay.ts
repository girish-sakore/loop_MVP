export type StageType =
  | "image-select"
  | "swipe"
  | "fill-blank"
  | "reorder"
  | "drag-drop"
  | "timeline-builder";

export type StageBase = {
  id: string;
  // Map metadata
  mapTitle: string;
  mapSubtitle: string;
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
  type: "fill-blank" |"reorder" | "drag-drop";

  prompt: string;
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

export type TimelineBuilder = StageBase & TimelineBuilderStage;

export type TimelineEvent = {
  id: string;
  title: string;
  year: string;
  description: string;
  order: number;
};

export type TimelineBuilderStage = {
  type: "timeline-builder";
  events: TimelineEvent[];
};


export type Stage = ImageSelectStage | SwipeStage | FillBlankStage | TimelineBuilder;

export interface EditionNode {
  id: string;
  type: StageType; // or your existing StageType union, e.g. "image-select" | "swipe" | "fill-blank" | "timeline-builder" | "reorder"
  mapTitle: string;
  mapSubtitle: string;
  subStages: Stage[]; // Stage = your existing per-question union type
}

export type Edition = {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  nodes: EditionNode[];
  order: number;        // NEW — position on the map path
  theme: string;         // NEW — e.g. "salt-village", drives background image + node art
};
