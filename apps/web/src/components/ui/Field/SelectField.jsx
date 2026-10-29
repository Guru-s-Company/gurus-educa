import "./SelectField.css";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SelectField({
    label = "Select",
    placeholder = "Select an option",
    options = [],
    value,
    defaultValue = "",
    onChange,
    name,
    disabled = false,
    ...props
}) {
    const id = useId();
    const labelId = `${id}-label`;
    const listId = `${id}-listbox`;

    // controlado (value) ou não controlado (defaultValue)
    const isControlled = value !== undefined;
    const [innerValue, setInnerValue] = useState(defaultValue);
    const current = isControlled ? value : innerValue;

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);

    const selectedIndex = options.findIndex((o) => o.value === current);
    const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

    // próximo índice habilitado (circular) na direção dir (1 ou -1)
    function nextEnabled(from, dir) {
        const len = options.length;
        let i = from < 0 ? (dir > 0 ? -1 : 0) : from;
        for (let n = 0; n < len; n++) {
            i = (i + dir + len) % len;
            if (!options[i].disabled) return i;
        }
        return -1;
    }

    function openMenu() {
        if (disabled) return;
        setOpen(true);
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : nextEnabled(-1, 1));
    }

    function closeMenu() {
        setOpen(false);
    }

    function commit(option) {
        if (!option || option.disabled) return;
        if (!isControlled) setInnerValue(option.value);
        onChange?.(option.value, option);
        closeMenu();
        triggerRef.current?.focus();
    }

    // fecha ao clicar fora
    useEffect(() => {
        if (!open) return;

        function handlePointerDown(e) {
            if (!containerRef.current?.contains(e.target)) closeMenu();
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [open]);

    // mantém a opção ativa visível ao navegar pelo teclado
    useEffect(() => {
        if (!open || activeIndex < 0) return;
        listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    function handleKeyDown(e) {
        if (disabled) return;

        switch (e.key) {
            case "ArrowDown":
            case "ArrowUp": {
                e.preventDefault();
                if (!open) openMenu();
                else setActiveIndex((i) => nextEnabled(i, e.key === "ArrowDown" ? 1 : -1));
                break;
            }
            case "Home":
            case "End": {
                if (!open) return;
                e.preventDefault();
                setActiveIndex(e.key === "Home" ? nextEnabled(-1, 1) : nextEnabled(0, -1));
                break;
            }
            case "Enter":
            case " ": {
                e.preventDefault();
                if (!open) openMenu();
                else commit(options[activeIndex]);
                break;
            }
            case "Escape": {
                if (!open) return;
                e.preventDefault();
                closeMenu();
                break;
            }
            case "Tab": {
                closeMenu();
                break;
            }
            default: {
                // type-ahead: pula para a próxima opção que começa com a letra digitada
                if (e.key.length === 1 && /\S/.test(e.key)) {
                    const k = e.key.toLowerCase();
                    for (let n = 1; n <= options.length; n++) {
                        const i = (activeIndex + n + options.length) % options.length;
                        const opt = options[i];
                        if (!opt.disabled && String(opt.label).toLowerCase().startsWith(k)) {
                            if (!open) openMenu();
                            setActiveIndex(i);
                            break;
                        }
                    }
                }
            }
        }
    }

    return (
        <div className="select-field-container" ref={containerRef}>
            <label className="select-field-label" id={labelId} htmlFor={id}>
                {label}
            </label>

            <div className="select-field-wrapper">
                <button
                    {...props}
                    ref={triggerRef}
                    id={id}
                    type="button"
                    role="combobox"
                    className="select-field"
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-labelledby={`${labelId} ${id}`}
                    aria-activedescendant={
                        open && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined
                    }
                    onClick={() => (open ? closeMenu() : openMenu())}
                    onKeyDown={handleKeyDown}
                >
                    <span className={`select-field-value${selected ? "" : " is-placeholder"}`}>
                        {selected ? selected.label : placeholder}
                    </span>

                    <ChevronDown className="select-field-icon" size={20} aria-hidden="true" />
                </button>

                {/* tooltip: carrega animação, borda, sombra e a setinha */}
                <div
                    className={`select-menu${open ? " is-open" : ""}`}
                    // evita que o clique no menu tire o foco do botão
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        tabIndex={-1}
                        className="select-list"
                        aria-labelledby={labelId}
                    >
                        {options.map((opt, i) => {
                            const isSelected = i === selectedIndex;
                            const isActive = i === activeIndex;

                            return (
                                <li
                                    key={opt.value}
                                    id={`${id}-opt-${i}`}
                                    role="option"
                                    className={
                                        "select-option" +
                                        (isSelected ? " is-selected" : "") +
                                        (isActive ? " is-active" : "")
                                    }
                                    aria-selected={isSelected}
                                    aria-disabled={opt.disabled || undefined}
                                    onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                                    onClick={() => commit(opt)}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={16} aria-hidden="true" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {name && <input type="hidden" name={name} value={current ?? ""} />}
        </div>
    );
}