import { describe, it, expect, vi } from 'vitest';

// A mock representing the Google Generative AI SDK
const mockGenerateContent = vi.fn();

const mockAiClient = {
  models: {
    generateContent: mockGenerateContent
  }
};

describe('Google Generative AI SDK Mocking', () => {
  it('should successfully return the mocked fallback response when the API is called', async () => {
    // Arrange
    const mockResponsePayload = {
      text: JSON.stringify({
        truth_score: 95,
        verdict: "True",
        fact_check: "This is a mocked API response.",
        targeting_motive: "Mocked for testing."
      })
    };

    // Setup the mock to resolve with our payload
    mockGenerateContent.mockResolvedValueOnce(mockResponsePayload as never);

    // Act
    const prompt = "Analyze this test string.";
    const response = await mockAiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsedJson = JSON.parse(response.text);

    // Assert
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gemini-2.5-flash',
      contents: prompt
    }));
    
    expect(parsedJson.verdict).toBe("True");
    expect(parsedJson.truth_score).toBe(95);
  });

  it('should gracefully handle an API failure', async () => {
    // Arrange
    mockGenerateContent.mockRejectedValueOnce(new Error('500 Internal Server Error') as never);

    // Act & Assert
    await expect(mockAiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Test'
    })).rejects.toThrow('500 Internal Server Error');
  });
});
