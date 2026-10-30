import { useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { GlobalAlert } from "../ui/GlobalAlert";
import { Input } from "../ui/Input";
import { HeroTitle } from "../ui/HeroTitle";
import { Arrow } from "../ui/ArrowButton";
import { RestaurantImagePicker } from "./RestaurantImagePicker";
import { useAuth } from "../../contexts/AuthContext";
import {
  createClientProfile,
  createRestaurantProfile,
  registerAccount,
  uploadRestaurantImage,
  type RegistrationAccountType,
  type LoginResponse,
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

const accountStepSchema = registrationFields
  .refine((data) => data.contrasena === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted, {
    message: "Aceptá los términos y condiciones para continuar.",
    path: ["termsAccepted"],
  });

const registrationSchema = registrationFields
  .extend({
    nombre: z
      .string()
      .trim()
      .min(1, "Ingresá tu nombre.")
      .refine((value) => !/\d/.test(value), {
        message: "El nombre no puede tener números.",
      }),
    apellido: z
      .string()
      .trim()
      .min(1, "Ingresá tu apellido.")
      .refine((value) => !/\d/.test(value), {
        message: "El apellido no puede tener números.",
      }),
    telefono: z
      .string()
      .trim()
      .min(1, "Ingresá tu teléfono.")
      .refine((value) => /^(?=.*\d)[\d+()\s-]+$/.test(value), {
        message: "El teléfono no puede contener letras.",
      }),
    direccion: z.string().trim().min(1, "Ingresá tu calle y número."),
    piso: z.string().regex(/^\d*$/, "El piso solo puede contener números."),
    departamento: z
      .string()
      .regex(/^\d*$/, "El departamento solo puede contener números."),
    ciudad: z.string().trim().min(1, "Ingresá tu ciudad."),
    id_zona: z.string().min(1, "Elegí tu zona de domicilio."),
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
  telefono: string;
  direccion: string;
  piso: string;
  departamento: string;
  ciudad: string;
  id_zona: string;
};

const accountTypes: { value: RegistrationAccountType; label: string }[] = [
  { value: "cliente", label: "Soy cliente" },
  { value: "restaurante", label: "Soy restaurante" },
];

const residentialZones = [
  { id: "1", label: "Centro" },
  { id: "2", label: "Norte" },
  { id: "3", label: "Sur" },
  { id: "4", label: "Este" },
  { id: "5", label: "Oeste" },
];

const existingClientAccountMessage =
  "No pudimos guardar tu perfil. Tu cuenta ya está creada: revisá el campo marcado y probá de nuevo.";

interface RegistrationFormProps {
  onStepChange: (step: 1 | 2) => void;
}

export function RegistrationForm({ onStepChange }: RegistrationFormProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
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
    telefono: "",
    direccion: "",
    piso: "",
    departamento: "",
    ciudad: "",
    id_zona: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormValues, string>>>({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingRestaurantSession, setPendingRestaurantSession] =
    useState<LoginResponse | null>(null);
  const [pendingClientSession, setPendingClientSession] =
    useState<LoginResponse | null>(null);
  const [restaurantImage, setRestaurantImage] = useState<File | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<number | null>(
    null,
  );
  const [createdRestaurantToken, setCreatedRestaurantToken] = useState<
    string | null
  >(null);
  const [isRetryingImage, setIsRetryingImage] = useState(false);

  function changeStep(nextStep: 1 | 2) {
    setStep(nextStep);
    onStepChange(nextStep);
  }

  async function retryRestaurantImageUpload() {
    if (!restaurantImage || !createdRestaurantId || !createdRestaurantToken) {
      return;
    }

    setIsRetryingImage(true);
    setImageUploadError(null);
    try {
      await uploadRestaurantImage(
        createdRestaurantToken,
        createdRestaurantId,
        restaurantImage,
      );
    } catch (error) {
      setImageUploadError(
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
    } finally {
      setIsRetryingImage(false);
    }
  }

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

    if (step === 1) {
      const accountResult = accountStepSchema.safeParse(form);
      if (!accountResult.success) {
        const nextErrors: Partial<Record<keyof RegistrationFormValues, string>> = {};
        for (const issue of accountResult.error.issues) {
          const field = issue.path[0];
          if (typeof field === "string" && field in form) {
            nextErrors[field as keyof RegistrationFormValues] = issue.message;
          }
        }
        setErrors(nextErrors);
        setSubmitError("Revisá los campos marcados para continuar.");
        return;
      }

      setErrors({});
      changeStep(2);
      return;
    }

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
      setSubmitError(
        pendingClientSession
          ? existingClientAccountMessage
          : "Revisá los campos marcados para poder crear tu cuenta.",
      );
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let clientAccountCreated = pendingClientSession !== null;
    try {
      const registrationData = result.data as RegistrationFormValues;
      const pendingSession =
        accountType === "restaurante"
          ? pendingRestaurantSession
          : pendingClientSession;
      const isCompletingProfile = pendingSession !== null;
      const session =
        pendingSession ??
        (await registerAccount(accountType, {
          email: result.data.email,
          contrasena: result.data.contrasena,
          canal_adquisicion: result.data.canal_adquisicion,
        }));

      if (!isCompletingProfile) {
        login(session.token, session.usuario);
        if (accountType === "restaurante") {
          setPendingRestaurantSession(session);
        } else {
          clientAccountCreated = true;
          setPendingClientSession(session);
        }
      }

      let clientName: string | null = null;
      if (accountType === "restaurante") {
        const restaurantId = await createRestaurantProfile(session.token, {
          nombre: registrationData.nombre,
          cuit: registrationData.cuit,
          categoria: registrationData.categoria,
        });
        setPendingRestaurantSession(null);
        setCreatedRestaurantId(restaurantId);
        setCreatedRestaurantToken(session.token);

        if (restaurantImage) {
          try {
            await uploadRestaurantImage(
              session.token,
              restaurantId,
              restaurantImage,
            );
          } catch (error) {
            setImageUploadError(
              error instanceof Error ? error.message : "No se pudo subir la imagen.",
            );
          }
        }
      } else {
        const clientProfile = await createClientProfile(session.token, {
          nombre: registrationData.nombre,
          apellido: registrationData.apellido,
          telefono: registrationData.telefono,
          direccion: registrationData.direccion,
          piso: registrationData.piso || null,
          departamento: registrationData.departamento || null,
          ciudad: registrationData.ciudad,
          id_zona: Number(registrationData.id_zona),
        });
        setPendingClientSession(null);
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
      if (accountType === "cliente" && clientAccountCreated) {
        setSubmitError(existingClientAccountMessage);
      } else if (
        error instanceof Error &&
        "status" in error &&
        error.status === 409
      ) {
        setErrors((current) => ({
          ...current,
          email: error.message,
        }));
        setSubmitError(
          "No pudimos crear la cuenta: ese email ya está registrado. Revisá el campo marcado o iniciá sesión.",
        );
        changeStep(1);
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
        {imageUploadError && (
          <>
            <GlobalAlert
              message={`El perfil se creó, pero no se pudo subir la imagen: ${imageUploadError}`}
            />
            <Button
              type="button"
              onClick={retryRestaurantImageUpload}
              disabled={isRetryingImage}
              className="w-full text-center disabled:cursor-wait disabled:opacity-60"
            >
              {isRetryingImage ? "Subiendo imagen..." : "Reintentar imagen"}
            </Button>
          </>
        )}
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
      {step === 2 && (
        <HeroTitle className="!text-2xl !leading-tight">
          Completa tu perfil
        </HeroTitle>
      )}
      {submitError && <GlobalAlert message={submitError} />}
      {pendingRestaurantSession && (
        <GlobalAlert
          variant="info"
          message="La cuenta ya está creada. Corregí los datos del perfil y continuá; no volveremos a registrar el email."
        />
      )}
      {step === 1 && <fieldset className="border-0 p-0">
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
              disabled={
                isSubmitting ||
                ((pendingRestaurantSession !== null || pendingClientSession !== null) &&
                  type.value !== accountType)
              }
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
      </fieldset>}

      <form
        className="flex flex-col gap-5"
        onSubmit={onSubmit}
        noValidate
      >
        {step === 2 && accountType === "restaurante" && (
          <>
            <Input
              label="Nombre del local"
              name="nombre"
              type="text"
              autoComplete="organization"
              placeholder="Nombre del local"
              value={form.nombre}
              onChange={handleChange}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              error={Boolean(errors.categoria)}
              errorMessage={errors.categoria}
            />
          </>
        )}

        {step === 2 && accountType === "cliente" && (
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
            <Input
              label="Teléfono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.telefono)}
              errorMessage={errors.telefono}
            />
            <Input
              label="Dirección"
              name="direccion"
              type="text"
              autoComplete="street-address"
              placeholder="Calle y número"
              value={form.direccion}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.direccion)}
              errorMessage={errors.direccion}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Piso (opcional)"
                name="piso"
                type="text"
                placeholder="Ej.: 2"
                value={form.piso}
                onChange={handleChange}
                disabled={isSubmitting}
                error={Boolean(errors.piso)}
                errorMessage={errors.piso}
              />
              <Input
                label="Depto. (opcional)"
                name="departamento"
                type="text"
                placeholder="Ej.: 3"
                value={form.departamento}
                onChange={handleChange}
                disabled={isSubmitting}
                error={Boolean(errors.departamento)}
                errorMessage={errors.departamento}
              />
            </div>
            <Input
              label="Ciudad"
              name="ciudad"
              type="text"
              autoComplete="address-level2"
              placeholder="Tu ciudad"
              value={form.ciudad}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.ciudad)}
              errorMessage={errors.ciudad}
            />
            <div className="flex w-full flex-col font-sans text-sm">
              <label
                htmlFor="client-zone"
                className="mb-1 text-xs font-bold text-gray-700"
              >
                Zona de domicilio
              </label>
              <div
                className={`rounded-lg border px-3 py-2 transition-all focus-within:border-2 focus-within:border-eco-dark ${
                  errors.id_zona ? "border-red-500" : "border-gray-300"
                }`}
              >
                <select
                  id="client-zone"
                  name="id_zona"
                  value={form.id_zona}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.id_zona) || undefined}
                  aria-describedby={errors.id_zona ? "client-zone-error" : undefined}
                  className="w-full bg-transparent text-gray-800 outline-none"
                >
                  <option value="">Elegí tu zona</option>
                  {residentialZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_zona && (
                <span
                  id="client-zone-error"
                  className="mt-1 flex items-center gap-1 text-xs text-red-600"
                >
                  <span aria-hidden="true">✕</span>
                  {errors.id_zona}
                </span>
              )}
            </div>
          </>
        )}

        {step === 1 && <>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
          value={form.email}
          onChange={handleChange}
          disabled={isSubmitting || pendingRestaurantSession !== null || pendingClientSession !== null}
          error={Boolean(errors.email)}
          errorMessage={errors.email}
        />
        <Input
          label="Contraseña"
          name="contrasena"
          type="password"
          autoComplete="new-password"
          placeholder="mínimo 8 caracteres"
          value={form.contrasena}
          onChange={handleChange}
          disabled={isSubmitting || pendingRestaurantSession !== null || pendingClientSession !== null}
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
          disabled={isSubmitting || pendingRestaurantSession !== null || pendingClientSession !== null}
          error={Boolean(errors.confirmPassword)}
          errorMessage={errors.confirmPassword}
        />

        <div className="flex w-full flex-col font-sans text-sm">
          <label
            htmlFor="registration-channel"
            className="mb-1 text-xs font-bold text-gray-700"
          >
            ¿Dónde nos conociste?
          </label>
          <select
            id="registration-channel"
            name="canal_adquisicion"
            value={form.canal_adquisicion}
            onChange={handleChange}
            disabled={isSubmitting || pendingRestaurantSession !== null || pendingClientSession !== null}
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
        </>}

        {step === 2 && accountType === "restaurante" && (
          <RestaurantImagePicker
            onChange={(image) => {
              setRestaurantImage(image);
              setImageUploadError(null);
            }}
            disabled={isSubmitting}
          />
        )}

        {step === 1 && <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={form.termsAccepted}
              disabled={isSubmitting || pendingRestaurantSession !== null || pendingClientSession !== null}
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
        </div>}

        <div className="flex gap-3">
          {step === 2 && (
            <Button
              type="button"
              variant="light"
              onClick={() => changeStep(1)}
              disabled={isSubmitting}
              className="inline-flex w-1/3 items-center justify-center gap-2 text-center"
            >
              <Arrow direction="left" />
              Volver
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-center shadow-sm transition-colors hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? "Creando cuenta..."
              : step === 1
                ? "Continuar"
                : accountType === "cliente"
                  ? "Guardar y continuar"
                  : "Crear cuenta"}
          </Button>
        </div>
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
