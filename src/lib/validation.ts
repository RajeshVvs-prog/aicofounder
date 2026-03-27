/**
 * Input validation utilities
 */

export function validateIdea(idea: string): { valid: boolean; error?: string } {
  if (!idea || typeof idea !== 'string') {
    return { valid: false, error: 'Idea is required' };
  }

  const trimmed = idea.trim();
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Idea must be at least 10 characters long' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Idea must be less than 5000 characters' };
  }

  return { valid: true };
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000);
}
