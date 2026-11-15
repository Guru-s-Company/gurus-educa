import { useState } from "react";
import { Link } from "react-router-dom";
import CommunityCard from "../../../app/components/ui/Card/CommunityCard";
import LessonCard from "../../lessons/components/LessonCard";
import LessonDetails from "../../lessons/components/LessonDetails";
import LessonState from "../../lessons/components/LessonState";
import NextLessonCard from "../../lessons/components/NextLessonCard";
import { useLessons } from "../../lessons/hooks/useLessons";
import "./HomePage.css";

export default function HomePage() {
  const { upcomingLessons, status, error, reload } = useLessons();
  const [selectedLesson, setSelectedLesson] = useState(null);

  const nextLesson = upcomingLessons[0] ?? null;
  const followingLessons = upcomingLessons.slice(1, 4);
  const isInitialLoading = status === "loading" && upcomingLessons.length === 0;

  return (
    <section className="home-page">
      <header className="home-page__header">
        <p>Olá, estudante!</p>
        <h1>Continue aprendendo</h1>
      </header>

      <section className="home-page__upcoming" aria-labelledby="home-upcoming-title">
        <div className="home-page__section-heading">
          <div>
            <p className="home-page__eyebrow">Agenda acadêmica</p>
            <h2 id="home-upcoming-title">Próximas aulas</h2>
          </div>
          <Link className="home-page__section-link" to="/aulas">
            Ver agenda completa
          </Link>
        </div>

        {isInitialLoading ? (
          <LessonState status="loading" />
        ) : status === "error" ? (
          <LessonState status="error" error={error} onRetry={reload} />
        ) : !nextLesson ? (
          <LessonState
            status="empty"
            title="Nenhuma aula agendada"
            description="Quando novos encontros forem marcados, eles aparecerão aqui."
          />
        ) : (
          <>
            <NextLessonCard lesson={nextLesson} onOpenDetails={setSelectedLesson} />
            {followingLessons.length > 0 && (
              <div className="home-page__lessons-grid">
                {followingLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    showMeetingLink
                    onOpenDetails={setSelectedLesson}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="home-page__communities" aria-labelledby="home-communities-title">
        <div className="home-page__section-heading">
          <h2 id="home-communities-title">Suas comunidades</h2>
        </div>
        <CommunityCard
          title="Comunidade de Desenvolvimento"
          description="Aprenda, compartilhe e colabore com outros estudantes."
          imageUrl="/images/community-development.jpg"
          to="/comunidades/1"
        />
      </section>

      {selectedLesson && (
        <LessonDetails lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </section>
  );
}
