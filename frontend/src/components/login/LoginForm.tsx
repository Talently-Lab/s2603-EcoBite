import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { GlobalAlert } from "../ui/GlobalAlert";
import { Input } from "../ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import { loginAccount } from "../../services/auth";

type LoginFields = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFields, string>>;

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: "error" | "info";
  } | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    if (name !== "email" && name !== "password") return;

    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: LoginErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Ingresá tu email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Ingresá un email válido.";
    }

    if (!form.password) {
      nextErrors.password = "Ingresá tu contraseña.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback({
        message: "Revisá los campos marcados e intentá nuevamente.",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await loginAccount({
        email: form.email.trim(),
        contrasena: form.password,
      });
      login(session.token, session.usuario);
      navigate("/");
    } catch (error) {
      setFeedback({
        message:
          error instanceof TypeError
            ? "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo."
            : error instanceof Error
              ? error.message
              : "No se pudo iniciar sesión. Intentá de nuevo.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {feedback && <GlobalAlert {...feedback} />}
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          value={form.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Ingresá tu contraseña"
          value={form.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          errorMessage={errors.password}
        />

        <button
          type="button"
          onClick={() =>
            setFeedback({
              message:
                "La recuperación de contraseña estará disponible próximamente.",
              variant: "info",
            })
          }
          className="w-fit self-end text-sm font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
        >
          ¿Olvidaste tu contraseña?
        </button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-center shadow-sm transition-colors hover:brightness-110"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </>
  );
}
