"use client";

import { useMemo } from "react";
import { useUIStore } from "@/store/useUIStore";
import { Spiral3DSlider, Spiral3DSlide } from "@/components/ui/spiral-3d-slider";

export type Project = {
  id: string;
  website_project_name: string;
  category_display: string;
  asset_locations: string[];
  /** Who the work was made for (see src/lib/curation.ts). */
  buyer?: string;
  /** Present on featured case studies (see src/lib/featured.ts). */
  case?: { brief: string; thinking: string; idea: string; result: string };
  content_narrative?: string;
};

const isVideo = (s: string) => /\.(mp4|webm|mov)$/i.test(s);

export function HelixCanvas({ projects, onSelect }: { projects: Project[], onSelect: (id: string) => void }) {
  const { setHoveredProject, filter, setOverStage } = useUIStore();

  const items: Spiral3DSlide[] = useMemo(
    () =>
      projects
        // "All work" leaves out the case studies (their work is already in the helix).
        .filter((p) => (filter ? p.buyer === filter : !p.case))
        .map((p) => ({
          id: p.id,
          src: encodeURI(p.asset_locations[0]),
          alt: p.website_project_name,
          project: p,
          slides: p.asset_locations.filter((s) => !isVideo(s)).slice(0, 8).map((s) => encodeURI(s)),
        })),
    [projects, filter]
  );

  return (
    <div
      className="w-full h-dvh fixed inset-0 z-0 bg-transparent"
      onPointerEnter={() => setOverStage(true)}
      onPointerLeave={() => setOverStage(false)}
    >
      <Spiral3DSlider
        items={items}
        spinKey={filter ?? "all"}
        onSelect={onSelect}
        onHover={setHoveredProject}
        blurStrength={1.8}
        autoRotate={true}
        autoSpeed={0.35}
        radius={240}
        verticalGap={65}
        cardWidth={260}
        cardAspectRatio={3 / 2}
        bend={0.16}
        className="w-full h-full bg-transparent"
      />
    </div>
  );
}
