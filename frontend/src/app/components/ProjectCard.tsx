"use client";
import Link from "next/link";

type Props = {
  id: string;
  title: string;
  gradientId: string;
  gradientColors: { from: string; to: string };
  lastOpened: string;
};

const ProjectCard = ({ id, title, gradientId, gradientColors, lastOpened }: Props) => {
  return (
    <Link href={`/projects/${id}`}>
      <div className="bg-[#e8e4e4] rounded-xl p-4 w-[180px] h-[180px] hover:scale-105 transition cursor-pointer flex flex-col justify-between">
        <h2 className="text-sm font-bold text-gray-900 self-start">{title}</h2>

        <section className="relative group flex flex-col items-center justify-center w-full h-full">
          <div className="file relative w-20 h-14 cursor-pointer origin-bottom [perspective:1500px] z-3">
            <div className="work-5 bg-blue-600 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-10 after:h-2 after:bg-blue-600 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[30px] before:w-2 before:h-2 before:bg-blue-600 before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]" />
            <div className="work-4 absolute inset-1 bg-zinc-400 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)]" />
            <div className="work-3 absolute inset-1 bg-zinc-300 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)]" />
            <div className="work-2 absolute inset-1 bg-zinc-200 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-38deg)]" />
            <div className="work-1 absolute bottom-0 bg-gradient-to-t from-blue-500 to-blue-400 w-full h-[54px] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[56px] after:h-[8px] after:bg-blue-400 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[10px] before:right-[52px] before:size-2 before:bg-blue-400 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_#3b82f6,_inset_0_-20px_40px_#1d4ed8] group-hover:[transform:rotateX(-46deg)_translateY(1px)]" />
          </div>
        </section>

        <p className="text-[10px] text-gray-500 self-start mt-1">Last Opened: {lastOpened}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;