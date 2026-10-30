import { useReducer, useState } from "react";

import "./RegisterForm.css";

import PasswordField from "../Field/PasswordField.jsx";
import InputField from "../Field/InputField.jsx";
import SelectField from "../Field/SelectField.jsx";
import ActionButton from "../Button/ActionButton.jsx";

import { GithubIcon, GoogleIcon } from "../Icon/Icon.jsx";

/**
 * Textos constantes do formulário de registro
 * @type {Object}
 */
const REGISTER_FORM_TEXTS = {
    TITLE: "Cadastro",
    STEP_LABEL: "Etapa {step} de 2",
    EMAIL_LABEL: "Email",
    PASSWORD_LABEL: "Senha",
    CONFIRM_PASSWORD_LABEL: "Confirmar senha",
    FULL_NAME_LABEL: "Nome Completo",
    FULL_NAME_PLACEHOLDER: "Cleiton Guru da Silva",
    CPF_LABEL: "CPF (Somente números)",
    CPF_PLACEHOLDER: "Digite seu CPF",
    PHONE_LABEL: "Celular (Somente números)",
    PHONE_PLACEHOLDER: "(99) 99999-9999",
    EDUCATION_LABEL: "Escolaridade",
    EDUCATION_PLACEHOLDER: "Selecione sua escolaridade",
    EDUCATION_OPTIONS: [
        { value: "ensino-fundamental", label: "Ensino Fundamental" },
        { value: "ensino-medio", label: "Ensino Médio" },
        { value: "graduacao", label: "Graduação" },
        { value: "pos-graduacao", label: "Pós-Graduação" },
    ],
    PROCEED_BUTTON: "Prosseguir",
    REGISTER_BUTTON: "Cadastrar",
    BACK_BUTTON_LABEL: "Voltar",
    DIVIDER_TEXT: "ou",
    GITHUB_BUTTON_ARIA_LABEL: "Continuar com GitHub",
    GOOGLE_BUTTON_ARIA_LABEL: "Continuar com Google",
};

/**
 * Ações do reducer para a máquina de estados de transição
 * @readonly
 * @enum {string}
 */
const TransitionAction = {
    START: "START",
    EXPAND_END: "EXPAND_END",
    CONTRACT_END: "CONTRACT_END",
};

/**
 * Estado inicial da transição
 * @type {Object}
 */
const initialTransitionState = {
    phase: "idle", // "idle" | "expanding" | "contracting"
    targetStep: null,
};

/**
 * Reducer para a máquina de estados de transição do formulário
 * @param {Object} state - Estado atual
 * @param {Object} action - Ação a ser executada
 * @returns {Object} Novo estado
 */
function transitionReducer(state, action) {
    switch (action.type) {
        case TransitionAction.START:
            if (state.phase !== "idle" || action.payload.nextStep === action.payload.currentStep) {
                return state;
            }
            return {
                phase: "expanding",
                targetStep: action.payload.nextStep,
            };

        case TransitionAction.EXPAND_END:
            if (state.phase === "expanding" && state.targetStep !== null) {
                return {
                    phase: "contracting",
                    targetStep: state.targetStep,
                };
            }
            return state;

        case TransitionAction.CONTRACT_END:
            if (state.phase === "contracting") {
                return {
                    phase: "idle",
                    targetStep: null,
                };
            }
            return state;

        default:
            return state;
    }
}

/**
 * Componente RegisterForm - Formulário de registro em duas etapas com transição animada
 * @component
 * @param {Object} props - Props do componente
 * @param {Function} [props.onSubmit] - Callback chamado ao submeter a etapa 2 com formData completo
 * @param {Function} [props.onGithubClick] - Callback para login com GitHub (TODO(futuro): OAuth)
 * @param {Function} [props.onGoogleClick] - Callback para login com Google (TODO(futuro): OAuth)
 * @returns {JSX.Element}
 */
function RegisterForm({ onSubmit, onGithubClick = () => { /* TODO(futuro): OAuth GitHub */ }, onGoogleClick = () => { /* TODO(futuro): OAuth Google */ } }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        "confirm-password": "",
        "full-name": "",
        cpf: "",
        phone: "",
        education: "",
    });
    const [transitionState, dispatch] = useReducer(transitionReducer, initialTransitionState);

    const { phase: transitionPhase, targetStep } = transitionState;

    /**
     * Atualiza um campo específico do formData
     * @param {string} name - Nome do campo
     * @param {string} value - Valor do campo
     */
    function handleFieldChange(name, value) {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    /**
     * Inicia a transição para a próxima etapa
     * @param {number} nextStep - Índice da próxima etapa
     */
    function startStepTransition(nextStep) {
        dispatch({ type: TransitionAction.START, payload: { nextStep, currentStep } });
    }

    /**
     * Manipula o fim da transição CSS
     * @param {TransitionEvent} event - Evento de transição
     */
    function handleTransitionEnd(event) {
        // Ignora eventos de outros elementos ou propriedades CSS.
        if (
            event.target !== event.currentTarget ||
            event.propertyName !== "clip-path"
        ) {
            return;
        }

        if (transitionPhase === "expanding" && targetStep !== null) {
            // O formulário já está coberto: podemos trocar os campos.
            setCurrentStep(targetStep);
            dispatch({ type: TransitionAction.EXPAND_END });
            return;
        }

        if (transitionPhase === "contracting") {
            // A animação acabou. O formulário está pronto para interação.
            dispatch({ type: TransitionAction.CONTRACT_END });
        }
    }

    /**
     * Manipula o submit do formulário
     * @param {SubmitEvent} event - Evento de submit
     */
    function handleSubmit(event) {
        event.preventDefault();

        if (transitionPhase !== "idle") {
            return;
        }

        if (currentStep === 0) {
            startStepTransition(1);
        } else {
            // TODO(futuro): API call
            onSubmit?.(formData);
        }
    }

    return (
        <form
            className="register-form"
            onSubmit={handleSubmit}
            aria-busy={transitionPhase !== "idle"}
        >
            <div className="register-form__header">
                <h2>{REGISTER_FORM_TEXTS.TITLE}</h2>
                <p>{REGISTER_FORM_TEXTS.STEP_LABEL.replace("{step}", currentStep + 1)}</p>
            </div>

            <div className="register-form__content">
                {/* Etapa 1 */}
                {currentStep === 0 && (
                    <>
                        <div className="register-form__field">
                            <InputField
                                label={REGISTER_FORM_TEXTS.EMAIL_LABEL}
                                name="email"
                                value={formData.email}
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                            />
                        </div>

                        <div className="register-form__field">
                            <PasswordField
                                label={REGISTER_FORM_TEXTS.PASSWORD_LABEL}
                                name="password"
                                value={formData.password}
                                onChange={(e) => handleFieldChange("password", e.target.value)}
                            />
                            <PasswordField
                                label={REGISTER_FORM_TEXTS.CONFIRM_PASSWORD_LABEL}
                                name="confirm-password"
                                value={formData["confirm-password"]}
                                onChange={(e) => handleFieldChange("confirm-password", e.target.value)}
                            />
                        </div>
                    </>
                )}

                {/* Etapa 2 */}
                {currentStep === 1 && (
                    <>
                        <div className="register-form__field">
                            <InputField
                                type="text"
                                label={REGISTER_FORM_TEXTS.FULL_NAME_LABEL}
                                name="full-name"
                                placeholder={REGISTER_FORM_TEXTS.FULL_NAME_PLACEHOLDER}
                                value={formData["full-name"]}
                                onChange={(e) => handleFieldChange("full-name", e.target.value)}
                            />
                        </div>

                        <div className="register-form__field">
                            <InputField
                                type="tel"
                                label={REGISTER_FORM_TEXTS.CPF_LABEL}
                                name="cpf"
                                placeholder={REGISTER_FORM_TEXTS.CPF_PLACEHOLDER}
                                value={formData.cpf}
                                onChange={(e) => handleFieldChange("cpf", e.target.value)}
                            />
                            <InputField
                                type="tel"
                                label={REGISTER_FORM_TEXTS.PHONE_LABEL}
                                name="phone"
                                placeholder={REGISTER_FORM_TEXTS.PHONE_PLACEHOLDER}
                                value={formData.phone}
                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                            />
                        </div>

                        <div className="register-form__field">
                            <SelectField
                                label={REGISTER_FORM_TEXTS.EDUCATION_LABEL}
                                name="education"
                                options={REGISTER_FORM_TEXTS.EDUCATION_OPTIONS}
                                placeholder={REGISTER_FORM_TEXTS.EDUCATION_PLACEHOLDER}
                                value={formData.education}
                                onChange={(value) => handleFieldChange("education", value)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="register-form__footer">
                <div className="register-form__actions">
                    {currentStep === 1 && (
                        <ActionButton
                            className="outline register-form__previous"
                            type="button"
                            onClick={() => startStepTransition(0)}
                            disabled={transitionPhase !== "idle"}
                            aria-label={REGISTER_FORM_TEXTS.BACK_BUTTON_LABEL}
                        >
                            <span className="visually-hidden">{REGISTER_FORM_TEXTS.BACK_BUTTON_LABEL}</span>
                            <span aria-hidden="true">V</span>
                        </ActionButton>
                    )}

                    <ActionButton
                        className="fill"
                        type="submit"
                        disabled={transitionPhase !== "idle"}
                    >
                        {currentStep === 0 ? REGISTER_FORM_TEXTS.PROCEED_BUTTON : REGISTER_FORM_TEXTS.REGISTER_BUTTON}
                    </ActionButton>
                </div>

                {currentStep === 0 && (
                    <>
                        <div className="register-form__divider">
                            <div className="register-form__divider-line"></div>
                            <span>{REGISTER_FORM_TEXTS.DIVIDER_TEXT}</span>
                            <div className="register-form__divider-line"></div>
                        </div>

                        <div className="register-form__actions">
                            <ActionButton
                                className="fill register-form__github-button"
                                type="button"
                                onClick={onGithubClick}
                                aria-label={REGISTER_FORM_TEXTS.GITHUB_BUTTON_ARIA_LABEL}
                            >
                                <GithubIcon size={40} fill="white" aria-hidden="true" />
                            </ActionButton>

                            <ActionButton
                                className="fill register-form__google-button"
                                type="button"
                                onClick={onGoogleClick}
                                aria-label={REGISTER_FORM_TEXTS.GOOGLE_BUTTON_ARIA_LABEL}
                            >
                                <GoogleIcon size={40} aria-hidden="true" />
                            </ActionButton>
                        </div>
                    </>
                )}
            </div>

            {/* Camada da transição circular */}
            <div
                className="register-form__step-transition"
                aria-hidden="true"
            >
                <div
                    className="register-form__step-transition-circle"
                    aria-busy={transitionPhase === "expanding"}
                    onTransitionEnd={handleTransitionEnd}
                />
            </div>
        </form>
    );
}

export default RegisterForm;