import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import InputField from "../../../app/components/ui/Field/InputField";
import { useAuth } from "../../../app/providers/AuthContext";
import { profileService } from "../services/profileService";
import "./ProfileModal.css";

const EDUCATION_OPTIONS = [
  { value: "ensino-fundamental", label: "Ensino fundamental" },
  { value: "ensino-medio", label: "Ensino médio" },
  { value: "graduacao", label: "Graduação" },
  { value: "pos-graduacao", label: "Pós-graduação" },
];

const EDUCATION_FROM_API = {
  ENSINO_FUNDAMENTAL: "ensino-fundamental",
  ENSINO_MEDIO: "ensino-medio",
  GRADUACAO: "graduacao",
  POS_GRADUACAO: "pos-graduacao",
};

const ROLE_LABELS = {
  STUDENT: "Estudante",
  TEACHER: "Professor",
  ADMIN: "Administrador",
};

function normalizeEducation(value) {
  return EDUCATION_FROM_API[value] || value || "";
}

function getProfileDraft(profile) {
  return {
    fullName: profile?.name || "",
    phone: profile?.phone || "",
    education: normalizeEducation(profile?.education),
  };
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "Não informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfileModal({ onClose }) {
  const { accessToken, updateUser } = useAuth();
  const dialogRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(getProfileDraft(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      setIsLoading(true);
      setError("");

      if (!accessToken) {
        setError("Sua sessão não está disponível. Entre novamente para consultar seu perfil.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await profileService.getMyProfile(accessToken, {
          signal: controller.signal,
        });

        setProfile(result.profile);
        setDraft(getProfileDraft(result.profile));
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || "Não foi possível carregar seu perfil.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, [accessToken, reloadKey]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSaving, onClose]);

  function handleCancelEdit() {
    setDraft(getProfileDraft(profile));
    setIsEditing(false);
    setError("");
    setNotice("");
  }

  function handleDialogKeyDown(event) {
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!profile || isSaving) return;

    const fullName = draft.fullName.trim();
    const phone = draft.phone.replace(/\D/g, "");

    if (fullName.length < 2) {
      setError("Informe seu nome completo com pelo menos 2 caracteres.");
      return;
    }

    if (phone.length < 10 || phone.length > 11) {
      setError("Informe um telefone com DDD e 10 ou 11 dígitos.");
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        fullName,
        phone,
        ...(draft.education ? { education: draft.education } : {}),
      };

      const result = await profileService.updateMyProfile(payload, accessToken);
      const updatedProfile = result.profile;

      setProfile(updatedProfile);
      setDraft(getProfileDraft(updatedProfile));
      updateUser?.({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });
      setIsEditing(false);
      setNotice("Suas informações foram atualizadas.");
    } catch (requestError) {
      setError(requestError.message || "Não foi possível salvar suas alterações.");
    } finally {
      setIsSaving(false);
    }
  }

  const roleLabels = (profile?.roles || []).map(
    (role) => ROLE_LABELS[role] || role,
  );

  return createPortal(
    <div
      className="profile-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        aria-busy={isLoading || isSaving}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="profile-modal__header">
          <div>
            <span className="profile-modal__eyebrow">ÁREA PESSOAL</span>
            <h2 id="profile-modal-title">Minha conta</h2>
            <p>Consulte e mantenha seus dados atualizados.</p>
          </div>

          <button
            className="profile-modal__close"
            type="button"
            aria-label="Fechar perfil"
            onClick={onClose}
            disabled={isSaving}
          >
            <X size={21} />
          </button>
        </header>

        {isLoading ? (
          <div className="profile-modal__state" role="status">
            <LoaderCircle className="profile-modal__spinner" size={34} />
            <strong>Carregando seu perfil</strong>
            <span>Estamos buscando suas informações.</span>
          </div>
        ) : profile ? (
          <form className="profile-modal__form" onSubmit={handleSubmit}>
            <div className="profile-modal__identity">
              <div className="profile-modal__avatar" aria-hidden="true">
                {getInitials(profile.name) || <UserRound size={30} />}
              </div>

              <div className="profile-modal__identity-copy">
                <h3>{profile.name}</h3>
                <span className="profile-modal__email">
                  <Mail size={15} />
                  {profile.email}
                </span>
                <div className="profile-modal__roles">
                  {roleLabels.length ? (
                    roleLabels.map((role) => (
                      <span className="profile-modal__role" key={role}>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="profile-modal__role">Membro</span>
                  )}
                </div>
              </div>

              <span
                className={
                  "profile-modal__account-status" +
                  (profile.isActive ? " is-active" : " is-inactive")
                }
              >
                <span />
                {profile.isActive ? "Conta ativa" : "Conta inativa"}
              </span>
            </div>

            <div className="profile-modal__section-heading">
              <div>
                <h3>Dados pessoais</h3>
                <p>Essas informações compõem seu perfil no Guru&apos;s Educa.</p>
              </div>

              <button
                className="profile-modal__edit-button"
                type="button"
                onClick={() => {
                  if (isEditing) {
                    handleCancelEdit();
                  } else {
                    setIsEditing(true);
                    setNotice("");
                    setError("");
                  }
                }}
                disabled={isSaving}
              >
                {isEditing ? <X size={16} /> : <Pencil size={16} />}
                {isEditing ? "Cancelar edição" : "Editar perfil"}
              </button>
            </div>

            <div className="profile-modal__fields">
              <InputField
                id="profile-full-name"
                label="Nome completo"
                name="fullName"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={draft.fullName}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, fullName: value }))
                }
                disabled={!isEditing || isSaving}
                required={isEditing}
              />

              <InputField
                id="profile-email"
                label="E-mail"
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email || ""}
                readOnly
                disabled={isSaving}
                hint="O e-mail de acesso não pode ser alterado por aqui."
              />

              <InputField
                id="profile-phone"
                label="Telefone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="Somente números com DDD"
                maxLength={11}
                value={draft.phone}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    phone: value.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                disabled={!isEditing || isSaving}
                required={isEditing}
              />

              <div className="profile-modal__select-field">
                <label htmlFor="profile-education">Escolaridade</label>
                <div className="profile-modal__select-wrap">
                  <select
                    id="profile-education"
                    name="education"
                    value={draft.education}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        education: event.target.value,
                      }))
                    }
                    disabled={!isEditing || isSaving}
                  >
                    <option value="">Não informado</option>
                    {EDUCATION_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <GraduationCap size={18} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="profile-modal__metadata">
              <div>
                <CalendarDays size={17} />
                <span>
                  <small>Membro desde</small>
                  <strong>{formatDate(profile.createdAt)}</strong>
                </span>
              </div>
              <div>
                <ShieldCheck size={17} />
                <span>
                  <small>Identificação da conta</small>
                  <strong>#{profile.id}</strong>
                </span>
              </div>
            </div>

            {error && (
              <p className="profile-modal__feedback is-error" role="alert">
                <AlertCircle size={17} />
                {error}
              </p>
            )}

            {notice && (
              <p className="profile-modal__feedback is-success" role="status">
                <CheckCircle2 size={17} />
                {notice}
              </p>
            )}

            <footer className="profile-modal__footer">
              {isEditing ? (
                <>
                  <button
                    className="profile-modal__secondary-button"
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    className="profile-modal__primary-button"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <LoaderCircle
                        className="profile-modal__spinner"
                        size={17}
                      />
                    ) : (
                      <Save size={17} />
                    )}
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </>
              ) : (
                <button
                  className="profile-modal__primary-button"
                  type="button"
                  onClick={onClose}
                >
                  Concluir
                </button>
              )}
            </footer>
          </form>
        ) : (
          <div className="profile-modal__state profile-modal__state--error">
            <AlertCircle size={34} />
            <strong>Não foi possível abrir seu perfil</strong>
            <span>
              {error || "Ocorreu um erro ao consultar seus dados."}
            </span>
            <button
              className="profile-modal__primary-button"
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}
