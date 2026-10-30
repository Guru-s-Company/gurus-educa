import { useState } from "react";

import "./RegisterForm.css";

import PasswordField from "../Field/PasswordField.jsx";
import InputField from "../Field/InputField.jsx";
import SelectField from "../Field/SelectField.jsx";
import ActionButton from "../Button/ActionButton.jsx";

import { GithubIcon, GoogleIcon } from "../Icon/Icon.jsx";

function RegisterForm() {
    const [currentStep, setCurrentStep] = useState(0);

    // idle -> expanding -> contracting -> idle
    const [transitionPhase, setTransitionPhase] = useState("idle");
    const [targetStep, setTargetStep] = useState(null);

    function startStepTransition(nextStep) {
        if (transitionPhase !== "idle" || nextStep === currentStep) {
            return;
        }

        setTargetStep(nextStep);
        setTransitionPhase("expanding");
    }

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
            setTransitionPhase("contracting");
            return;
        }

        if (transitionPhase === "contracting") {
            // A animação acabou. O formulário está pronto para interação.
            setTransitionPhase("idle");
            setTargetStep(null);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (transitionPhase !== "idle") {
            return;
        }

        if (currentStep === 0) {
            startStepTransition(1);
        } else {
            alert("Testando o currentStep");
        }
    }

    return (
        <form
            className="register-form"
            onSubmit={handleSubmit}
            aria-busy={transitionPhase !== "idle"}
        >
            <div className="form-header">
                <h2>Cadastro</h2>
                <p>Etapa {currentStep + 1} de 2</p>
            </div>

            <div className="form-content">
                {/* Etapa 1 */}
                {currentStep === 0 && (
                    <>
                        <div className="form-field">
                            <InputField
                                label="Email"
                                name="email"
                            />
                        </div>

                        <div className="form-field">
                            <PasswordField
                                label="Senha"
                                name="password"
                            />
                            <PasswordField
                                label="Confirmar senha"
                                name="confirm-password"
                            />
                        </div>
                    </>
                )}

                {/* Etapa 2 */}
                {currentStep === 1 && (
                    <>
                        <div className="form-field">
                            <InputField
                                type="text"
                                label="Nome Completo"
                                name="full-name"
                                placeholder="Cleiton Guru da Silva"
                            />
                        </div>

                        <div className="form-field">
                            <InputField
                                type="tel"
                                label="CPF (Somente números)"
                                name="cpf"
                                placeholder="Digite seu CPF"
                            />
                            <InputField
                                type="tel"
                                label="Celular (Somente números)"
                                name="phone"
                                placeholder="(99) 99999-9999"
                            />
                        </div>

                        <div className="form-field">
                            <SelectField
                                label="Escolaridade"
                                name="education"
                                options={[
                                    {
                                        value: "ensino-fundamental",
                                        label: "Ensino Fundamental",
                                    },
                                    {
                                        value: "ensino-medio",
                                        label: "Ensino Médio",
                                    },
                                    {
                                        value: "graduacao",
                                        label: "Graduação",
                                    },
                                    {
                                        value: "pos-graduacao",
                                        label: "Pós-Graduação",
                                    },
                                ]}
                                placeholder="Selecione sua escolaridade"
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="form-footer">
                <div className="form-actions">
                    {currentStep === 1 && (
                        <ActionButton
                            className="outline previous"
                            type="button"
                            onClick={() => startStepTransition(0)}
                            disabled={transitionPhase !== "idle"}
                        >
                            V
                        </ActionButton>
                    )}

                    <ActionButton
                        className="fill"
                        type="submit"
                        disabled={transitionPhase !== "idle"}
                    >
                        {currentStep === 0 ? "Prosseguir" : "Cadastrar"}
                    </ActionButton>
                </div>

                {currentStep === 0 && (
                    <>
                        <div className="form-divider">
                            <div className="divider-line"></div>
                            <span>ou</span>
                            <div className="divider-line"></div>
                        </div>

                        <div className="form-actions">
                            <ActionButton
                                className="fill github-button"
                                type="button"
                            >
                                <GithubIcon size={40} fill="white" />
                            </ActionButton>

                            <ActionButton
                                className="fill google-button"
                                type="button"
                            >
                                <GoogleIcon size={40} />
                            </ActionButton>
                        </div>
                    </>
                )}
            </div>

            {/* Camada da transição circular */}
                <div
                    className="step-transition"
                    aria-hidden="true"
                >
                    <div
                        className={`step-transition__circle ${
                            transitionPhase === "expanding"
                                ? "is-expanding"
                                : ""
                        }`}
                        onTransitionEnd={handleTransitionEnd}
                    />
</div>
        </form>
    );
}

export default RegisterForm;