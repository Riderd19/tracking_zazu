import { useLayoutEffect, useRef, useState } from 'react'

// Dónde nacen las flechas dentro de la imagen de la nota de venta, como fracción
// de su ancho y alto. Medido sobre nota-venta-ejemplo-zazu.png (520×468): el
// borde superior del recuadro 1 (N° de pedido) y el borde derecho del 2 (fila de
// celular y DNI). Si se cambia la imagen, hay que volver a medirlos.
const ORIGEN_PEDIDO = { x: 413 / 520, y: 26 / 468 }
const ORIGEN_CONTACTO = { x: 493 / 520, y: 162 / 468 }

// Aire entre la punta de la flecha y el borde inferior del campo.
const SEPARACION = 12
// Para que la flecha del N° de pedido no llegue pegada a una esquina del campo.
const MARGEN_CAMPO = 28

const COLOR = '#560591'

function cajaDe(elemento, base) {
  const r = elemento.getBoundingClientRect()
  return {
    left: r.left - base.left,
    right: r.right - base.left,
    top: r.top - base.top,
    bottom: r.bottom - base.top,
    width: r.width,
    height: r.height,
  }
}

function punta(x, y) {
  return `M${x - 7} ${y + 8} L${x} ${y} L${x + 7} ${y + 8}`
}

/**
 * Las flechas punteadas que van de la nota de venta de ejemplo a los campos
 * del formulario, como en el diseño.
 *
 * Se miden en vez de dibujarse a posición fija porque los extremos viven en
 * dos bloques distintos (el formulario y la imagen) que se reacomodan con el
 * ancho de la pantalla, y con los mensajes de validación que empujan la imagen
 * hacia abajo. Solo en escritorio: en móvil todo va apilado y no hay a dónde
 * apuntar.
 *
 * Se mide contra su propia capa (que cubre al padre posicionado) y no contra un
 * ref del padre: el efecto de un hijo corre antes de que React le asigne el ref
 * al padre, y ahí ese ref todavía está vacío.
 */
export default function ConectoresNota({ notaRef, numeroRef, identificadorRef }) {
  const capaRef = useRef(null)
  const [trazos, setTrazos] = useState(null)

  useLayoutEffect(() => {
    const contenedor = capaRef.current
    const nota = notaRef.current
    if (!contenedor || !nota) return undefined

    const escritorio = window.matchMedia('(min-width: 1024px)')

    function medir() {
      const numero = numeroRef.current?.querySelector('input')
      const identificador = identificadorRef.current?.querySelector('input')

      if (!escritorio.matches || !numero || !identificador || nota.offsetHeight === 0) {
        setTrazos(null)
        return
      }

      const base = contenedor.getBoundingClientRect()
      const n = cajaDe(nota, base)
      const campoNumero = cajaDe(numero.closest('.ant-input') ?? numero, base)
      const campoId = cajaDe(identificador.closest('.ant-input') ?? identificador, base)

      // 1 → N° de pedido: sube recto si el recuadro cae bajo el campo; si no,
      // quiebra a media altura para llegar a él.
      const x1 = n.left + ORIGEN_PEDIDO.x * n.width
      const y1 = n.top + ORIGEN_PEDIDO.y * n.height
      const destino1 = Math.min(Math.max(x1, campoNumero.left + MARGEN_CAMPO), campoNumero.right - MARGEN_CAMPO)
      const tope1 = campoNumero.bottom + SEPARACION
      const medio1 = (y1 + tope1) / 2

      // 2 → DNI o celular: sale a la derecha y sube al centro del campo.
      const x2 = n.left + ORIGEN_CONTACTO.x * n.width
      const y2 = n.top + ORIGEN_CONTACTO.y * n.height
      const destino2 = campoId.left + campoId.width / 2
      const tope2 = campoId.bottom + SEPARACION

      setTrazos({
        pedido: {
          linea: `M${x1} ${y1} V${medio1} H${destino1} V${tope1}`,
          punta: punta(destino1, tope1),
        },
        contacto: {
          linea: `M${x2} ${y2} H${destino2} V${tope2}`,
          punta: punta(destino2, tope2),
        },
      })
    }

    const observador = new ResizeObserver(medir)
    observador.observe(contenedor)
    nota.addEventListener('load', medir)
    escritorio.addEventListener('change', medir)
    medir()

    return () => {
      observador.disconnect()
      nota.removeEventListener('load', medir)
      escritorio.removeEventListener('change', medir)
    }
  }, [notaRef, numeroRef, identificadorRef])

  return (
    <div ref={capaRef} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {trazos && (
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {[trazos.pedido, trazos.contacto].map((t) => (
            <g key={t.linea} fill="none" stroke={COLOR} strokeWidth="2">
              <path d={t.linea} strokeDasharray="6 5" />
              <path d={t.punta} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
