import { Link } from "react-router-dom";

type CarritoPageProps = {
  count: number;
};

export function CarritoPage({ count }: CarritoPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
        Tu carrito
      </h1>
      {count > 0 ? (
        <p className="mt-3 text-gray-600">
          Tenés {count} {count === 1 ? "producto" : "productos"} en el carrito.
        </p>
      ) : (
        <p className="mt-3 text-gray-600">
          Tu carrito está vacío. Volvé al restaurante para elegir algo del menú.
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {count > 0 && (
          <Link
            to="/checkout"
            className="rounded-full bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900"
          >
            Continuar al checkout
          </Link>
        )}
        <Link
          to={count > 0 ? "/restaurantes" : "/restaurantes/restaurante-de-ejemplo"}
          className="rounded-full border border-green-800 px-5 py-3 font-semibold text-green-800 transition hover:bg-green-50"
        >
          {count > 0 ? "Segui exploprando" : "Ver menú"}
        </Link>
      </div>
    </main>
  );
}
