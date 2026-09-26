type GreenBadgeProps = {
  children?: string
}

export function GreenBadge({ children = 'Opcion eco' }: GreenBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#e5f2df] px-2.5 py-1 text-xs font-semibold text-[#28633b]">
      {children}
    </span>
  )
}