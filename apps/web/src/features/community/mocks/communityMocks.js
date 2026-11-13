export const menuItems = [
  { id: "chat", label: "Conversas" },
  { id: "calls", label: "Chamadas" },
  { id: "classes", label: "Aulas" },
  { id: "schedule", label: "Cronograma" },
  { id: "content", label: "Conteúdo" },
  { id: "support", label: "Suporte" },
];

export const initialMessages = [
  { id: "message-1", author: { id: "marina", name: "Marina", color: "orange" }, type: "recipient", content: "Alguém já testou useEffect com cleanup?", createdAt: "2026-11-12T14:02:00-03:00", attachments: [] },
  { id: "message-2", author: { id: "caio", name: "Caio", color: "green" }, type: "recipient", content: "Testei ontem: retorna a função dentro do efeito.", createdAt: "2026-11-12T14:05:00-03:00" },
  { id: "message-3", author: { id: "bia", name: "Bia", color: "pink" }, type: "recipient", content: "Posso mandar o exemplo no repositório?", createdAt: "2026-11-12T14:06:00-03:00" },
  { id: "message-4", author: { id: "theo", name: "Théo", color: "blue" }, type: "recipient", content: "Manda, reviso depois do almoço.", createdAt: "2026-11-12T14:09:00-03:00" },
  { id: "message-5", author: { id: "lia", name: "Lia", color: "purple" }, type: "recipient", content: "Subi a branch nova com os testes.", createdAt: "2026-11-12T14:12:00-03:00", attachments: [{ id: "attachment-1", name: "preview.svg", kind: "image", mimeType: "image/svg+xml", url: "/favicon.svg" }] },
  { id: "message-6", author: { id: "current-user", name: "Você", color: "blue" }, type: "sender", content: "Deixei também o material de referência.", createdAt: "2026-11-12T14:14:00-03:00", attachments: [{ id: "attachment-2", name: "icons.svg", kind: "file", mimeType: "image/svg+xml", url: "/icons.svg" }] },
  { id: "message-admin-1", type: "admin", content: "Bem-vindos ao servidor! Este é um canal da administração da comunidade.", createdAt: "2026-11-12T13:58:00-03:00" },
];
