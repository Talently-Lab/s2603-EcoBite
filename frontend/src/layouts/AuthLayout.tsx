import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AccountTabs } from "../components/login/AccountTabs";
import { RegistrationStepHeader } from "../components/login/RegistrationStepHeader";
import type { RegistrationAccountType } from "../services/auth";

export type RegistrationProgressContext = {
  setRegistrationStep: (step: 1 | 2 | 3) => void;
  setRegistrationAccountType: (accountType: RegistrationAccountType) => void;
};

export function AuthLayout() {
  const { pathname } = useLocation();
  const isRegistration = pathname === "/registro";
  const [registrationStep, setRegistrationStep] = useState<1 | 2 | 3>(1);
  const [registrationAccountType, setRegistrationAccountType] =
    useState<RegistrationAccountType>("cliente");

  useEffect(() => {
    if (!isRegistration) {
      setRegistrationStep(1);
      setRegistrationAccountType("cliente");
    }
  }, [isRegistration]);

  const isWideRestaurantStep =
    isRegistration &&
    registrationStep === 3 &&
    registrationAccountType === "restaurante";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start justify-center px-5 py-12 sm:items-center sm:px-8">
      <section className={`w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-[width,max-width] duration-300 sm:p-8 ${isWideRestaurantStep ? "sm:w-[48rem] sm:max-w-full" : "sm:max-w-lg"}`}>
        {isRegistration && (
          <RegistrationStepHeader
            step={registrationStep}
            accountType={registrationAccountType}
          />
        )}
        {!isWideRestaurantStep && (
          <AccountTabs
            activeTab={isRegistration ? "register" : "login"}
          />
        )}
        <Outlet context={{ setRegistrationStep, setRegistrationAccountType }} />
      </section>
    </main>
  );
}
