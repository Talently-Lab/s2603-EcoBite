import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";

interface RestaurantImagePickerProps {
  onChange: (image: File | null) => void;
  disabled?: boolean;
}

export function RestaurantImagePicker({
  onChange,
  disabled = false,
}: RestaurantImagePickerProps) {
  const previewUrl = useRef<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    let validationError: string | null = null;

    if (!allowedTypes.includes(file.type)) {
      validationError = "Elegí una imagen JPG, PNG o WEBP.";
    } else if (file.size > 5 * 1024 * 1024) {
      validationError = "La imagen debe pesar menos de 5 MB.";
    }

    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
    setError(validationError);

    if (validationError) {
      setImage(null);
      onChange(null);
      event.currentTarget.value = "";
      return;
    }

    previewUrl.current = URL.createObjectURL(file);
    setPreview(previewUrl.current);
    setImage(file);
    onChange(file);
  }

  return (
    <div className="rounded-xl border border-dashed border-[#D5DDD2] bg-white p-3">
      <label
        htmlFor="restaurant-image"
        className="mb-2 block text-xs font-bold text-gray-700"
      >
        Imagen del local{" "}
        <span className="font-normal text-gray-500">(opcional)</span>
      </label>
      <div className="flex items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt="Vista previa de la imagen del local"
            className="aspect-[40/11] w-28 shrink-0 rounded-lg border border-[#D5DDD2] object-cover"
          />
        ) : (
          <span className="flex aspect-[40/11] w-28 shrink-0 items-center justify-center rounded-lg bg-eco-light/50 text-eco-dark">
            <ImagePlus aria-hidden="true" className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-xs text-[#4A5A55]">
            {image?.name ?? "Subí una foto para mostrar tu local"}
          </p>
          <label
            htmlFor="restaurant-image"
            className={`inline-flex rounded-md border border-eco-dark px-3 py-1.5 text-xs font-semibold text-eco-dark transition-colors hover:bg-eco-light/50 ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            {image ? "Cambiar imagen" : "Elegir imagen"}
          </label>
        </div>
      </div>
      <input
        id="restaurant-image"
        name="imagen"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={error ? "restaurant-image-error" : undefined}
        className="sr-only"
      />
      <p className="mt-2 text-[11px] text-gray-500">
        Recomendado: 1200 × 330 px · JPG, PNG o WEBP · Máximo 5 MB
      </p>
      {error && (
        <p
          id="restaurant-image-error"
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
