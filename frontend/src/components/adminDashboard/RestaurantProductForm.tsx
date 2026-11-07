import { useEffect, useRef, useState, type FormEvent } from "react";
import { GlobalAlert } from "../ui/GlobalAlert";
import {
  createRestaurantProduct,
  getManagedRestaurantProducts,
  uploadRestaurantProductImage,
  updateRestaurantProductAvailability,
  type RestaurantProductApiResponse,
} from "../../services/restaurants";

interface RestaurantProductFormProps {
  restaurantId: number;
  token: string;
}

const fieldClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-eco-dark focus:outline-none focus:ring-1 focus:ring-eco-dark";

function formatPrice(price: number | string) {
  return `$ ${Number(price).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function RestaurantProductForm({
  restaurantId,
  token,
}: RestaurantProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Comida");
  const [image, setImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [productImageError, setProductImageError] = useState<string | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [products, setProducts] = useState<RestaurantProductApiResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [updatingProductIds, setUpdatingProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [uploadingImageIds, setUploadingImageIds] = useState<Set<number>>(
    () => new Set(),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const result = await getManagedRestaurantProducts(
          restaurantId,
          token,
          controller.signal,
        );
        setProducts(result);
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setProductsError(
          loadError instanceof TypeError
            ? "No se pudo conectar con el servidor para cargar los platos."
            : loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los platos.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingProducts(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [restaurantId, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setImageError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const createdProduct = await createRestaurantProduct(token, {
        id_restaurante: restaurantId,
        nombre: name.trim(),
        descripcion: description.trim(),
        precio: Number(price),
        categoria: category.trim(),
      });
      setProducts((current) => [...current, createdProduct]);
      setName("");
      setDescription("");
      setPrice("");
      setSuccess("El plato se creó correctamente.");

      if (image) {
        try {
          await handleProductImageUpload(createdProduct, image);
          setSuccess("El plato y su foto se guardaron correctamente.");
        } catch (uploadError: unknown) {
          setImageError(
            uploadError instanceof Error
              ? `El plato se creó, pero no se pudo subir la foto: ${uploadError.message}`
              : "El plato se creó, pero no se pudo subir la foto.",
          );
        }
      }

      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (submitError: unknown) {
      setError(
        submitError instanceof TypeError
          ? "No se pudo conectar con el servidor. Verificá que el backend esté iniciado e intentá nuevamente."
          : submitError instanceof Error
            ? submitError.message
            : "No se pudo crear el plato. Intentá nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProductImageUpload(
    product: RestaurantProductApiResponse,
    file: File,
  ) {
    setUploadingImageIds((current) => new Set(current).add(product.id));

    try {
      const imageUrl = await uploadRestaurantProductImage(
        token,
        product.id,
        file,
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, imagen: imageUrl } : item,
        ),
      );
    } finally {
      setUploadingImageIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  }

  function validateProductImage(file: File): string | null {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "Elegí una imagen JPG, PNG o WEBP.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "La imagen debe pesar menos de 5 MB.";
    }
    return null;
  }

  function handleImageSelection(file: File | undefined) {
    setImageError(null);
    if (!file) {
      setImage(null);
      return;
    }

    const validationError = validateProductImage(file);
    if (validationError) {
      setImage(null);
      setImageError(validationError);
      return;
    }
    setImage(file);
  }

  async function handleExistingProductImage(
    product: RestaurantProductApiResponse,
    file: File | undefined,
  ) {
    if (!file) return;
    const validationError = validateProductImage(file);
    if (validationError) {
      setProductImageError(validationError);
      return;
    }

    setProductImageError(null);
    try {
      await handleProductImageUpload(product, file);
    } catch (uploadError: unknown) {
      setProductImageError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la foto del plato.",
      );
    }
  }

  async function handleAvailabilityChange(product: RestaurantProductApiResponse) {
    setAvailabilityError(null);
    setUpdatingProductIds((current) => new Set(current).add(product.id));

    try {
      const available = await updateRestaurantProductAvailability(
        token,
        product.id,
        !product.disponible,
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, disponible: available } : item,
        ),
      );
    } catch (updateError: unknown) {
      setAvailabilityError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar la disponibilidad del plato.",
      );
    } finally {
      setUpdatingProductIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  }

  return (
    <div className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-bold text-eco-dark">Agregar un plato</h1>
        <p className="mt-1 text-xs text-gray-600">
          Completá los datos para sumarlo a tu menú.
        </p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-eco-dark">
            Nombre del plato
            <input
              required
              maxLength={100}
              className={fieldClassName}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-eco-dark">
            Descripción
            <textarea
              rows={2}
              maxLength={500}
              className={fieldClassName}
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
            />
          </label>

          <label className="block text-sm font-semibold text-eco-dark">
            Foto del plato <span className="font-normal text-gray-500">(opcional)</span>
            <input
              id="product-image"
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fieldClassName}
              onChange={(event) =>
                handleImageSelection(event.currentTarget.files?.[0])
              }
            />
            <span className="mt-1 block text-xs font-normal text-gray-500">
              JPG, PNG o WEBP · Máximo 5 MB
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-eco-dark">
              Precio
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                className={fieldClassName}
                value={price}
                onChange={(event) => setPrice(event.currentTarget.value)}
              />
            </label>

            <label className="block text-sm font-semibold text-eco-dark">
              Categoría
              <input
                required
                maxLength={60}
                className={fieldClassName}
                value={category}
                onChange={(event) => setCategory(event.currentTarget.value)}
              />
            </label>
          </div>

          {error && <GlobalAlert message={error} />}
          {imageError && <GlobalAlert message={imageError} />}
          {success && <GlobalAlert message={success} variant="success" />}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg border-2 border-eco-dark bg-eco-dark px-5 py-2 text-sm font-bold text-white hover:bg-eco-dark/90 disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? "Creando..." : "Crear plato"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-eco-dark">
          Mis platos ({products.length})
        </h2>
        {availabilityError && (
          <GlobalAlert message={availabilityError} className="mt-4" />
        )}
        {productImageError && (
          <GlobalAlert message={productImageError} className="mt-4" />
        )}
        <div className="mt-4">
          {productsError ? (
            <GlobalAlert message={productsError} />
          ) : loadingProducts ? (
            <p className="text-sm text-gray-600">Cargando platos...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-600">
              Todavía no hay platos cargados.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0"
                >
                  {product.imagen ? (
                    <img
                      src={product.imagen}
                      alt={`Foto de ${product.nombre}`}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-14 w-14 shrink-0 rounded-lg bg-eco-light/50"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-eco-dark">
                      {product.nombre}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.categoria || "Sin categoría"}
                      {" · "}
                      {product.disponible ? "Disponible" : "No disponible"}
                    </p>
                    {product.descripcion && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                        {product.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm font-bold text-eco-dark">
                      {formatPrice(product.precio)}
                    </span>
                    <button
                      type="button"
                      disabled={updatingProductIds.has(product.id)}
                      onClick={() => void handleAvailabilityChange(product)}
                      className="text-xs font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70 disabled:cursor-wait disabled:opacity-60"
                    >
                      {updatingProductIds.has(product.id)
                        ? "Actualizando..."
                        : product.disponible
                          ? "Deshabilitar"
                          : "Habilitar"}
                    </button>
                    <label className="cursor-pointer text-xs font-semibold text-eco-dark underline underline-offset-2 hover:text-eco-dark/70">
                      {uploadingImageIds.has(product.id)
                        ? "Subiendo foto..."
                        : product.imagen
                          ? "Cambiar foto"
                          : "Agregar foto"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingImageIds.has(product.id)}
                        onChange={(event) => {
                          void handleExistingProductImage(
                            product,
                            event.currentTarget.files?.[0],
                          );
                          event.currentTarget.value = "";
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
