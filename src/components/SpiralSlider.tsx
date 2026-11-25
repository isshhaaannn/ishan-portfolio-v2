"use client";

import { HelixCanvas, Project } from "./3d/HelixCanvas";
import { useUIStore } from "@/store/useUIStore";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectModal } from "./ProjectModal";
import { InspectView } from "./InspectView";

interface SpiralSliderProps {
  projects: Project[];
}

export function SpiralSlider({ projects }: SpiralSliderProps) {
  const { activeProjectId, setInspect } = useUIStore();

  const selectedProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-0"
    >
      {/* A tile click lifts the project into the flat inspect view first. */}
      <HelixCanvas projects={projects} onSelect={setInspect} />

      <InspectView projects={projects} />

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            key="modal"
            project={selectedProject}
            allProjects={projects}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
