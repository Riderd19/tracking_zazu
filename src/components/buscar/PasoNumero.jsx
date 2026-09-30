const TAMANOS = {
  // Sobre la nota de venta de ejemplo en móvil, donde todo va a escala menor.
  chico: 'h-5 w-5 text-[10px]',
  normal: 'h-6 w-6 text-xs',
  // La ayuda en móvil los lleva más grandes que en escritorio, como en el diseño.
  ayuda: 'h-[26px] w-[26px] text-[13px] lg:h-6 lg:w-6 lg:text-xs',
}

/** El círculo numerado que une cada campo del formulario con su explicación. */
export default function PasoNumero({ numero, tamano = 'normal', className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#560591] font-bold text-white ${TAMANOS[tamano]} ${className}`}
    >
      {numero}
    </span>
  )
}
