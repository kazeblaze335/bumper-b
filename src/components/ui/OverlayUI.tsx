"use client";
import { useStore } from "@/store/useStore";

const projectData = [
  { title: "Redroom Gesture 14", category: "Concept Series", year: "2025" },
  { title: "Shadowwear 6AM", category: "Photography", year: "2024" },
  { title: "Blur Formation 03", category: "Kinetic Study", year: "2024" },
  { title: "Sunglass Operator", category: "Editorial Motion", year: "2023" },
  { title: "Azure Figure 5", category: "Visual Research", year: "2024" },
].concat(
  Array(9).fill({ title: "Unknown Study", category: "Archive", year: "2024" }),
);

export default function OverlayUI() {
  const { activeLayout, previousLayout, setActiveLayout, activeProject } =
    useStore();
  const currentData = projectData[activeProject] || projectData[0];
  const isLensMode = activeLayout === "layout-4-lens";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        pointerEvents: "none",
      }}
    >
      {/* --- TOP RIGHT MENU --- */}
      <nav className="editorial-nav">
        {[
          "layout-1-gallery",
          "layout-2-gallery",
          "layout-3-gallery",
          "layout-4-lens",
        ].map((layout, i) => (
          <button
            key={layout}
            onClick={() => setActiveLayout(layout)}
            className={activeLayout === layout ? "active" : ""}
          >
            Layout {i + 1}
          </button>
        ))}
      </nav>

      {/* --- MINIMAP TYPOGRAPHY CONTAINER --- */}
      <div className={`lens-bar-container ${isLensMode ? "active" : ""}`}>
        {/* Left Column Wrapper */}
        <div style={{ width: "32.5%", padding: "2.5rem 3rem" }}>
          {/* Animated Key Trick triggers slideUpFade on index change */}
          <div
            key={`left-${activeProject}`}
            className="animate-text-cycle"
            style={{
              color: "#000",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>{(activeProject + 1).toString().padStart(2, "0")}</span>
            <span>{currentData.category}</span>
          </div>
        </div>

        {/* Center Void / Close Button */}
        <div style={{ width: "35%", position: "relative" }}>
          <button
            onClick={() => setActiveLayout(previousLayout)}
            style={{
              position: "absolute",
              bottom: "-3rem",
              left: "50%",
              transform: "translateX(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              pointerEvents: isLensMode ? "auto" : "none",
              color: "rgba(0, 0, 0, 0.5)",
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            [ Close View ]
          </button>
        </div>

        {/* Right Column Wrapper */}
        <div style={{ width: "32.5%", padding: "2.5rem 3rem" }}>
          {/* Animated Key Trick triggers slideUpFade on index change */}
          <div
            key={`right-${activeProject}`}
            className="animate-text-cycle"
            style={{
              textAlign: "right",
              color: "#000",
              fontSize: "11px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>{currentData.title}</span>
            <span>{currentData.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
