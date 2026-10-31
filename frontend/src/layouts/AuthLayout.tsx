import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AccountTabs } from "../components/login/AccountTabs";
import { RegistrationStepHeader } from "../components/login/RegistrationStepHeader";
import type { RegistrationAccountType } from "../services/auth";

export type RegistrationProgressContext = {
  setRegistrationStep: (step: 1 | 2) => void;
  setRegistrationAccountType: (accountType: RegistrationAccountType) => void;
};

export function AuthLayout() {
  const { pathname } = useLocation();
  const isRegistration = pathname === "/registro";
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [registrationAccountType, setRegistrationAccountType] =
    useState<RegistrationAccountType>("cliente");

  useEffect(() => {
    if (!isRegistration) {
      setRegistrationStep(1);
      setRegistrationAccountType("cliente");
    }
  }, [isRegistration]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start justify-center px-5 py-12 sm:items-center sm:px-8">
      <section className={`w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-[max-width] duration-300 sm:p-8 ${isRegistration && registrationStep === 2 && registrationAccountType === "restaurante" ? "max-w-3xl" : "max-w-lg"}`}>
        {isRegistration && (
          <RegistrationStepHeader
            step={registrationStep}
            accountType={registrationAccountType}
          />
        )}
        {!(isRegistration && registrationStep === 2 && registrationAccountType === "restaurante") && (
          <AccountTabs
            activeTab={isRegistration ? "register" : "login"}
          />
        )}
        <Outlet context={{ setRegistrationStep, setRegistrationAccountType }} />
      </section>
    </main>
  );
}
