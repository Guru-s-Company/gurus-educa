import "./InputField.css";

function InputField({
    type = "text",
    name,
    placeholder = "Digite aqui",
    label,
}) {
    return (
        <div className="input-field-container">

            <label className="input-field-label" htmlFor={name}>{label}</label>
            <input
                type={type}
                name={name}
                className="input-field"
                placeholder={placeholder}
            />
        </div>
    );
}

export default InputField;