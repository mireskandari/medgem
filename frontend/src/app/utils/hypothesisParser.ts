interface Hypothesis {
  title: string;
  description: string;
}

export function parseHypotheses(text: string): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];
  const hypothesisBlocks = text.match(/~~~Hypothesis:[\s\S]*?~~~/g) || [];

  hypothesisBlocks.forEach((block) => {
    try {
      // Remove the markdown code block markers
      const cleanBlock = block.replace(/^~~~Hypothesis:\s*/, '').replace(/~~~$/, '').trim();
      
      // Split into lines and process
      const lines = cleanBlock.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 4) {
        console.warn('Invalid hypothesis block: missing required sections', block);
        return;
      }

      // Extract title and content
      const title = lines[0];
      const content = lines.slice(1).join('\n');

      // Validate content structure
      const requiredSections = [
        'Core idea/prediction',
        'Supporting evidence/reasoning',
        'Analytical methods for testing',
        'Expected outcomes and implications'
      ];

      const hasAllSections = requiredSections.every(section => 
        content.toLowerCase().includes(section.toLowerCase())
      );

      if (!hasAllSections) {
        console.warn('Invalid hypothesis block: missing required sections', block);
        return;
      }

      // Format the description with proper sections
      const formattedContent = content
        .split('\n')
        .map(line => {
          // Remove bullet points and clean up
          const cleanLine = line.replace(/^-\s*/, '').trim();
          // Add proper spacing between sections
          if (requiredSections.some(section => 
            cleanLine.toLowerCase().includes(section.toLowerCase())
          )) {
            return `\n${cleanLine}\n`;
          }
          return cleanLine;
        })
        .join('\n')
        .trim();

      hypotheses.push({
        title,
        description: formattedContent
      });
    } catch (error) {
      console.error('Error parsing hypothesis block:', error);
    }
  });

  return hypotheses;
}

export function hasValidHypotheses(hypotheses: Hypothesis[]): boolean {
  if (!hypotheses || hypotheses.length === 0) return false;
  
  return hypotheses.every(hypothesis => {
    // Check if title exists and is not empty
    if (!hypothesis.title || hypothesis.title.trim() === '') return false;
    
    // Check if description exists and contains required sections
    if (!hypothesis.description || hypothesis.description.trim() === '') return false;
    
    const requiredSections = [
      'Core idea/prediction',
      'Supporting evidence/reasoning',
      'Analytical methods for testing',
      'Expected outcomes and implications'
    ];
    
    return requiredSections.every(section => 
      hypothesis.description.toLowerCase().includes(section.toLowerCase())
    );
  });
}

export function formatHypothesisForDisplay(hypothesis: Hypothesis): string {
  const sections = [
    'Core idea/prediction',
    'Supporting evidence/reasoning',
    'Analytical methods for testing',
    'Expected outcomes and implications'
  ];

  let formattedText = `# ${hypothesis.title}\n\n`;

  sections.forEach(section => {
    const sectionContent = hypothesis.description
      .split('\n')
      .filter(line => line.toLowerCase().includes(section.toLowerCase()))
      .join('\n')
      .replace(new RegExp(section, 'i'), '')
      .trim();

    if (sectionContent) {
      formattedText += `## ${section}\n${sectionContent}\n\n`;
    }
  });

  return formattedText;
} 