import "./Message.css";

/**
 * @typedef {Object} MessageAuthor
 * @property {string} id
 * @property {string} name
 * @property {string} [color]
 * @property {string} [avatarUrl]
 */

/**
 * @typedef {Object} MessageAttachment
 * @property {string} id
 * @property {string} name
 * @property {string} [mimeType]
 * @property {"image" | "file"} kind
 * @property {string} url
 */

/**
 * @typedef {Object} MessageProps
 * @property {Object} message - Mensagem vinda da API/chat container.
 * @property {string} message.id
 * @property {MessageAuthor} [message.author]
 * @property {string} message.content
 * @property {MessageAttachment[]} [message.attachments]
 * @property {string} message.createdAt
 * @property {string} [message.editedAt]
 * @property {"sending" | "sent" | "failed" | "delivered"} [message.status]
 * @property {"recipient" | "sender" | "admin"} [message.type] - Tipo de mensagem.
 * @property {string} [currentUserId] - Id do usuário logado para identificar "Você".
 */

function formatMessageTime(createdAt) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderAttachment(attachment) {
  if (attachment.kind === "image") {
    return (
      <figure className="message__image-card" key={attachment.id}>
        <img src={attachment.url} alt={attachment.name} />
        <figcaption>{attachment.name}</figcaption>
      </figure>
    );
  }

  return (
    <a
      className="message__file"
      href={attachment.url}
      target="_blank"
      rel="noreferrer"
      download={attachment.name}
      key={attachment.id}
    >
      <span aria-hidden="true">📄</span>
      <span>
        <strong>{attachment.name}</strong>
        <small>{attachment.mimeType || "Arquivo"}</small>
      </span>
    </a>
  );
}

/**
 * Renderiza uma única mensagem.
 *
 * Apresentação apenas. Busca, paginação, optimistic updates e retry de
 * envios pertencem ao container de chat (ex.: CommunityServer).
 *
 * Tipos de mensagem:
 * - recipient: recebida (roxo)
 * - sender:    enviada pelo usuário (verde)
 * - admin:     sistema/administração (amarelo)
 */
export default function Message({ message, currentUserId, type }) {
  const {
    author,
    content,
    attachments = [],
    createdAt,
    editedAt,
    status,
  } = message;
  const messageType = type || message.type || "recipient";
  const isSystem = messageType === "admin";
  const isOwnMessage = !isSystem && author && author.id === currentUserId;
  const authorLabel = isOwnMessage ? "Você" : author?.name;
  const timeLabel = formatMessageTime(createdAt);
  const hasAttachments = attachments.length > 0;
  const isSending = status === "sending";

  const classNames = [
    "message",
    `message--${messageType}`,
    isSending && "message--sending",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={classNames}
      data-message-id={message.id}
      data-message-type={messageType}
      data-has-attachments={hasAttachments ? "true" : "false"}
      data-status={status}
      title={timeLabel ? `Enviada às ${timeLabel}` : undefined}
      aria-label={isSystem ? "Mensagem da administração" : `Mensagem de ${authorLabel}`}
    >
      {hasAttachments && (
        <div className="message__attachments">
          {attachments.map(renderAttachment)}
        </div>
      )}
      <div
        className={`message__avatar message__avatar--${author?.color ?? "purple"}`}
        aria-hidden="true"
      >
        {author?.avatarUrl ? (
          <img src={author.avatarUrl} alt="" />
        ) : (
          author?.name?.slice(0, 1).toUpperCase() || "S"
        )}
      </div>
      <div className="message__body">
        <header className="message__meta">
          <strong>{isSystem ? "Administração" : authorLabel}</strong>
          {timeLabel && (
            <time dateTime={createdAt} aria-label={`Enviada às ${timeLabel}`}>
              {timeLabel}
            </time>
          )}
          {editedAt && <span>(editada)</span>}
        </header>
        <p className="message__text">{content}</p>
        {status === "failed" && (
          <span className="message__status message__status--error" role="alert">
            Não foi possível enviar
          </span>
        )}
      </div>
    </article>
  );
}