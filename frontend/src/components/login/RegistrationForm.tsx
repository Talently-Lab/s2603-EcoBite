import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { GlobalAlert } from "../ui/GlobalAlert";
import { Input } from "../ui/Input";
import {
  registerAccount,
  type RegistrationAccountType,
} from "../../services/auth";

const registrationSchema = z
  .object({
    email: z.string().trim().email("Ingresá un email válido."),
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña."),
    canal_adquisicion: z.string().min(1, "Seleccioná una opción."),
  })
  .refine((data) => data.contrasena === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const accountTypes: { value: RegistrationAccountType; label: string }[] = [
  { value: "cliente", label: "Cliente" },
  { value: "restaurante", label: "Restaurante" },
];

export function RegistrationForm() {
  const [accountType, setAccountType] =
    useState<RegistrationAccountType>("cliente");
  const [isRegistered, setIsRegistered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      contrasena: "",
      confirmPassword: "",
      canal_adquisicion: "",
    },
  });

  async function onSubmit(values: RegistrationFormValues) {
    setSubmitError(null);

    try {
      await registerAccount(accountType, {
        email: values.email,
        contrasena: values.contrasena,
        canal_adquisicion: values.canal_adquisicion,
      });
      setIsRegistered(true);
    } catch (error) {
      setSubmitError(
        error instanceof TypeError
          ? "No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo."
          : error instanceof Error
            ? error.message
            : "No se pudo crear la cuenta. Intentá de nuevo.",
      );
    }
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-5">
        <GlobalAlert
          message="Tu cuenta se creó correctamente. Ya podés iniciar sesión."
          variant="info"
        />
        <Button to="/login" className="w-full text-center">
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="border-0 p-0">
        <legend className="mb-2 block text-xs font-bold text-gray-700">
          Tipo de cuenta
        </legend>
        <div
          className="grid grid-cols-2 rounded-lg bg-gray-100 p-1"
        >
          {accountTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              aria-pressed={accountType === type.value}
              onClick={() => {
                setAccountType(type.value);
                setSubmitError(null);
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                accountType === type.value
                  ? "bg-white text-eco-dark shadow-sm"
                  : "text-gray-600 hover:text-eco-dark"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </fieldset>

      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => setSubmitError(null)}
        noValidate
      >
        {submitError && <GlobalAlert message={submitError} />}

        <Input
          {...register("email")}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          error={Boolean(errors.email)}
          errorMessage={errors.email?.message}
        />
        <Input
          {...register("contrasena")}
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          error={Boolean(errors.contrasena)}
          errorMessage={errors.contrasena?.message}
        />
        <Input
          {...register("confirmPassword")}
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Repetí tu contraseña"
          error={Boolean(errors.confirmPassword)}
          errorMessage={errors.confirmPassword?.message}
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
            {...register("canal_adquisicion")}
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
            <option value="">Seleccioná una opción</option>
            <option value="redes_sociales">Redes sociales</option>
            <option value="recomendacion">Recomendación</option>
            <option value="busqueda_web">Búsqueda en internet</option>
            <option value="otro">Otro</option>
          </select>
          {errors.canal_adquisicion?.message && (
            <span
              id="registration-channel-error"
              className="mt-1 flex items-center gap-1 text-xs text-red-600"
            >
              <span aria-hidden="true">✕</span>
              {errors.canal_adquisicion.message}
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
