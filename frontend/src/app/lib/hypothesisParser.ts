interface Hypothesis {
  title: string;
  description: string;
}

/**
 * Extracts hypotheses from a chat response and returns both the hypotheses and the cleaned response
 * @param response The chat response containing markdown-formatted hypotheses
 * @returns An object containing the extracted hypotheses and the cleaned response
 */
export function parseHypotheses(response: string): { hypotheses: Hypothesis[], cleanedResponse: string } {
  // Regular expression to match markdown code blocks containing hypotheses
  // This regex looks for the exact pattern we specified in the system prompt
  const hypothesisRegex = /<<<\r?\n\s*### Hypothesis:\s*([^\r\n]+)\s*\r?\n\r?\n([\s\S]*?)\s*>>>/g;
  
  const hypotheses: Hypothesis[] = [];
  let cleanedResponse = response;
  let match;
  let hypothesisCount = 0;

  // Extract all hypotheses
  while ((match = hypothesisRegex.exec(response)) !== null) {
    const title = match[1].trim();
    const description = match[2].trim();
    
    // Only add if we have both title and description
    if (title && description) {
      hypotheses.push({
        title,
        description
      });
      hypothesisCount++;
    }
  }

  // Remove the hypothesis blocks from the response
  cleanedResponse = response.replace(hypothesisRegex, '').trim();

  // Log the number of hypotheses found for debugging
  console.log(`Found ${hypothesisCount} hypotheses in the response`);

  return { hypotheses, cleanedResponse };
}

/**
 * Formats a hypothesis into a markdown string
 * @param hypothesis The hypothesis to format
 * @returns A markdown-formatted string representing the hypothesis
 */
export function formatHypothesis(hypothesis: Hypothesis): string {
  return `### Hypothesis: ${hypothesis.title}\n\n${hypothesis.description}`;
}

/**
 * Validates if a string contains properly formatted hypotheses
 * @param text The text to validate
 * @returns true if the text contains properly formatted hypotheses
 */
export function hasValidHypotheses(text: string): boolean {
  const hypothesisRegex = /<<<\r?\n\s*### Hypothesis:\s*([^\r\n]+)\s*\r?\n\r?\n([\s\S]*?)\s*>>>/g;
  let match;
  let count = 0;

  while ((match = hypothesisRegex.exec(text)) !== null) {
    if (match[1]?.trim() && match[2]?.trim()) {
      count++;
    }
  }

  return count > 0;
} 