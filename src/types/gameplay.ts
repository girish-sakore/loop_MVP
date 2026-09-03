export type StageType =
  | "image-select"
  | "swipe"
  | "fill-blank"
  | "timeline-builder"
  | "reorder"
  | "drag-drop";

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
  x: number;
  y: number;
};

export type LinkMapRelation = {
  id: string;
  label: string;
  slotIds: string[];
  x: number;
  y: number;
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
  map: {
    title: string;
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

export type Stage =
  | ImageSelectStage
  | PlaceholderStage
  | SwipeStage
  | FillBlankStage
  | TimelineBuilderStage
  | DragDropStage;

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
};
