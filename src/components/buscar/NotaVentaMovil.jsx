import PasoNumero from './PasoNumero'

// Silueta del logo de la tienda de la nota de ejemplo. Se dibuja en vez de
// recortarlo de nota-venta-ejemplo-zazu.png: ahí mide 31px y en un celular se
// vería borroso.
function AletaTienda({ className = '' }) {
  return (
    <svg viewBox="0 0 32 34" className={className} aria-hidden="true">
      <path d="M6 25C11 18 16 9 20 0c-.5 10 0 19 7 25Z" fill="currentColor" />
      <path
        d="M1.5 28.5C10 25.5 22 25.5 30.5 28.5M7 32c6-2 12-2 18 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Celda({ etiqueta, valor, className = '' }) {
  return (
    <div className={`px-2 py-1.5 text-[9px] leading-tight text-gray-700 ${className}`}>
      <span className="font-semibold text-gray-900">{etiqueta}:</span> {valor}
    </div>
  )
}

/**
 * La nota de venta de ejemplo de la versión móvil, recortada a lo que importa:
 * el N° de pedido y la fila de celular y DNI.
 *
 * Es HTML y no la imagen de escritorio achicada porque a 340px de ancho la
 * imagen completa deja el texto ilegible, y lo que tiene que leerse acá son
 * justamente los dos datos marcados. El pie se desvanece para que se note que
 * es un fragmento del documento.
 */
export default function NotaVentaMovil() {
  return (
    <div
      aria-hidden="true"
      className="rounded-t-[24px] bg-[#ddcde7] px-2.5 pt-2.5 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      <div className="rounded-t-2xl bg-white px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 pt-2">
            <AletaTienda className="h-9 w-9 shrink-0 text-[#1a1f36]" />
            <div>
              <p className="mb-0.5 text-[11.5px] font-bold leading-tight text-gray-900">
                OVERSHARK
                <br />
                PERU S.A.C
              </p>
              <p className="mb-0 text-[8px] text-gray-500">RUC: 20612612103</p>
            </div>
          </div>

          <div className="relative shrink-0 rounded-sm border-2 border-dashed border-[#560591] p-[3px]">
            <PasoNumero numero={1} tamano="chico" className="absolute -top-2.5 -left-2.5" />
            <div className="border-[1.5px] border-gray-900 px-3 py-1.5 text-center">
              <p className="mb-1 border-b border-gray-200 pb-1 text-[8.5px] font-semibold text-gray-900">
                NOTA DE VENTA
              </p>
              <p className="mb-0 text-[12.5px] font-bold text-gray-900">Overshark/067812</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border border-gray-200">
          <p className="mb-0 border-b border-gray-200 bg-gray-50 px-2 py-1.5 text-[7.5px] font-bold tracking-[0.14em] text-gray-800">
            DATOS DEL CLIENTE
          </p>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <Celda etiqueta="Cliente" valor="QUISPE ROJAS MARÍA ELENA" className="border-r border-gray-200" />
            <Celda etiqueta="Fecha de emision" valor="28/09/2026 23:33:21" />
          </div>
          <div className="relative -mx-px grid grid-cols-2 border-2 border-dashed border-[#560591]">
            <PasoNumero numero={2} tamano="chico" className="absolute -top-3 -left-2.5" />
            <Celda etiqueta="Celular" valor="+51 987 654 321" className="border-r border-gray-200" />
            <Celda etiqueta="DNI" valor="45678912" />
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200">
            <Celda etiqueta="Vendedor" valor="Jesus" className="border-r border-gray-200" />
            <Celda etiqueta="Tipo de envio" valor="Courier" />
          </div>
          <Celda etiqueta="Código de operación" valor="-" />
        </div>
      </div>
    </div>
  )
}
