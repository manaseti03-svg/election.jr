import { describe, it, expect } from 'vitest';
import { ai } from '../src/lib/gemini';

describe('Election.jr AI Initialization', () => {
  it('should have Gemini AI instance defined', () => {
    expect(ai).toBeDefined();
    expect(ai.models.generateContent).toBeDefined();
  });
});
