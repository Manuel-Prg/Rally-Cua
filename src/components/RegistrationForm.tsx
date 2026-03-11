// src/components/RegistrationForm.tsx
import { useState } from "react";

interface FormData {
    team_name: string;
    representative: string;
    phone: string;
    email: string;
    members: string;
    how_heard: string;
    institution: string;
    experience: string;
    special_needs: string;
    comments: string;
}

const EMPTY: FormData = {
    team_name: "",
    representative: "",
    phone: "",
    email: "",
    members: "",
    how_heard: "",
    institution: "",
    experience: "",
    special_needs: "",
    comments: "",
};

const REQUIRED_FIELDS: (keyof FormData)[] = [
    "team_name",
    "representative",
    "phone",
    "email",
    "members",
    "how_heard",
    "institution",
    "experience",
    "special_needs",
];

export default function RegistrationForm() {
    const [form, setForm] = useState<FormData>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState("");

    const labels: Record<keyof FormData, string> = {
        team_name: "Nombre del equipo",
        representative: "Nombre del representante",
        phone: "Número de teléfono",
        email: "Correo electrónico",
        members: "Nombres completos de los integrantes (comenzando por el representante)",
        how_heard: "¿Cómo se enteraron de este rally?",
        institution: "Institución educativa o procedencia",
        experience: "¿Tienen experiencia en rallies o actividades similares? ¿Cuáles?",
        special_needs: "¿Cuentan con algún impedimento físico o requerimiento especial? ¿Cuál?",
        comments: "Comentarios o dudas adicionales",
    };

    const multiline: (keyof FormData)[] = ["members", "how_heard", "experience", "special_needs", "comments"];

    function validate(): boolean {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        for (const field of REQUIRED_FIELDS) {
            if (!form[field].trim()) {
                newErrors[field] = "Este campo es obligatorio.";
            }
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Ingresa un correo válido.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setStatus("loading");
        setServerError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setServerError(data.error ?? "Error al enviar. Intenta de nuevo.");
                setStatus("error");
            } else {
                setStatus("success");
            }
        } catch {
            setServerError("No se pudo conectar con el servidor. Intenta de nuevo.");
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <div className="success-card">
                <div className="success-icon">💧</div>
                <h2 className="success-title">¡Inscripción recibida!</h2>
                <p className="success-text">
                    El equipo <strong>"{form.team_name}"</strong> ha sido registrado exitosamente para el
                    Rally del Ciclo del Agua.<br />
                    Estaremos en contacto al correo <strong>{form.email}</strong>.
                </p>
                <p className="success-sub">
                    Sábado 21 de marzo · 9:00 AM<br />
                    Juntos hacemos que cada gota cuente. 🌊
                </p>

                <style>{`
          .success-card {
            text-align: center;
            padding: 3rem 2rem;
            background: rgba(74, 92, 58, 0.15);
            border: 2px solid var(--moss-light);
            border-radius: 16px;
            max-width: 560px;
            margin: 0 auto;
            animation: fadeUp 0.5s ease;
          }
          .success-icon { font-size: 3.5rem; margin-bottom: 1rem; }
          .success-title {
            font-family: var(--font-archer);
            font-size: 2.2rem;
            letter-spacing: 0.08em;
            color: var(--moss-light);
            margin-bottom: 1rem;
          }
          .success-text {
            font-size: 1rem;
            line-height: 1.7;
            color: var(--fog);
            margin-bottom: 1.4rem;
          }
          .success-sub {
            font-family: var(--font-archer);
            font-size: 0.9rem;
            letter-spacing: 0.08em;
            color: var(--dirt);
            text-transform: uppercase;
            line-height: 1.8;
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="reg-form">
            {(Object.keys(labels) as (keyof FormData)[]).map((field) => {
                const isRequired = REQUIRED_FIELDS.includes(field);
                const isTextarea = multiline.includes(field);
                const error = errors[field];

                return (
                    <div key={field} className="field-group">
                        <label htmlFor={field} className="field-label">
                            {labels[field]}
                            {isRequired && <span className="required-star" aria-hidden="true"> *</span>}
                        </label>

                        {isTextarea ? (
                            <textarea
                                id={field}
                                name={field}
                                value={form[field]}
                                onChange={handleChange}
                                rows={field === "members" ? 5 : 3}
                                className={`field-input field-textarea${error ? " field-error" : ""}`}
                                aria-required={isRequired}
                                aria-describedby={error ? `${field}-err` : undefined}
                            />
                        ) : (
                            <input
                                id={field}
                                name={field}
                                type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                                value={form[field]}
                                onChange={handleChange}
                                className={`field-input${error ? " field-error" : ""}`}
                                aria-required={isRequired}
                                aria-describedby={error ? `${field}-err` : undefined}
                            />
                        )}

                        {error && (
                            <span id={`${field}-err`} className="error-msg" role="alert">
                                {error}
                            </span>
                        )}
                    </div>
                );
            })}

            {status === "error" && serverError && (
                <div className="server-error" role="alert">
                    ⚠️ {serverError}
                </div>
            )}

            <button type="submit" className="submit-btn" disabled={status === "loading"}>
                {status === "loading" ? (
                    <span className="btn-loading">
                        <span className="spinner" />
                        Enviando…
                    </span>
                ) : (
                    "¡Inscribir equipo! 💧"
                )}
            </button>

            <style>{`
        .reg-form {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .field-label {
          font-family: var(--font-archer);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dirt);
        }
        .required-star { color: var(--rust); }
        .field-input {
          background: rgba(42, 30, 21, 0.6);
          border: 1.5px solid rgba(196, 163, 90, 0.25);
          border-radius: 8px;
          padding: 0.7rem 1rem;
          color: var(--ash);
          font-family: var(--font-archer);
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
          resize: vertical;
        }
        .field-input::placeholder { color: rgba(210, 197, 176, 0.35); }
        .field-input:focus {
          border-color: var(--dirt);
          box-shadow: 0 0 0 3px rgba(196, 163, 90, 0.15);
        }
        .field-input.field-error {
          border-color: var(--rust);
          box-shadow: 0 0 0 3px rgba(184, 74, 30, 0.15);
        }
        .field-textarea { font-family: var(--font-archer); }
        .error-msg {
          font-size: 0.78rem;
          color: #e07b5f;
          font-family: var(--font-archer);
        }
        .server-error {
          background: rgba(184, 74, 30, 0.12);
          border: 1px solid rgba(184, 74, 30, 0.4);
          border-radius: 8px;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
          color: #e07b5f;
        }
        .submit-btn {
          margin-top: 0.5rem;
          padding: 0.9rem 2rem;
          background: linear-gradient(135deg, var(--dirt-dark), var(--dirt));
          color: var(--ink);
          font-family: var(--font-archer);
          font-size: 1.15rem;
          letter-spacing: 0.12em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(196, 163, 90, 0.25);
          align-self: flex-start;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(196, 163, 90, 0.35);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-loading { display: flex; align-items: center; gap: 0.6rem; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(26,18,8,0.3);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </form>
    );
}
