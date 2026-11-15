import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getCommunityById } from "../mocks/communityList";
import { menuItems } from "../mocks/communityMocks";
import { useMessages } from "../hooks/useMessages";
import CommunityHeader from "../components/CommunityHeader";
import CommunitySidebar from "../components/CommunitySidebar";
import MessageComposer from "../components/MessageComposer";
import LessonsPage from "../../lessons/pages/LessonsPage";
import "./CommunityServerPage.css";
import Message from "../../../app/components/ui/Message/Message";
import Schedule from "../../../app/components/ui/Schedule/Schedule";

export default function CommunityServerPage() {
  const { communityId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const community = getCommunityById(communityId);
  const requestedSection = searchParams.get("secao");
  const [selectedMenu, setSelectedMenu] = useState(
    menuItems.some((item) => item.id === requestedSection)
      ? requestedSection
      : menuItems[0].id,
  );
  const { messages, addMessage } = useMessages();

  function handleSelectMenu(menuId) {
    setSelectedMenu(menuId);

    const nextParams = new URLSearchParams(searchParams);
    if (menuId === menuItems[0].id) {
      nextParams.delete("secao");
    } else {
      nextParams.set("secao", menuId);
    }

    setSearchParams(nextParams, { replace: true });
  }

  if (!community) {
    return (
      <section className="community-server">
        <h1>Comunidade não encontrada</h1>
        <Link to="/comunidades">Voltar para comunidades</Link>
      </section>
    );
  }

  return (
    <section className="community-server">
      <CommunitySidebar selectedMenu={selectedMenu} onSelectMenu={handleSelectMenu} />
      {selectedMenu === "schedule" ? (
        <>
          <CommunityHeader title={community.title} />
          <main className="community-server__content community-server__schedule-content">
            <Schedule />
          </main>
        </>
      ) : selectedMenu === "chat" ? (
        <>
          <CommunityHeader title={community.title} isChat />
          <main className="community-server__content community-server__chat-content">
            <div className="community-server__messages" aria-live="polite">
              {messages.map((currentMessage) => (
                <Message
                  key={currentMessage.id}
                  message={currentMessage}
                  currentUserId="current-user"
                />
              ))}
            </div>
            <MessageComposer
              onSend={(content, attachments) => {
                addMessage({
                  id: `local-${Date.now()}`,
                  author: {
                    id: "current-user",
                    name: "Você",
                    color: "purple",
                  },
                  type: "sender",
                  content,
                  createdAt: new Date().toISOString(),
                  status: "sending",
                  attachments,
                });
              }}
            />
          </main>
        </>
      ) : selectedMenu === "classes" ? (
        <>
          <CommunityHeader title={community.title} />
          <main className="community-server__content community-server__lessons-content">
            <LessonsPage embedded community={community} />
          </main>
        </>
      ) : (
        <>
          <CommunityHeader title={community.title} />
          <main className="community-server__content">
            <h2>Bem-vindo ao servidor</h2>
            <p>Este é o espaço para conversar, compartilhar conhecimento e colaborar com outros estudantes.</p>
          </main>
        </>
      )}
    </section>
  );
}
