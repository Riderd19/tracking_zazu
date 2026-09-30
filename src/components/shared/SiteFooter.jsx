import { useState } from 'react'
import LibroReclamacionesModal from './LibroReclamacionesModal'

// Términos y Política de privacidad todavía no tienen página propia, así que
// quedan como texto, sin href, igual que el resto de enlaces de vitrina que
// tenía este pie. El Libro de Reclamaciones sí es real: abre su formulario.
// En móvil el diseño deja fuera la Política de privacidad para que los enlaces
// entren en una fila.
const ENLACES_LEGALES = [
  { texto: 'Términos y condiciones', soloEscritorio: false },
  { texto: 'Política de privacidad', soloEscritorio: true },
]

const ESTILO_ENLACE = 'text-sm text-gray-800 underline underline-offset-4 sm:text-[15px]'

// `ancho` alinea el pie con el contenido de la pantalla que está encima.
export default function SiteFooter({ ancho }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const anio = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full border-t border-gray-200 bg-white">
      <div
        className={`mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:py-3.5 ${ancho}`}
      >
        {/* En móvil los enlaces van arriba y el copyright abajo. */}
        <p className="order-2 mb-0 text-sm text-gray-600 sm:order-none sm:text-[15px]">
          © {anio} Zazu Express · Lima, Perú
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {ENLACES_LEGALES.map(({ texto, soloEscritorio }) => (
            <span key={texto} className={`${ESTILO_ENLACE} ${soloEscritorio ? 'hidden sm:inline' : ''}`}>
              {texto}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className={`${ESTILO_ENLACE} cursor-pointer hover:text-[#560591]`}
          >
            Libro de reclamaciones
          </button>
        </div>
      </div>

      <LibroReclamacionesModal open={modalAbierto} onClose={() => setModalAbierto(false)} />
    </footer>
  )
}
