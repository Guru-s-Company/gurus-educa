import { useEffect, useRef, useState } from "react";
import ActionButton from "../../../app/components/ui/Button/ActionButton";
import InputField from "../../../app/components/ui/Field/InputField";
import "./MessageComposer.css";

export default function MessageComposer({ onSend }) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const objectUrls = useRef(new Set());
  const selectedFileUrls = useRef(new Set());
  const modalCloseButton = useRef(null);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!isMediaModalOpen) {
      return undefined;
    }

    const previousFocus = document.activeElement;
    modalCloseButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMediaModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isMediaModalOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const content = message.trim();

    if (!content && selectedFiles.length === 0) {
      return;
    }

    onSend(content, selectedFiles);
    setMessage("");
    setSelectedFiles([]);
    selectedFileUrls.current.clear();
  };

  const handleFileChange = (event) => {
    selectedFileUrls.current.forEach((url) => {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    });
    selectedFileUrls.current.clear();

    const files = Array.from(event.target.files || []).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      kind: file.type.startsWith("image/") ? "image" : "file",
      url: URL.createObjectURL(file),
    }));

    files.forEach(({ url }) => {
      objectUrls.current.add(url);
      selectedFileUrls.current.add(url);
    });
    setSelectedFiles(files);
  };

  return (
    <>
      <form className="message-composer" onSubmit={handleSubmit}>
        <div className="message-composer__field">
          <InputField
            placeholder="Escreva e pressione Enter"
            className="message-composer__input"
            value={message}
            onChange={setMessage}
          />
        </div>
        <ActionButton
          type="button"
          className="message-composer__media-button outline"
          onClick={() => setIsMediaModalOpen(true)}
          aria-label="Adicionar mídia"
        >
          +
        </ActionButton>
        <ActionButton type="submit" className="message-composer__send-button fill">
          Enviar
        </ActionButton>
      </form>

      {isMediaModalOpen && (
        <div
          className="message-composer__modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsMediaModalOpen(false);
          }}
        >
          <section
            className="message-composer__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-modal-title"
          >
            <header>
              <h2 id="media-modal-title">Adicionar mídia</h2>
              <button
                type="button"
                ref={modalCloseButton}
                onClick={() => setIsMediaModalOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>
            <label className="message-composer__file-picker">
              <span>Escolha fotos ou arquivos para enviar</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
              />
            </label>
            {selectedFiles.length > 0 && (
              <ul className="message-composer__selected-files">
                {selectedFiles.map((file) => <li key={file.id}>{file.name}</li>)}
              </ul>
            )}
            <footer>
              <ActionButton
                type="button"
                className="outline"
                onClick={() => setIsMediaModalOpen(false)}
              >
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
  );
}
