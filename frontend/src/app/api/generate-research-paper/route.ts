import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { hypothesis } = await request.json();

    if (!hypothesis) {
      return NextResponse.json(
        { error: 'Hypothesis is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a scientific paper writer. Generate a professional LaTeX research paper based on the following hypothesis:

Title: ${hypothesis.title}
Description: ${hypothesis.description}

Requirements:
1. The paper should be at least 3 pages long when compiled
2. Use proper LaTeX formatting and structure
3. Include the following sections:
   - Abstract
   - Introduction
   - Methods
   - Results
   - Discussion
   - References
4. Use proper mathematical notation with LaTeX math mode
5. Include relevant equations and formulas
6. Add tables and figures where appropriate
7. Use proper citations and references
8. Format the paper in a professional academic style

Important:
- Use $ for inline math and $$ for display math
- Use proper LaTeX commands and environments
- Include necessary LaTeX packages
- Format the paper in a way that can be directly compiled
- Do not include any explanatory text outside the LaTeX document
- The response should be a complete, compilable LaTeX document

Generate a complete LaTeX document that meets these requirements.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are a scientific paper writer specializing in LaTeX formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 32768,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate research paper');
    }

    const data = await response.json();
    const latexContent = data.choices[0].message.content;

    // Clean up the LaTeX content
    const cleanedLatex = latexContent
      .replace(/```latex\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return NextResponse.json({ latex: cleanedLatex });
  } catch (error) {
    console.error('Error generating research paper:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate research paper' },
      { status: 500 }
    );
  }
} 