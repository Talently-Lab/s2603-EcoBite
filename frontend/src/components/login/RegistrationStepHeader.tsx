import { HeroDescription } from "../ui/HeroDescription";
import { HeroTitle } from "../ui/HeroTitle";
import type { RegistrationAccountType } from "../../services/auth";

interface RegistrationStepHeaderProps {
  step: 1 | 2;
  accountType: RegistrationAccountType;
}

export function RegistrationStepHeader({ step, accountType }: RegistrationStepHeaderProps) {
  const isRestaurantSchedule = step === 2 && accountType === "restaurante";
  const title = isRestaurantSchedule
    ? "Registro de restaurante"
    : step === 1
      ? "Crea tu cuenta"
      : "Tu perfil";
  return (
    <header
      aria-label={`Paso ${step} de 2 del registro`}
      className="mb-5"
    >
      
      <p className="mb-2 text-sm font-semibold text-eco-dark">
        Paso {step} de 2 <span className="mx-1 text-eco-dark">·</span> {title}
      </p>
      <div className="grid grid-cols-2 gap-2" aria-hidden="true">
        {[1, 2].map((item) => (
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
            ? "Con tu email y contraseña ya podés pedir. En el paso siguiente completás tus datos personales."
            : "Con estos datos te entregamos tus pedidos. Los completás una sola vez y después podés modificarlos desde Mi cuenta."}
        </HeroDescription>
      )}
      
    </header>
  );
}
