import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Helper function to summarize data
function summarizeData(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  // Get column names from the first row
  const columns = Object.keys(data[0]);
  
  // Calculate basic statistics for numeric columns
  const summary = columns.map(column => {
    const values = data.map(row => row[column]);
    const numericValues = values.filter(v => typeof v === 'number');
    
    if (numericValues.length > 0) {
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      return `${column}: avg=${avg.toFixed(2)}, range=[${min}, ${max}]`;
    }
    
    // For non-numeric columns, show unique value count
    const uniqueValues = new Set(values);
    return `${column}: ${uniqueValues.size} unique values`;
  });

  return summary.join('\n');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('Processing files:', files.map(f => f.name));

    // Process each file and collect any errors
    const results = await Promise.allSettled(
      files.map(async (file) => {
        try {
          console.log('Processing file:', file.name, 'Type:', file.type);
          const buffer = await file.arrayBuffer();
          const fileType = file.type;
          let data;

          if (fileType === 'application/json') {
            const text = new TextDecoder().decode(buffer);
            data = JSON.parse(text);
          } else if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
            const text = new TextDecoder().decode(buffer);
            const result = Papa.parse(text, { header: true });
            data = result.data;
          } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     fileType === 'application/vnd.ms-excel' || 
                     file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(buffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(firstSheet);
          } else {
            throw new Error(`Unsupported file type: ${fileType}`);
          }

          if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new Error('File contains no data');
          }

          // Summarize the data
          const summary = summarizeData(data);
          
          return {
            filename: file.name,
            summary: summary,
            rowCount: data.length
          };
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          throw new Error(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
    );

    // Check if any files failed to process
    const failedFiles = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failedFiles.length > 0) {
      return NextResponse.json(
        { error: 'Some files failed to process', details: failedFiles.map(f => f.reason) },
        { status: 400 }
      );
    }

    // Get the successfully parsed data
    const parsedData = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in any of the files' },
        { status: 400 }
      );
    }

    // Prepare data for Groq API with summarized data
    const prompt = `You are a research hypothesis generator analyzing data tables. Based on the following data summaries, generate 6 research hypotheses.

IMPORTANT: Your response must be a valid JSON array containing exactly 6 hypothesis objects. Each hypothesis must have exactly two fields: "title" and "description".

Example format:
[
  {
    "title": "Effect of Variable A on Outcome B",
    "description": "As Variable A increases, Outcome B will decrease due to..."
  },
  {
    "title": "Relationship between X and Y",
    "description": "There will be a positive correlation between X and Y because..."
  }
]

Data Summaries:
${parsedData.map(file => `File: ${file.filename}
Rows: ${file.rowCount}
Summary:
${file.summary}
`).join('\n')}

Instructions for analyzing the data:
1. First, identify what each table represents based on its filename and structure
2. Look for relationships between columns within each table
3. Identify potential cause-and-effect relationships
4. Consider the scale and distribution of numeric values
5. Pay attention to categorical variables and their relationships
6. Look for patterns in the data that suggest testable hypotheses

Requirements for each hypothesis:
1. Title: Must be a clear, concise statement of the relationship being tested
2. Description: Must explain the expected relationship and its theoretical basis
3. Must be specific and testable
4. Must be based on patterns in the provided data
5. Must include both independent and dependent variables
6. Must be written in clear, scientific language
7. Must reference specific columns or relationships from the data

DO NOT include any explanatory text outside the JSON array. Your response should be ONLY the JSON array.`;

    console.log('Sending request to Groq API');
    
    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a research hypothesis generator that always responds with valid JSON arrays containing hypothesis objects with title and description fields."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Failed to generate hypotheses from Groq API: ${errorData.error?.message || 'Unknown error'}`);
    }

    const groqData = await groqResponse.json();
    console.log('Received response from Groq API:', groqData);

    try {
      // Log the raw content for debugging
      console.log('Raw content from Groq:', groqData.choices[0].message.content);
      
      // Try to clean the response before parsing
      const content = groqData.choices[0].message.content.trim();
      
      // If the content starts with ```json and ends with ```, remove them
      const cleanedContent = content.replace(/^```json\n?|\n?```$/g, '');
      
      console.log('Cleaned content:', cleanedContent);
      
      const hypotheses = JSON.parse(cleanedContent);
      
      // Validate the hypotheses structure
      if (!Array.isArray(hypotheses)) {
        throw new Error('Response is not an array of hypotheses');
      }
      
      if (!hypotheses.every(h => typeof h.title === 'string' && typeof h.description === 'string')) {
        throw new Error('Invalid hypothesis format - each hypothesis must have title and description');
      }
      
      return NextResponse.json({ hypotheses });
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError);
      console.error('Failed content:', groqData.choices[0].message.content);
      throw new Error(`Failed to parse hypotheses: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process files' },
      { status: 500 }
    );
  }
} 