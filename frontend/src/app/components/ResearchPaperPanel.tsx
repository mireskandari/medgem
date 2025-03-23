"use client";
import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { sendMessage } from "../api/chatbotService";
import type { ChatResponse } from "../api/chatbotService";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { generatePDF } from "../utils/pdfGenerator";






interface Props {
  projectId: string;
  view: "selection" | "research" | "documents";
  setView: (view: "selection" | "research" | "documents") => void;
  expandedCard: number | null;
  setExpandedCard: (id: number | null) => void;
  selectedCard: number | null;
  setSelectedCard: (id: number | null) => void;
}

interface Hypothesis {
  title: string;
  description: string;
  id?: number;
}

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start with a fast progress up to 90%
    const fastProgress = () => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    };

    // Then slow down and oscillate between 90-95%
    const slowProgress = () => {
      setProgress(prev => {
        if (prev >= 95) return 90;
        return prev + 1;
      });
    };

    // Initial fast progress
    const fastInterval = setInterval(fastProgress, 500);
    
    // Switch to slow progress after 4.5 seconds (when we reach 90%)
    setTimeout(() => {
      clearInterval(fastInterval);
      progressRef.current = setInterval(slowProgress, 1000);
    }, 4500);

    return () => {
      clearInterval(fastInterval);
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Generating research paper... {progress}%
      </div>
    </div>
  );
};

export default function ResearchPaperPanel({ 
  projectId, 
  view, 
  setView,
  expandedCard,
  setExpandedCard,
  selectedCard,
  setSelectedCard 
}: Props) {
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState<string>("");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingHypothesis, setEditingHypothesis] = useState<number | null>(null);
  const [editingPaper, setEditingPaper] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const supabase = createClientComponentClient();
  
  const [latex, setLatex] = useState(""); // State to store LaTeX input
  const [selectedHypothesis, setSelectedHypothesis] = useState<{ title: string; description: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadHypotheses = () => {
      const storedContent = localStorage.getItem('processedContent');
      if (storedContent) {
        try {
          const parsedContent = JSON.parse(storedContent);
          setHypotheses(parsedContent);
        } catch (error) {
          console.error('Error parsing stored content:', error);
        }
      }
    };

    loadHypotheses();
    window.addEventListener('hypothesesUpdated', loadHypotheses);
    return () => window.removeEventListener('hypothesesUpdated', loadHypotheses);
  }, []);

  const generateResearchPaper = async () => {
    if (!selectedHypothesis) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const prompt = `Generate a professional research paper in LaTeX format about the following hypothesis:

Title: ${selectedHypothesis.title}
Description: ${selectedHypothesis.description}

Please format the paper with the following structure:
1. Abstract
2. Introduction
3. Methodology
4. Results
5. Conclusion

Use proper LaTeX formatting with:
- \\section{} for main sections
- \\subsection{} for subsections
- \\textbf{} for emphasis
- \\textit{} for italics
- \\begin{itemize} and \\end{itemize} for bullet points
- \\begin{enumerate} and \\end{enumerate} for numbered lists
- \\begin{equation} and \\end{equation} for mathematical equations
- \\begin{figure} and \\end{figure} for figures
- \\begin{table} and \\end{table} for tables

Use professional academic language and tone throughout. Focus on analyzing the hypothesis and presenting the research findings clearly and concisely.`;

      const response = await sendMessage(session.user.id, prompt, projectId);
      setPaper(response.response);
    } catch (error) {
      console.error('Error generating research paper:', error);
      setError('Failed to generate research paper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHypothesisSelect = (hypothesis: { header: string; content: string }) => {
    setSelectedHypothesis({
      title: hypothesis.header,
      description: hypothesis.content
    });
    setView("research");
    generateResearchPaper();
  };

  const handleDownload = () => {
    if (selectedHypothesis) {
      generatePDF(paper, selectedHypothesis.title);
    }
  };

  const handleHypothesisEdit = async (hypothesisId: number, editMessage: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const selectedHypothesis = hypotheses[hypothesisId - 1];
      const message = `Please edit the following hypothesis:
Title: ${selectedHypothesis.title}
Description: ${selectedHypothesis.description}

Edit request: ${editMessage}`;

      const chatResponse: ChatResponse = await sendMessage(
        session.user.id,
        message,
        projectId
      );

      // Parse the response to get the edited hypothesis
      const responseText = chatResponse.response;
      const sections = responseText.split(/(?=#|##|###)/);
      
      // Find the edited hypothesis section
      const editedSection = sections.find(section => 
        section.toLowerCase().includes('edited hypothesis') || 
        section.toLowerCase().includes('updated hypothesis')
      );

      if (editedSection) {
        const lines = editedSection.trim().split('\n');
        const header = lines[0].replace(/^#+\s*/, '').trim();
        const content = lines.slice(1).join('\n').trim();

        // Update the hypothesis in state
        setHypotheses(current => 
          current.map((hyp, index) => 
            index === hypothesisId - 1 
              ? { ...hyp, title: header, description: content }
              : hyp
          )
        );

        // Update localStorage
        const storedContent = localStorage.getItem('processedContent');
        if (storedContent) {
          const parsedContent = JSON.parse(storedContent);
          parsedContent[hypothesisId - 1] = { header, content };
          localStorage.setItem('processedContent', JSON.stringify(parsedContent));
        }
      }

      setEditingHypothesis(null);
      setEditMessage("");
    } catch (error) {
      console.error('Error editing hypothesis:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit hypothesis');
    }
  };

  const handlePaperEdit = async (editMessage: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const selectedHypothesis = hypotheses[selectedCard! - 1];
      const message = `Please edit the following research paper based on this hypothesis:
Title: ${selectedHypothesis.title}
Description: ${selectedHypothesis.description}

Current paper content:
${paper}

Edit request: ${editMessage}`;

      const chatResponse: ChatResponse = await sendMessage(
        session.user.id,
        message,
        projectId
      );

      setPaper(chatResponse.response);
      setEditingPaper(false);
      setEditMessage("");
    } catch (error) {
      console.error('Error editing paper:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit paper');
    }
  };

  const renderContent = () => {
    if (view === "research") {
      if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="w-full max-w-md">
              <ProgressBar />
            </div>
            <div className="text-gray-600 text-sm">
              This may take a few minutes. Please don't close the window.
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        );
      }

      if (selectedCard !== null) {
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {paper}
                </div>
              </div>
              {!editingPaper ? (
                <button
                  onClick={() => setEditingPaper(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit Paper
                </button>
              ) : (
                <div className="mt-4 space-y-4">
                  <textarea
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="Describe how you want to edit the paper..."
                    className="w-full p-2 border rounded"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePaperEdit(editMessage)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingPaper(false);
                        setEditMessage("");
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LaTeX preview section */}
            <MathJaxContext>
              <div className="p-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-center mb-4">Research Paper Preview</h2>
                  <div className="text-sm text-gray-600 text-center mb-6">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="prose max-w-none">
                    <MathJax>{paper}</MathJax>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <button
                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      onClick={handleDownload}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </MathJaxContext>
          </div>
        );
      }

      return (
        <p className="text-gray-500 italic">Please select a hypothesis from the Selections tab first.</p>
      );
    }

    if (view === "selection") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {hypotheses.map((hypothesis, index) => {
            const cardId = index + 1;
            const isExpanded = expandedCard === cardId;
            const isSelected = selectedCard === cardId;
            const isEditing = editingHypothesis === cardId;
            
            return (
              <div
                key={cardId}
                onClick={() => !isEditing && setSelectedCard(cardId)}
                className={`relative border transition-all duration-700 ease-in-out cursor-pointer
                  ${isExpanded ? "col-span-3 min-w-full min-h-[300px]" : "min-w-0 min-h-[160px]"}
                  ${isSelected 
                    ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300 shadow-lg scale-[1.02]" 
                    : "bg-white border-gray-300 hover:scale-[1.03] hover:shadow-md"}
                  p-4 rounded-lg shadow-md`}                
              >
                <div className="text-xl font-bold text-gray-800 mb-1">#{cardId}</div>
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      placeholder="Describe how you want to edit this hypothesis..."
                      className="w-full p-2 border rounded"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHypothesisEdit(cardId, editMessage);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHypothesis(null);
                          setEditMessage("");
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hypothesis.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{hypothesis.description}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingHypothesis(cardId);
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(isExpanded ? null : cardId);
                  }}
                  className="absolute bottom-2 right-2"
                >
                  <svg
                    viewBox="0 0 448 512"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-600 transition-transform duration-300 ease-in-out"
                  >
                    <path
                      d={
                        isExpanded
                          ? "M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"
                          : "M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
                      }
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    if (view === "documents") {
      return (
        <div className="text-gray-800 text-sm flex flex-col items-center gap-4">
          <p>View or manage uploaded documents here.</p>
        </div>
      );
    }
  };

  return (
    <div className="relative">
      {renderContent()}

      {/* Toggle view button */}
      {view !== "documents" && (
        <button
          onClick={() => setView(view === "selection" ? "research" : "documents")}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-black text-white shadow-lg transition duration-300 transform hover:scale-110 hover:bg-gray-900 flex items-center justify-center"
          aria-label="Toggle View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}