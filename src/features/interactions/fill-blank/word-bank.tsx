"use client";

import { WordChip } from "./word-chip";

type Option = {
    id: string;
    word: string;
};

type Props = {
    options: Option[];

    placedWords: Record<string, Option | null>;
};

export function WordBank({
    options,
    placedWords,
}: Props) {
    const usedIds = new Set(
        Object.values(placedWords)
            .filter(Boolean)
            .map((option) => option!.id)
    );

    const availableWords = options.filter(
        (option) => !usedIds.has(option.id)
    );
    // console.log(options);
    return (
        <div
            className="
        flex
        flex-wrap
        justify-center
        gap-3
        rounded-2xl
        p-4
      "
            style={{
                background: "var(--surface-container-low)",
            }}
        >
            {availableWords.map((option) => (
                <WordChip
                    key={option.id}
                    id={option.id}
                    word={option.word}
                    variant="bank"
                />
            ))}
        </div>
    );
}