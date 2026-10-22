import { useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { GlobalAlert } from "../ui/GlobalAlert";
import { Input } from "../ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import {
  createClientProfile,
  createRestaurantProfile,
  loginAccount,
  registerAccount,
  type RegistrationAccountType,
} from "../../services/auth";

const registrationFields = z.object({
    email: z
      .string()
      .trim()
      .email("Ingresá un email válido, por ejemplo ana@correo.com."),
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña."),
    canal_adquisicion: z.string().min(1, "Elegí una opción."),
    termsAccepted: z.boolean(),
  });

const registrationSchema = registrationFields
  .extend({
    nombre: z.string().trim().min(1, "Ingresá tu nombre."),
    apellido: z.string().trim().min(1, "Ingresá tu apellido."),
  })
  .refine((data) => data.contrasena === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted, {
    message: "Aceptá los términos y condiciones para continuar.",
    path: ["termsAccepted"],
  });

const restaurantRegistrationSchema = registrationFields
  .extend({
    nombre: z.string().trim().min(1, "Ingresá el nombre del local."),
    cuit: z.string().trim().superRefine((value, context) => {
      if (!value) {
        context.addIssue({ code: "custom", message: "Ingresá un CUIT válido: 11 números, por ejemplo:\n30-12345678-9." });
      } else if (!/^\d{2}-?\d{8}-?\d$/.test(value)) {
        context.addIssue({ code: "custom", message: "Ingresá un CUIT válido: 11 números, por ejemplo:\n30-12345678-9." });
      }
    }),
    categoria: z.string().trim().min(1, "Elegí una categoría."),
  })
  .refine((data) => data.contrasena === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted, {
    message: "Aceptá los términos y condiciones para continuar.",
    path: ["termsAccepted"],
  });

type RegistrationFormValues = z.infer<typeof registrationFields> & {
  nombre: string;
  apellido: string;
  cuit: string;
  categoria: string;
};

const accountTypes: { value: RegistrationAccountType; label: string }[] = [
  { value: "cliente", label: "Soy cliente" },
  { value: "restaurante", label: "Soy restaurante" },
];

export function RegistrationForm() {
  const { login } = useAuth();
  const [accountType, setAccountType] =
    useState<RegistrationAccountType>("cliente");
  const [form, setForm] = useState<RegistrationFormValues>({
    email: "",
    contrasena: "",
    confirmPassword: "",
    canal_adquisicion: "",
    termsAccepted: false,
    nombre: "",
    apellido: "",
    cuit: "",
    categoria: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormValues, string>>>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    if (!(name in form)) return;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const result = (accountType === "restaurante"
      ? restaurantRegistrationSchema
      : registrationSchema
    ).safeParse(form);

    if (!result.success) {
      const nextErrors: Partial<Record<keyof RegistrationFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in form) {
          nextErrors[field as keyof RegistrationFormValues] = issue.message;
        }
      }
      setErrors(nextErrors);
      setSubmitError("Revisá los campos marcados para poder crear tu cuenta.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const registrationData = result.data as RegistrationFormValues;
      await registerAccount(accountType, {
        email: result.data.email,
        contrasena: result.data.contrasena,
        canal_adquisicion: result.data.canal_adquisicion,
      });
      const session = await loginAccount({
        email: registrationData.email,
        contrasena: registrationData.contrasena,
      });

      let clientName: string | null = null;
      if (accountType === "restaurante") {
        await createRestaurantProfile(session.token, {
          nombre: registrationData.nombre,
          cuit: registrationData.cuit,
          categoria: registrationData.categoria,
        });
      } else {
        const clientProfile = await createClientProfile(session.token, {
          nombre: registrationData.nombre,
          apellido: registrationData.apellido,
        });
        clientName = `${clientProfile.nombre} ${clientProfile.apellido}`;
      }

      login(
        session.token,
        clientName
          ? {
              ...session.usuario,
              nombre: clientName,
            }
          : session.usuario,
      );
      setIsRegistered(true);
    } catch (error) {
      if (
        error instanceof Error &&
        "status" in error &&
        error.status === 409
      ) {
        setErrors((current) => ({
          ...current,
          email: error.message,
        }));
      } else if (
        accountType === "restaurante" &&
        error instanceof Error &&
        /cuit.*registrad/i.test(error.message)
      ) {
        setErrors((current) => ({
          ...current,
          cuit: "Ese CUIT ya está registrado. Revisá el número o iniciá sesión.",
        }));
      } else {
        setSubmitError(
          error instanceof TypeError
            ? "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo."
            : error instanceof Error
              ? error.message
              : "No se pudo crear la cuenta. Intentá de nuevo.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-5">
        <GlobalAlert
          message={
            accountType === "restaurante"
              ? "Tu cuenta y el perfil del restaurante se crearon correctamente."
              : "Tu cuenta y el perfil de cliente se crearon correctamente."
          }
          variant="info"
        />
        <Button
          to="/"
          className="w-full text-center"
        >
          Ir al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {submitError && <GlobalAlert message={submitError} />}
      <fieldset className="border-0 p-0">
        <legend className="mb-2 block text-xs font-bold text-gray-700">
          Quiero registrarme como
        </legend>
        <div
          className="grid grid-cols-2 gap-2 rounded-lg bg-transparent p-1"
        >
          {accountTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              disabled={isSubmitting}
              aria-pressed={accountType === type.value}
              onClick={() => {
                setAccountType(type.value);
                setSubmitError(null);
              }}
              className={`cursor-pointer rounded-full px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                accountType === type.value
                  ? "bg-eco-dark text-white shadow-sm"
                  : "bg-eco-light/50 text-eco-dark hover:text-eco-dark"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>

      <form
        className="flex flex-col gap-5"
        onSubmit={onSubmit}
        noValidate
      >
        {accountType === "restaurante" && (
          <>
            <Input
              label="Nombre del local"
              name="nombre"
              type="text"
              autoComplete="organization"
              placeholder="Nombre del local"
              value={form.nombre}
              onChange={handleChange}
              error={Boolean(errors.nombre)}
              errorMessage={errors.nombre}
            />
            <Input
              label="CUIT"
              name="cuit"
              type="text"
              inputMode="numeric"
              placeholder="30-12345678-9"
              value={form.cuit}
              onChange={handleChange}
              error={Boolean(errors.cuit)}
              errorMessage={errors.cuit}
            />
            <Input
              label="Categoría"
              name="categoria"
              type="text"
              placeholder="Cocina natural"
              value={form.categoria}
              onChange={handleChange}
              error={Boolean(errors.categoria)}
              errorMessage={errors.categoria}
            />
          </>
        )}

        {accountType === "cliente" && (
          <>
            <Input
              label="Nombre"
              name="nombre"
              type="text"
              autoComplete="given-name"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              error={Boolean(errors.nombre)}
              errorMessage={errors.nombre}
            />
            <Input
              label="Apellido"
              name="apellido"
              type="text"
              autoComplete="family-name"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              error={Boolean(errors.apellido)}
              errorMessage={errors.apellido}
            />
          </>
        )}

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
          name="contrasena"
          type="password"
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          value={form.contrasena}
          onChange={handleChange}
          error={Boolean(errors.contrasena)}
          errorMessage={errors.contrasena}
        />
        <Input
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repetí tu contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          error={Boolean(errors.confirmPassword)}
          errorMessage={errors.confirmPassword}
        />

        <div className="flex w-full flex-col font-sans text-sm">
          <label
            htmlFor="registration-channel"
            className="mb-1 text-xs font-bold text-gray-700"
          >
            ¿Cómo nos conociste?
          </label>
          <select
            id="registration-channel"
            name="canal_adquisicion"
            value={form.canal_adquisicion}
            onChange={handleChange}
            aria-invalid={Boolean(errors.canal_adquisicion) || undefined}
            aria-describedby={
              errors.canal_adquisicion
                ? "registration-channel-error"
                : undefined
            }
            className={`rounded-lg border bg-white px-3 py-2 text-gray-800 outline-none focus:border-eco-dark ${
              errors.canal_adquisicion ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Elegí una opción</option>
            <option value="redes_sociales">Redes sociales</option>
            <option value="recomendacion">Recomendación</option>
            <option value="busqueda_web">Búsqueda en internet</option>
            <option value="otro">Otro</option>
          </select>
          {errors.canal_adquisicion && (
            <span
              id="registration-channel-error"
              className="mt-1 flex items-center gap-1 text-xs text-red-600"
            >
              <span aria-hidden="true">✕</span>
              {errors.canal_adquisicion}
            </span>
          )}
        </div>

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              aria-invalid={Boolean(errors.termsAccepted) || undefined}
              aria-describedby={errors.termsAccepted ? "terms-error" : undefined}
              onChange={(event) => {
                const termsAccepted = event.currentTarget.checked;
                setForm((current) => ({ ...current, termsAccepted }));
                setErrors((current) => ({ ...current, termsAccepted: undefined }));
                setSubmitError(null);
              }}
              className="h-4 w-4 accent-eco-dark"
            />
            <span>Acepto los términos y condiciones</span>
          </label>
          {errors.termsAccepted && (
            <span id="terms-error" className="mt-1 flex items-center gap-1 text-xs text-red-600">
              <span aria-hidden="true">✕</span>
              {errors.termsAccepted}
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-center shadow-sm transition-colors hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
      <p className="m-0 text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
