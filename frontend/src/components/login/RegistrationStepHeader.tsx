import { HeroDescription } from "../ui/HeroDescription";
import { HeroTitle } from "../ui/HeroTitle";
import type { RegistrationAccountType } from "../../services/auth";

interface RegistrationStepHeaderProps {
  step: 1 | 2 | 3;
  accountType: RegistrationAccountType;
}

export function RegistrationStepHeader({ step, accountType }: RegistrationStepHeaderProps) {
  const isRestaurant = accountType === "restaurante";
  const isRestaurantSchedule = step === 3 && isRestaurant;
  const totalSteps = isRestaurant ? 3 : 2;
  const title = isRestaurantSchedule
    ? "Horarios de atención"
    : step === 1
      ? "Crea tu cuenta"
      : isRestaurant
        ? "Datos del restaurante"
        : "Tu perfil";
  return (
    <header
      aria-label={`Paso ${step} de ${totalSteps} del registro`}
      className="mb-5"
    >
      
      <p className="mb-2 text-sm font-semibold text-eco-dark">
        Paso {step} de {totalSteps} <span className="mx-1 text-eco-dark">·</span> {title}
      </p>
      <div className={`grid gap-2 ${totalSteps === 3 ? "grid-cols-3" : "grid-cols-2"}`} aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => (
          <span
            key={item}
            className={`h-1 rounded-full transition-colors duration-300 ${
              item <= step ? "bg-eco-dark" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      {isRestaurantSchedule ? (
        <>
          <HeroTitle className="mt-4 !text-2xl !leading-tight">
            Horarios de atención
          </HeroTitle>
          <HeroDescription className="mt-2 !text-sm !max-w-none">
            Configurá los días y turnos de tu local. Podés cargar hasta 2 turnos por día. Los clientes ven estos horarios en tu tarjeta.
          </HeroDescription>
        </>
      ) : (
        <HeroDescription className="mt-2 !text-sm">
          {step === 1
            ? isRestaurant
              ? "Completá tu email y contraseña. Después vas a cargar los datos del local."
              : "Con tu email y contraseña ya podés pedir. En el paso siguiente completás tus datos personales."
            : isRestaurant
              ? "Completá los datos del local. Verificaremos que el CUIT esté disponible antes de continuar."
              : "Con estos datos te entregamos tus pedidos. Los completás una sola vez y después podés modificarlos desde Mi cuenta."}
        </HeroDescription>
      )}
      
    </header>
  );
}
