export type HintDef = { id: string; text: string };

export type HintGroup = {
  key: string;
  allowed: number;
  hints: HintDef[];
  anonymous: boolean;
};

export type HintPlan = { groups: Record<string, HintGroup>; cap: number };

export type GroupApi = {
  exists: boolean;
  anonymous: boolean;
  list: HintDef[];
  revealed: HintDef[];
  next?: HintDef;
  usedCount: number;
  remaining: number;
  canReveal: boolean;
  reveal: (hintId?: string) => boolean;
};

export type StageHints = { group: (key: string) => GroupApi; total: { remaining: number } };
