"use client";

import Navbar from "./components/Navbar";
import NewProjectButton from "./components/NewProjectButton";
import ProjectCard from "./components/ProjectCard";
import { v4 as uuidv4 } from "uuid";
import Threads from './components/Threads';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Threads
    color={[177, 249, 252]}

    amplitude={4}
    distance={0}
    enableMouseInteraction={false}
  />
</div>
const gradients = [
  { id: "gradient1", from: "#a855f7", to: "#ec4899" },
  { id: "gradient2", from: "#4ade80", to: "#d1d5db" },
  { id: "gradient3", from: "#60a5fa", to: "#8b5cf6" },
  { id: "gradient4", from: "#f472b6", to: "#c084fc" },
];

const projectData = [
  { title: "Cancer and Smoking" },
  { title: "Mental Health Survey" },
  { title: "Diabetes Research" },
  { title: "Obesity Tracker" },
  { title: "Lung Capacity Study" },
];

function getRandomDate() {
  const date = new Date(Date.now() - Math.random() * 10000000000);
  return date.toLocaleDateString();
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-8 py-6">
      <Navbar />

      <div className="flex items-center justify-between mt-6 mb-4">
        <h2 className="text-xl font-bold text-gray-900"></h2>
        <div className="text-sm text-gray-700 flex items-center gap-2">
        </div>
      </div>

      <div className="grid gap-6 justify-items-center grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <NewProjectButton />
        {projectData.map((project, idx) => {
          const gradient = gradients[idx % gradients.length];
          return (
            <ProjectCard
              key={idx}
              id={uuidv4()}
              title={project.title}
              gradientId={gradient.id}
              gradientColors={{ from: gradient.from, to: gradient.to }}
              lastOpened={getRandomDate()}
            />
            
          );
        })}
      </div>
    </main>
  );
}
