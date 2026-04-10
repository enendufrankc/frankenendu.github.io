import { useState } from "react";
import { PROJECT_DOMAINS } from "../lib/constants";

export default function ProjectFilter() {
  const [activeDomain, setActiveDomain] = useState("All");

  function handleClick(domain: string) {
    setActiveDomain(domain);

    const cards = document.querySelectorAll<HTMLElement>(".project-card");
    cards.forEach((card) => {
      if (domain === "All" || card.dataset.domain === domain) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      {PROJECT_DOMAINS.map((domain) => {
        const isActive = activeDomain === domain;
        return (
          <button
            key={domain}
            onClick={() => handleClick(domain)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.8rem",
              borderRadius: "9999px",
              border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 150ms ease",
              fontFamily: "var(--font-body)",
            }}
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
}
