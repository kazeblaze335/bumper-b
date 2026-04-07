"use client";

import { useState, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { triggerPaperPushTransition } from "@/utils/animations";
import SingletonGlitch from "@/components/webgl/SingletonGlitch";

export interface Project {
  name: string;
  role: string;
  location: string;
  src: string;
  slug: string;
}

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useTransitionRouter();

  const springConfig = { stiffness: 300, damping: 25, mass: 1 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 150);
      cursorY.set(e.clientY - 150);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  const handleProjectClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    router.push(`/work/${slug}`, {
      onTransitionReady: () => triggerPaperPushTransition(),
    });
  };

  return (
    <div className="relative w-full pb-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="w-1/2">Client</div>
          <div className="w-1/4 hidden md:block">Services</div>
          <div className="w-1/4 text-right">Location</div>
        </div>

        <ul className="flex flex-col w-full">
          {projects.map((project, index) => (
            <li
              key={project.slug}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group border-b border-zinc-200 dark:border-zinc-800 relative z-10"
            >
              <a
                href={`/work/${project.slug}`}
                onClick={(e) => handleProjectClick(e, project.slug)}
                className="flex items-center py-10 md:py-16 w-full mix-blend-difference cursor-pointer"
              >
                <div className="w-1/2 overflow-hidden">
                  <h4 className="text-4xl md:text-6xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-4">
                    {project.name}
                  </h4>
                </div>

                <div className="w-1/4 hidden md:block text-zinc-500 transition-colors duration-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {project.role}
                </div>

                <div className="w-1/2 md:w-1/4 text-right text-zinc-500 transition-colors duration-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {project.location}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        className="fixed top-0 left-0 w-[300px] h-[300px] overflow-hidden pointer-events-none z-50 rounded-md bg-zinc-900"
        style={{ x: cursorX, y: cursorY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: hoveredIndex !== null ? 1 : 0,
          scale: hoveredIndex !== null ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative w-full h-full">
          {projects.map((project, index) => (
            <SingletonGlitch
              key={project.slug}
              textureUrl={project.src}
              active={hoveredIndex === index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
