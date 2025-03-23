"use client";
import { use, useState } from "react";
import Navbar from "../../components/Navbar";
import ChatPanel from "../../components/ChatPanel";
import ResearchPaperPanel from "../../components/ResearchPaperPanel";
import DocumentsPanel from "../../components/DocumentsPanel";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [view, setView] = useState<"selection" | "research" | "documents">("selection");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Reusable Navbar */}
      <Navbar />

      {/* 🔵 Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar Chat Panel */}
        <aside className="w-[300px] border-r bg-white p-4 flex flex-col">
          <ChatPanel projectId={projectId} />
        </aside>

        {/* Main Research Output */}
        <main className="flex-1 p-6 overflow-auto relative">
          {/* Toggle Tab Selector */}
          <div className="relative w-[250px] h-[36px] bg-white border-2 border-gray-800 rounded-md flex items-center shadow-md mb-6">
            {["selection", "research", "documents"].map((val, i) => {
              const isDisabled = selectedCard !== null && val === "selection";
              const label = val.charAt(0).toUpperCase() + val.slice(1);
              return (
                <label
                  key={val}
                  className={`relative w-1/3 h-full flex items-center justify-center group ${
                    isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="radio"
                    name="tab"
                    value={val}
                    checked={view === val}
                    onChange={() => !isDisabled && setView(val as typeof view)}
                    className="absolute w-full h-full opacity-0"
                    disabled={isDisabled}
                  />
                  <div
                    className={`w-full h-[28px] mx-[2px] rounded-md flex items-center justify-center transition-colors duration-200 ${
                      view === val ? "bg-gray-800 text-white" : "group-hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="relative">
            {view === "documents" ? (
              <DocumentsPanel projectId={projectId} />
            ) : (
              <ResearchPaperPanel 
                projectId={projectId} 
                view={view} 
                setView={setView}
                expandedCard={expandedCard}
                setExpandedCard={setExpandedCard}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
