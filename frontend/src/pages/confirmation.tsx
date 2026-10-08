import { Link } from "react-router-dom";

export function ConfirmacionPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 text-center sm:px-8">
      <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
        ¡Pedido confirmado!
      </h1>
      <p className="mt-3 text-gray-600">
        Esta confirmación es parte de una compra simulada.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-full bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900"
        >
          Ver mi dashboard
        </Link>
        <Link
          to="/"
          className="rounded-full border border-green-800 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
