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
  const hypothesisRegex = /```markdown\n### Hypothesis: ([^\n]+)\n\n([\s\S]*?)```/g;
  
  const hypotheses: Hypothesis[] = [];
  let cleanedResponse = response;
  let match;

  // Extract all hypotheses
  while ((match = hypothesisRegex.exec(response)) !== null) {
    const title = match[1].trim();
    const description = match[2].trim();
    
    hypotheses.push({
      title,
      description
    });
  }

  // Remove the hypothesis blocks from the response
  cleanedResponse = response.replace(hypothesisRegex, '').trim();

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