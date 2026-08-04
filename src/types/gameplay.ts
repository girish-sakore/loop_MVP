export type StageType =
  | "image-select"
  | "swipe"
  | "fill-blank"
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
  type: "fill-blank" | "reorder" | "drag-drop";
  prompt: string;
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
export type Stage = ImageSelectStage  | PlaceholderStage | SwipeStage;

export type Edition = {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  stages: Stage[];
  order: number;        // NEW — position on the map path
  theme: string;         // NEW — e.g. "salt-village", drives background image + node art
};
