export function PlaceholderArt({ label = 'Add your image', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`placeholder-art ${className}`} role="img" aria-label={label}>
      <div className="placeholder-art__orb placeholder-art__orb--one" />
      <div className="placeholder-art__orb placeholder-art__orb--two" />
      <div className="placeholder-art__grid" />
      <span>{label}</span>
    </div>
  )
}
