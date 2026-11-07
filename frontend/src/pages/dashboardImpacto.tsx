import { Link } from "react-router-dom";

export function DashboardImpactoPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
        Mi dashboard cliente
      </h1>
      <section className="mt-6 rounded-xl border border-green-200 bg-white p-6">
        <p className="text-sm font-bold text-green-800">Próximamente</p>
        <p className="mt-2 text-sm text-gray-600">
          Acá vas a poder consultar el impacto de tus pedidos y tus
          contribuciones para reducir residuos.
        </p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          to="/restaurantes"
          className="rounded-xl border border-green-200 bg-white p-6 text-lg font-semibold text-green-800 transition hover:border-green-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
        >
          Explorar restaurantes
        </Link>
        <div className="rounded-xl border border-green-200 bg-white p-6 text-lg font-semibold text-green-800">
          Conocer cómo funciona
        </div>
      </div>
    </main>
  );
}
