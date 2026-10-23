import "./PasswordField.css";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
    label = "Password",
    placeholder = "Enter your password",
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const id = useId();

    return (
        <div className="password-field-container">
            <label className="password-field-label" htmlFor={id}>
                {label}
            </label>

            <div className="password-field-wrapper">
                <input
                    {...props}
                    id={id}
                    type={showPassword ? "text" : "password"}
                    className="password-field"
                    placeholder={placeholder}
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOff size={20} aria-hidden="true" />
                    ) : (
                        <Eye size={20} aria-hidden="true" />
                    )}
                </button>
            </div>
        </div>
    );
}