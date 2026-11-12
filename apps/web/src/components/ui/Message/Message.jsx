import "./Message.css";

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

/**
 * Renders one message received from the chat API.
 *
 * The component is intentionally presentation-only. Fetching, pagination,
 * optimistic updates and retrying failed sends belong to the chat container.
 */
export default function Message({ message, currentUserId }) {
  const {
    author,
    content,
    attachments = [],
    createdAt,
    editedAt,
    status,
  } = message;
  const isOwnMessage = author.id === currentUserId;
  const authorLabel = isOwnMessage ? "Você" : author.name;
  const timeLabel = formatMessageTime(createdAt);
  const messageType = isOwnMessage ? "sender" : "recipient";

  return (
    <article
      className={`message message--${messageType}`}
      data-message-id={message.id}
      data-message-type={messageType}
      title={timeLabel ? `Enviada às ${timeLabel}` : undefined}
      aria-label={`Mensagem de ${authorLabel}`}
    >
      <div
        className={`message__avatar message__avatar--${author.color ?? "purple"}`}
        aria-hidden="true"
      >
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt="" />
        ) : (
          author.name.slice(0, 1).toUpperCase()
        )}
      </div>
      <div className="message__body">
        <header className="message__meta">
          <strong>{authorLabel}</strong>
          {timeLabel && (
            <time dateTime={createdAt} aria-label={`Enviada às ${timeLabel}`}>
              {timeLabel}
            </time>
          )}
          {editedAt && <span>(editada)</span>}
        </header>
        <p className="message__text">{content}</p>
        {attachments.length > 0 && (
          <div className="message__attachments">
            {attachments.map((attachment) => (
              attachment.kind === "image" ? (
                <a
                  className="message__image-link"
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  key={attachment.id}
                >
                  <img src={attachment.url} alt={attachment.name} />
                </a>
              ) : (
                <a
                  className="message__file"
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  download={attachment.name}
                  key={attachment.id}
                >
                  <span aria-hidden="true">File</span>
                  <span>
                    <strong>{attachment.name}</strong>
                    <small>{attachment.mimeType || "Arquivo"}</small>
                  </span>
                </a>
              )
            ))}
          </div>
        )}
        {status === "sending" && (
          <span className="message__status" role="status">Enviando...</span>
        )}
        {status === "failed" && (
          <span className="message__status message__status--error" role="alert">
            Não foi possível enviar
          </span>
        )}
      </div>
    </article>
  );
}