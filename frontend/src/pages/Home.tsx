import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <h1 className="text-color-eco-accent">EcoBite</h1>
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <section
          aria-labelledby="restaurants-title"
          className="rounded-lg border border-green-200 bg-white p-6 sm:p-8"
          id="restaurants"
        >
          <p className="text-sm font-semibold text-green-700">ECOBITE</p>
          <h1
            className="mt-2 text-2xl font-semibold text-gray-800 sm:text-3xl"
            id="restaurants-title"
          >
            Restaurantes
          </h1>
          <p className="mt-3 max-w-2xl text-eco-accent" role="status">
            El catalogo de restaurantes aparecera aqui cuando conectemos los
            datos del proyecto.
          </p>
          <Link
            to="/restaurantes"
            className="mt-4 inline-block text-green-800 underline"
          >
            Ver restaurantes
          </Link>
        </section>
      </main>
    </div>
  );
}
