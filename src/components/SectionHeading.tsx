export function SectionHeading({ eyebrow, title, copy, align = 'left' }: { eyebrow?: string; title: string; copy?: string; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-olive">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">{title}</h2>
      {copy && <p className="mt-4 text-base leading-7 text-forest/85 sm:text-lg">{copy}</p>}
    </div>
  )
}
