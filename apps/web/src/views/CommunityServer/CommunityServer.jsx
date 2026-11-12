import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCommunityById } from "../../data/communities";
import "./CommunityServer.css";
import InputField from "../../components/ui/Field/InputField";
import ActionButton from "@/components/ui/Button/ActionButton";
import Message from "@/components/ui/Message/Message";

const menuItems = [
  { id: "chat", label: "Conversas" },
  { id: "calls", label: "Chamadas" },
  { id: "classes", label: "Aulas" },
  { id: "schedule", label: "Cronograma" },
  { id: "content", label: "Conteúdo" },
  { id: "support", label: "Suporte" },
];

const initialMessages = [
  { id: "message-1", author: { id: "marina", name: "Marina", color: "orange" }, content: "Alguém já testou useEffect com cleanup?", createdAt: "2026-11-12T14:02:00-03:00", attachments: [] },
  { id: "message-2", author: { id: "caio", name: "Caio", color: "green" }, content: "Testei ontem: retorna a função dentro do efeito.", createdAt: "2026-11-12T14:05:00-03:00" },
  { id: "message-3", author: { id: "bia", name: "Bia", color: "pink" }, content: "Posso mandar o exemplo no repositório?", createdAt: "2026-11-12T14:06:00-03:00" },
  { id: "message-4", author: { id: "theo", name: "Théo", color: "blue" }, content: "Manda, reviso depois do almoço.", createdAt: "2026-11-12T14:09:00-03:00" },
  { id: "message-5", author: { id: "lia", name: "Lia", color: "purple" }, content: "Subi a branch nova com os testes.", createdAt: "2026-11-12T14:12:00-03:00", attachments: [{ id: "attachment-1", name: "preview.svg", kind: "image", mimeType: "image/svg+xml", url: "/favicon.svg" }] },
  { id: "message-6", author: { id: "current-user", name: "Você", color: "blue" }, content: "Deixei também o material de referência.", createdAt: "2026-11-12T14:14:00-03:00", attachments: [{ id: "attachment-2", name: "icons.svg", kind: "file", mimeType: "image/svg+xml", url: "/icons.svg" }] },
];

// const activeMembers = messages.map(({ initial, color }) => ({ initial, color }));

export default function CommunityServer() {
  const { communityId } = useParams();
  const community = getCommunityById(communityId);
  const [selectedMenu, setSelectedMenu] = useState(menuItems[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const objectUrls = useRef(new Set());

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

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
      <aside className="community-server__sidebar">
        <h2>Menu</h2>
        <ul className="community-server__menu" role="radiogroup" aria-label="Seções do servidor">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={selectedMenu === item.id ? "is-selected" : ""}
              role="presentation"
            >
              <button
                type="button"
                role="radio"
                aria-checked={selectedMenu === item.id}
                onClick={() => setSelectedMenu(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {selectedMenu === "chat" ? (
        <>
          <header className="community-server__header community-server__chat-header">
            <button className="community-server__channel" type="button">
              <span># duvidas-js</span>
            </button>
            <div className="community-server__active-members" aria-label="Membros ativos">
              {/* {activeMembers.map((member) => (
                <span
                  className={`community-server__avatar community-server__avatar--${member.color}`}
                  key={member.initial}
                >
                  {member.initial}
                </span>
              ))} */}
            </div>
          </header>
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
            <form
              className="community-server__message-form"
              onSubmit={(event) => {
                event.preventDefault();
                const content = message.trim();

                if (!content && selectedFiles.length === 0) {
                  return;
                }

                setMessages((currentMessages) => [
                  ...currentMessages,
                  {
                    id: `local-${Date.now()}`,
                    author: {
                      id: "current-user",
                      name: "Você",
                      color: "purple",
                    },
                    content,
                    createdAt: new Date().toISOString(),
                    status: "sending",
                    attachments: selectedFiles,
                  },
                ]);
                setMessage("");
                setSelectedFiles([]);
              }}
            >
              <InputField
                placeholder="Escreva e pressione Enter"
                className="community-server__message-input"
                value={message}
                onChange={setMessage}
              />
              <ActionButton
                type="button"
                className="community-server__midia-button outline"
                onClick={() => setIsMediaModalOpen(true)}
                aria-label="Adicionar mídia"
              >
                +
              </ActionButton>
              <ActionButton type="submit" className="community-server__send-button fill">
                Enviar
              </ActionButton>

            </form>
          </main>
          {isMediaModalOpen && (
            <div className="community-server__modal-backdrop" onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsMediaModalOpen(false);
            }}>
              <section className="community-server__media-modal" role="dialog" aria-modal="true" aria-labelledby="media-modal-title">
                <header>
                  <h2 id="media-modal-title">Adicionar mídia</h2>
                  <button type="button" onClick={() => setIsMediaModalOpen(false)} aria-label="Fechar">
                    ×
                  </button>
                </header>
                <label className="community-server__file-picker">
                  <span>Escolha fotos ou arquivos para enviar</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx"
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []).map((file) => ({
                        id: `${file.name}-${file.lastModified}`,
                        name: file.name,
                        mimeType: file.type || "application/octet-stream",
                        kind: file.type.startsWith("image/") ? "image" : "file",
                        url: URL.createObjectURL(file),
                      }));
                      files.forEach(({ url }) => objectUrls.current.add(url));
                      setSelectedFiles(files);
                    }}
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <ul className="community-server__selected-files">
                    {selectedFiles.map((file) => <li key={file.id}>{file.name}</li>)}
                  </ul>
                )}
                <footer>
                  <ActionButton type="button" className="outline" onClick={() => setIsMediaModalOpen(false)}>
                    Cancelar
                  </ActionButton>
                  <ActionButton
                    type="button"
                    className="fill"
                    disabled={selectedFiles.length === 0}
                    onClick={() => setIsMediaModalOpen(false)}
                  >
                    Anexar
                  </ActionButton>
                </footer>
              </section>
            </div>
          )}
        </>
      ) : (
        <>
          <header className="community-server__header">
            <div>
              <p>Servidor da comunidade</p>
              <h1>{community.title}</h1>
            </div>
          </header>
          <main className="community-server__content">
            <h2>Bem-vindo ao servidor</h2>
            <p>Este é o espaço para conversar, compartilhar conhecimento e colaborar com outros estudantes.</p>
          </main>
        </>
      )}
    </section>
  );
}
