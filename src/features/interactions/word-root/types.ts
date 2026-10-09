export interface WordRootClue {
  id: string;
  x: number;
  y: number;
  number: number;
  title: string;
  text: string;
  answer: string;
}

export interface WordRootRoot {
  word: string;
  x: number;
  y: number;
}

export interface WordRootPuzzle {
  cols: number;
  rows: number;
  root: WordRootRoot;
  clues: WordRootClue[];
}
