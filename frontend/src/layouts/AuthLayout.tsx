import { Outlet, useLocation } from "react-router-dom";
import { AccountTabs } from "../components/login/AccountTabs";

export function AuthLayout() {
  const { pathname } = useLocation();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start justify-center px-5 py-12 sm:items-center sm:px-8">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <AccountTabs
          activeTab={pathname === "/registro" ? "register" : "login"}
        />
        <Outlet />
      </section>
    </main>
  );
}
