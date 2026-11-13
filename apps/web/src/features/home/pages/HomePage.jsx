import CommunityCard from "../../../app/components/ui/Card/CommunityCard";

export default function HomePage() {
  return (
    <section className="home-page">
      <header>
        <p>Olá, estudante!</p>
        <h1>Continue aprendendo</h1>
      </header>

      <section>
        <h2>Suas comunidades</h2>
        <CommunityCard
          title="Comunidade de Desenvolvimento"
          description="Aprenda, compartilhe e colabore com outros estudantes."
          imageUrl="/images/community-development.jpg"
          to="/comunidades/1"
        />
      </section>
    </section>
  );
}
