import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../../../app/components/ui/Form/RegisterForm";
import { useAuth } from "../../../app/providers/AuthContext";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, status, error, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(formData) {
    setSubmitError(null);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData["full-name"],
        cpf: formData.cpf,
        phone: formData.phone,
        education: formData.education,
      });
    } catch (requestError) {
      setSubmitError(requestError);
    }
  }

  return (
    <main className="register-page" aria-busy={status === "authenticating"}>
      <RegisterForm onSubmit={handleSubmit} />
      {(submitError || error) && (
        <p className="register-page__error" role="alert">
          {(submitError || error).message}
        </p>
      )}
      <Link className="register-page__login-link" to="/login">
        Já tenho uma conta
      </Link>
    </main>
  );
}
