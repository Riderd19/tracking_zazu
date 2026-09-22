import { InboxOutlined } from '@ant-design/icons'
import ClockIcon from '../icons/ClockIcon'
import LocationDotIcon from '../icons/LocationDotIcon'
import BuildingIcon from '../icons/BuildingIcon'

// Bloque ícono + 2 líneas de texto. `enfasisArriba` decide cuál línea va en
// negrita: el primer campo (Pedido/Cliente) destaca el código arriba, los
// demás destacan el valor abajo (igual patrón que ya usaba "Entrega estimada").
// Colores, tamaños y tipografía calcados del inspector de Figma (Dev Mode):
// círculo bg gray-100/ícono gray-700 a 58px, texto 14px/20px, valores peso 600
// en gray-900, etiquetas peso 500 en gray-700 (peso 400 solo para "Cliente: ...").
// Ninguna línea trunca con "...": un código de pedido o una dirección larga se
// cortaban sin forma de leerlos completos. Por defecto se ajustan a varias
// líneas; `abajoSinAjuste` (Destino) en cambio fuerza una sola fila completa —
// el scroll horizontal queda aislado a esa línea (no al campo entero ni al
// grid completo), así funciona igual sin importar el ancho de pantalla o
// cuántas columnas tenga el grid en cada breakpoint. `abajo` es opcional
// (Código, courier): sin segunda línea, el ícono+texto se centran en vez de
// alinearse arriba, para no dejar espacio vacío debajo.
function Campo({ icon, arriba, abajo, enfasisArriba = false, abajoSinAjuste = false }) {
  return (
    <div className={`flex gap-3 min-w-0 ${abajo ? 'items-start' : 'items-center'}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
        {icon}
      </span>
      <div className="min-w-0 flex flex-col gap-2">
        <p
          className={`mb-0 break-words text-sm leading-5 ${
            enfasisArriba ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
          }`}
        >
          {arriba}
        </p>
        {abajo &&
          (abajoSinAjuste ? (
            <div className="overflow-x-auto scrollbar-hide">
              <p
                className={`mb-0 whitespace-nowrap text-sm leading-5 ${
                  enfasisArriba ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
                }`}
              >
                {abajo}
              </p>
            </div>
          ) : (
            <p
              className={`mb-0 break-words text-sm leading-5 ${
                enfasisArriba ? 'font-normal text-gray-700' : 'font-semibold text-gray-900'
              }`}
            >
              {abajo}
            </p>
          ))}
      </div>
    </div>
  )
}

/**
 * La franja de datos del pedido que va arriba de todo, igual en los dos tipos
 * de envío y en todos los estados: código, cliente, empresa, destino y fecha.
 */
export default function FichaPedido({ pedido, destino }) {
  return (
    <div className="rounded bg-gray-50 p-6 grid grid-cols-1 sm:grid-cols-[repeat(2,max-content)] sm:justify-between gap-x-5 gap-y-5 2xl:flex 2xl:flex-nowrap 2xl:items-start 2xl:[&>*:last-child]:-translate-x-4">
      <Campo
        icon={<InboxOutlined className="text-xl" />}
        arriba={`Pedido ${pedido.codigo}`}
        abajo={`Cliente: ${pedido.destinatario_nombre}`}
        enfasisArriba
      />
      {/* Línea divisoria como elemento propio, con el mismo gap-x-8 fijo a
          cada lado (ver flex arriba) — queda centrada en el hueco entre
          campos, y los huecos miden exactamente lo mismo sin importar el
          largo del contenido de cada campo. */}
      <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
      <Campo
        icon={<BuildingIcon className="w-6 h-6" />}
        arriba="Empresa"
        abajo={pedido.empresa ?? 'No disponible'}
      />
      <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
      <Campo
        icon={<LocationDotIcon className="w-6 h-6" />}
        arriba="Destino"
        abajo={destino}
        abajoSinAjuste
      />
      <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
      <Campo
        icon={<ClockIcon className="w-6 h-6" />}
        arriba="Fecha de envío"
        abajo={pedido.fecha_envio ?? 'Pendiente'}
        abajoSinAjuste
      />
    </div>
  )
}
