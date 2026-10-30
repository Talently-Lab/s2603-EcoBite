import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AccountTabs } from "../components/login/AccountTabs";
import { RegistrationStepHeader } from "../components/login/RegistrationStepHeader";

export type RegistrationProgressContext = {
  setRegistrationStep: (step: 1 | 2) => void;
};

export function AuthLayout() {
  const { pathname } = useLocation();
  const isRegistration = pathname === "/registro";
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isRegistration) setRegistrationStep(1);
  }, [isRegistration]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start justify-center px-5 py-12 sm:items-center sm:px-8">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {isRegistration && <RegistrationStepHeader step={registrationStep} />}
        <AccountTabs
          activeTab={isRegistration ? "register" : "login"}
        />
        <Outlet context={{ setRegistrationStep }} />
      </section>
    </main>
  );
}
