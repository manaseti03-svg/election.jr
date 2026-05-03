import { describe, it, expect } from 'vitest';

// A mock function of what we use in our API routes to strip markdown JSON blocks
const extractStructuredJson = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const jsonCandidate = text.substring(start, end + 1);
      return JSON.parse(jsonCandidate);
    }
    throw e;
  }
};

describe('Robust JSON Extraction', () => {
  it('should extract JSON from a markdown code block', () => {
    const rawGeminiResponse = "```json\n{\"truth_score\": 90, \"verdict\": \"True\"}\n```";
    const result = extractStructuredJson(rawGeminiResponse);
    expect(result.truth_score).toBe(90);
  });

  it('should handle conversational filler around JSON', () => {
    const rawGeminiResponse = "Sure! Here is the data: {\"status\": \"ok\"}. I hope this helps!";
    const result = extractStructuredJson(rawGeminiResponse);
    expect(result.status).toBe('ok');
  });

  it('should handle raw JSON without blocks', () => {
    const rawJson = `{"status": "ok"}`;
    const result = extractStructuredJson(rawJson);
    expect(result.status).toBe('ok');
  });
});
