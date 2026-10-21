interface InitialBannerProps {
  letter: string;
  image?: string | null;
  isClosed?: boolean;
}

export function InitialBanner({
  letter,
  image,
  isClosed = false,
}: InitialBannerProps) {
  return (
    <div
      className={`relative h-24 w-full overflow-hidden bg-[linear-gradient(to_right,var(--color-eco-light)_0%,transparent_100%)] ${isClosed ? "opacity-[.85]" : ""}`}
    >
      <img
        src={image || "/images/EcoBadge.png"}
        alt=""
        className="h-full w-full object-contain"
        onError={(event) => {
          event.currentTarget.remove();
        }}
      />
      <span className="absolute inset-y-0 left-5 flex items-end pb-1 text-[32px] font-bold text-eco-dark select-none">
        {letter}
      </span>
    </div>
  );
}
