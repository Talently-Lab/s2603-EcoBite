import { Loader } from "../ui/Loader";

function SkeletonCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-hidden="true"
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#edf1e9] ${className}`} />;
}

export function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Cargando estadísticas del restaurante"
      className="mt-8"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {["ventas", "pedidos", "co2"].map((item) => (
          <SkeletonCard key={item}>
            <div className="flex items-center gap-3">
              <SkeletonLine className="h-6 w-6 rounded-full" />
              <SkeletonLine className="h-3 flex-1" />
            </div>
            <SkeletonLine className="mt-3 h-5 w-24" />
            <SkeletonLine className="mt-2 h-2 w-full" />
          </SkeletonCard>
        ))}

        <div
          className="flex items-center gap-2 rounded-lg bg-[#edf4e5] px-4 py-3 text-sm
         text-eco-dark md:col-span-3
         font-bold tracking-tight
         "
        >
          <Loader
            label="Cargando"
            className="text-eco-dark [&_svg]:h-4 [&_svg]:w-4"
          />

          <span className="">
            Cargando tus números... esto puede tardar unos segundos.
          </span>
        </div>

        <SkeletonCard className="md:col-span-2">
          <SkeletonLine className="h-3 w-32" />
          <SkeletonLine className="mt-4 h-40 w-full" />
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonLine className="h-3 w-32" />
          <SkeletonLine className="mt-4 h-40 w-full" />
        </SkeletonCard>

        <SkeletonCard className="md:col-span-2">
          <SkeletonLine className="h-3 w-36" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <SkeletonLine key={row} className="h-2 w-full" />
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <SkeletonLine className="h-3 w-36" />
          <SkeletonLine className="mt-5 h-8 w-20" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((row) => (
              <SkeletonLine key={row} className="h-2 w-full" />
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard className="md:col-span-3">
          <SkeletonLine className="h-3 w-32" />
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <SkeletonLine key={row} className="h-2 w-full" />
            ))}
          </div>
        </SkeletonCard>
      </div>
      <span className="sr-only">
        Cargando tus números... esto puede tardar unos segundos
      </span>
    </div>
  );
}
