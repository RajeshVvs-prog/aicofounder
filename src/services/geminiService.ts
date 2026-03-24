import { EvaluationResult } from "../types";

export async function validateStartupIdea(idea: string): Promise<EvaluationResult> {
  const res = await fetch("/api/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idea }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  return res.json();
}