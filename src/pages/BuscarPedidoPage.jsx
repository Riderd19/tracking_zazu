import { useRef } from 'react'
import { ConfigProvider } from 'antd'
import { LockOutlined, WhatsAppOutlined } from '@ant-design/icons'
import SearchForm from '../components/shared/SearchForm'
import ConectoresNota from '../components/buscar/ConectoresNota'
import NotaVentaMovil from '../components/buscar/NotaVentaMovil'
import PasoNumero from '../components/buscar/PasoNumero'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'

// El morado del diseño de esta pantalla, un tono más profundo que el primario del
// sitio: lo llevan el botón, los pasos numerados y las flechas.
const TEMA_BUSQUEDA = { token: { colorPrimary: '#560591' } }

// Hay un diseño para móvil y otro para escritorio, y el corte está en `lg`: por
// debajo, la nota de ejemplo va arriba del formulario y todo en una columna; por
// encima, la tarjeta con la nota abajo y las flechas hacia cada campo.

function AvisoPrivacidad({ className = '' }) {
  return (
    <p className={`mb-0 flex items-start gap-2 text-[15px] leading-normal text-gray-500 lg:text-[13px] ${className}`}>
      <LockOutlined className="mt-1 lg:mt-0.5" />
      Solo usamos estos datos para verificar que el pedido es tuyo.
    </p>
  )
}

function PasoAyuda({ numero, titulo, children }) {
  return (
    <div className="flex gap-3.5 lg:gap-3">
      <PasoNumero numero={numero} tamano="ayuda" className="mt-px" />
      <div>
        <p className="mb-1 text-base font-semibold text-gray-900 lg:mb-0.5 lg:text-[15px]">{titulo}</p>
        <p className="mb-0 text-[15px] leading-[1.65] text-gray-500 lg:text-sm lg:leading-[1.6]">{children}</p>
      </div>
    </div>
  )
}

function DondeEncuentroDatos() {
  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-gray-900 lg:mb-2">¿Dónde encuentro estos datos?</h2>
      {/* En móvil la nota de ejemplo ya va arriba del formulario, así que esta
          frase y el aviso de privacidad solo hacen falta en escritorio. */}
      <p className="mb-4 hidden text-sm leading-[1.6] text-gray-500 lg:block">
        Están en la nota de venta que te envió la tienda al confirmar tu compra.
      </p>

      <div className="flex flex-col gap-6 lg:gap-3">
        <PasoAyuda numero={1} titulo="N° de pedido">
          Arriba a la derecha. Es el número después de la barra: Overshark/067812 → 067812.
          Lo que va antes de la barra es tu tienda: elígela en la lista.
        </PasoAyuda>
        <PasoAyuda numero={2} titulo="DNI o celular">
          En «Datos del cliente». Usa el mismo que diste al hacer tu compra.
        </PasoAyuda>
      </div>

      <AvisoPrivacidad className="mt-3 hidden lg:flex" />
    </div>
  )
}

/** Solo en móvil: en escritorio este contacto está en la cabecera. */
function ContactoMovil() {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-8 text-center sm:px-6 lg:hidden">
      <p className="mb-2 text-base font-semibold text-gray-900">
        ¿Tienes problemas para rastrear tu pedido?
      </p>
      <p className="mb-5 text-[15px] text-gray-500">Escríbenos y te ayudamos a encontrarlo.</p>
      <a
        href={WHATSAPP_SOPORTE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-[#560591] bg-white text-base text-[#560591] transition-colors hover:bg-[#560591]/5"
      >
        <WhatsAppOutlined /> Escríbenos por WhatsApp
      </a>
    </div>
  )
}

/** La pantalla inicial: el formulario de código + DNI/celular. */
export default function BuscarPedidoPage({ onBuscar, loading, error, codigoInicial }) {
  const notaRef = useRef(null)
  const numeroRef = useRef(null)
  const identificadorRef = useRef(null)

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row lg:items-center lg:px-4 lg:py-3">
      <ConfigProvider theme={TEMA_BUSQUEDA}>
        {/* En móvil es una franja de color de lado a lado; en escritorio, la tarjeta. */}
        <section className="relative w-full bg-[#fbf5ff] px-4 pt-6 pb-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:rounded-[36px] lg:border lg:border-[#efe3f7] lg:px-16 lg:py-6">
          <div className="mx-auto max-w-[560px] lg:max-w-none">
            <div className="lg:hidden">
              <h1 className="mb-1.5 text-[28px] font-bold leading-tight tracking-tight text-gray-900">
                Rastrea tu pedido
              </h1>
              <p className="mb-5 text-base text-gray-500">Busca estos 2 datos en tu nota de venta:</p>
              <NotaVentaMovil />
            </div>

            <div className="hidden lg:flex lg:items-start lg:justify-between">
              <div className="max-w-[560px]">
                <h1 className="mb-3 text-[42px] font-bold leading-[1.1] tracking-tight text-gray-900">
                  Conoce dónde está <br />tu pedido
                </h1>
                <p className="mb-0 text-base leading-relaxed text-gray-500">
                  Ingresa los datos de tu nota de venta y te mostramos el estado y la
                  ubicación de tu pedido en tiempo real.
                </p>
              </div>

              <img
                src="/images/repartidor-zazu.webp"
                alt=""
                width={754}
                height={596}
                // Cuelga sobre la fila de etiquetas (su celda derecha está vacía)
                // sin empujarla: así no suma alto a la tarjeta.
                className="-mt-2 -mr-2 -mb-14 w-[250px] shrink-0"
              />
            </div>

            <div className="mt-5 lg:mt-3 lg:w-[90.5%]">
              <SearchForm
                onSubmit={onBuscar}
                loading={loading}
                error={error}
                codigoInicial={codigoInicial}
                numeroRef={numeroRef}
                identificadorRef={identificadorRef}
              />
            </div>

            <AvisoPrivacidad className="mt-4 lg:hidden" />
            <hr className="my-6 border-0 border-t border-gray-200 lg:hidden" />

            <div className="lg:mt-6 lg:grid lg:grid-cols-[48.5%_1fr_37%]">
              <img
                ref={notaRef}
                src="/images/nota-venta-ejemplo-zazu.png"
                alt="Ejemplo de nota de venta: el N° de pedido está arriba a la derecha y el DNI o celular en Datos del cliente"
                width={520}
                height={468}
                className="nota-ejemplo hidden max-w-[520px] lg:block"
              />
              <div className="lg:col-start-3">
                <DondeEncuentroDatos />
              </div>
            </div>
          </div>

          <ConectoresNota
            notaRef={notaRef}
            numeroRef={numeroRef}
            identificadorRef={identificadorRef}
          />
        </section>

        <ContactoMovil />
      </ConfigProvider>
    </div>
  )
}
