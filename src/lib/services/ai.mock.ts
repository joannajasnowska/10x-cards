import type { GenerationFlashcardProposalDTO } from "../../types";

const MOCK_DELAY_MS = 2000;

export async function generateFlashcardProposals(
  sourceText: string,
  _model: string
): Promise<GenerationFlashcardProposalDTO[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // Return mock flashcard proposals
  return [
    {
      front: "What is the capital of France?",
      back: "Paris is the capital of France",
      source: "ai-complete",
    },
    {
      front: "What is the largest planet in our solar system?",
      back: "Jupiter is the largest planet in our solar system",
      source: "ai-complete",
    },
    {
      front: "Who wrote 'Romeo and Juliet'?",
      back: "William Shakespeare wrote 'Romeo and Juliet'",
      source: "ai-complete",
    },
  ];
}
