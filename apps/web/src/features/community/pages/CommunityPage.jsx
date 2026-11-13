import { useState } from "react";
import CommunityCard from "../../../app/components/ui/Card/CommunityCard";
import {
  communities as myCommunities,
  discoverCommunities,
} from "../mocks/communityList";
import "./CommunityPage.css";

function CommunityGrid({ communities }) {
  return (
    <div className="community-page__grid">
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          title={community.title}
          description={community.description}
          imageUrl={community.imageUrl}
          to={`/comunidades/${community.id}`}
        />
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const [viewMode, setViewMode] = useState("mine");
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const isMineMode = viewMode === "mine";
  const communities = isMineMode ? myCommunities : discoverCommunities;
  const sectionTitle = isMineMode ? "Minhas comunidades" : "Discover";
  const sectionId = isMineMode ? "my-communities-title" : "discover-title";

  function toggleViewMode() {
    if (transitionPhase !== "idle") {
      return;
    }

    setTransitionPhase("expanding");
  }

  function handleTransitionEnd(event) {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "clip-path"
    ) {
      return;
    }

    if (transitionPhase === "expanding") {
      setViewMode((currentMode) => (currentMode === "mine" ? "discover" : "mine"));
      setTransitionPhase("contracting");
      return;
    }

    if (transitionPhase === "contracting") {
      setTransitionPhase("idle");
    }
  }

  return (
    <section className="community-page">
      <header className="community-page__header">
        <div>
          <p>Conecte-se com outros estudantes</p>
          <h1>Comunidades</h1>
        </div>
        <div className="community-page__search">
          <input
            type="search"
            placeholder="Buscar comunidades..."
            aria-label="Buscar comunidades"
          />
        </div>
        {!isMineMode && (
          <nav className="community-page__tabs" aria-label="Filtros de comunidades">
            <button type="button">Todas</button>
            <button type="button">Minhas comunidades</button>
            <button type="button">Populares</button>
            <button type="button">Recentes</button>
          </nav>
        )}
      </header>

      <section
        className="community-page__mode-content"
        aria-busy={transitionPhase !== "idle"}
      >
        <section className="community-page__section" aria-labelledby={sectionId}>
          <div className="community-page__separator">
            <h2 id={sectionId}>{sectionTitle}</h2>
          </div>
          <CommunityGrid communities={communities} />
        </section>

        <div className="community-page__transition" aria-hidden="true">
          <div
            className="community-page__transition-circle"
            aria-busy={transitionPhase === "expanding"}
            onTransitionEnd={handleTransitionEnd}
          />
        </div>
      </section>

      <button
        className="community-page__mode-toggle"
        type="button"
        onClick={toggleViewMode}
        disabled={transitionPhase !== "idle"}
        aria-label={`Alternar para ${isMineMode ? "Discover" : "Minhas comunidades"}`}
        title={`Alternar para ${isMineMode ? "Discover" : "Minhas comunidades"}`}
      >
        i
      </button>
    </section>
  );
}
