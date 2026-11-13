export default function CommunityHeader({ title, isChat = false }) {
  if (isChat) {
    return (
      <header className="community-server__header community-server__chat-header">
        <button className="community-server__channel" type="button">
          <span># duvidas-js</span>
        </button>
        <div className="community-server__active-members" aria-label="Membros ativos" />
      </header>
    );
  }

  return (
    <header className="community-server__header">
      <div>
        <p>Servidor da comunidade</p>
        <h1>{title}</h1>
      </div>
    </header>
  );
}
