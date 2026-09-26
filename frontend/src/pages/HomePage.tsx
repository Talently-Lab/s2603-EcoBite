import { Navbar } from '../components/Navbar'

export function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <section aria-labelledby="restaurants-title" className="rounded-lg border border-[#dce5d8] bg-white p-6 sm:p-8" id="restaurants">
          <p className="text-sm font-semibold text-[#39734a]">ECOBITE</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1f2b22] sm:text-3xl" id="restaurants-title">
            Restaurantes
          </h1>
          <p className="mt-3 max-w-2xl text-[#647267]" role="status">
            El catalogo de restaurantes aparecera aqui cuando conectemos los datos del proyecto.
          </p>
        </section>
      </main>
    </div>
  )
}