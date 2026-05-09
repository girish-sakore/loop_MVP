"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { ChoiceCard } from "@/components/ui/choice-card";
import { GameplayCard } from "@/components/ui/gameplay-card";
import type { ImageSelectStage } from "@/types/gameplay";

type ImageSelectInteractionProps = {
  stage: ImageSelectStage;
  onAnswer: (payload: { correct: boolean; feedback: string }) => void;
  disabled?: boolean;
};

export function ImageSelectInteraction({
  stage,
  onAnswer,
  disabled,
}: ImageSelectInteractionProps) {
  return (
    <GameplayCard>
      <p className="mb-4 text-lg font-semibold text-foreground">{stage.question}</p>
      <div className="space-y-3">
        {stage.options.map((option) => (
          <motion.div key={option.id} whileTap={{ scale: 0.98 }}>
            <ChoiceCard
              disabled={disabled}
              onClick={() =>
                onAnswer({
                  correct: option.isCorrect,
                  feedback: option.feedback,
                })
              }
            >
              <div className="flex items-center gap-3">
                <Image
                  src={option.image}
                  alt={option.label}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <p className="text-sm font-medium text-foreground">{option.label}</p>
              </div>
            </ChoiceCard>
          </motion.div>
        ))}
      </div>
    </GameplayCard>
  );
}
