import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../app/components/ui/Button/ActionButton";
import InputField from "../../../app/components/ui/Field/InputField";
import PasswordField from "../../../app/components/ui/Field/PasswordField";
import { useAuth } from "../../../app/providers/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    try {
      await login({ email, password });
    } catch (requestError) {
      setSubmitError(requestError);
    }
  }

  return (
    <main className="login-page" aria-busy={status === "authenticating"}>
      <header>
        <p>Bem-vindo de volta</p>
        <h1>Entrar</h1>
      </header>
      <form className="login-page__form" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
        />
        <PasswordField
          label="Senha"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
        />
        {(submitError || error) && (
          <p className="login-page__error" role="alert">
            {(submitError || error).message}
          </p>
        )}
        <ActionButton
          type="submit"
          className="fill"
          disabled={status === "authenticating"}
        >
          {status === "authenticating" ? "Entrando..." : "Entrar"}
        </ActionButton>
        <Link className="login-page__register-link" to="/cadastro">
          Ainda não tenho uma conta
        </Link>
      </form>
    </main>
  );
}
