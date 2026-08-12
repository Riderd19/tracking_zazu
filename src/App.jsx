import { useEffect, useState } from 'react'
import { WhatsAppOutlined } from '@ant-design/icons'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import SearchForm from './components/SearchForm'
import OrderResult from './components/OrderResult'
import {
  buscarPedido,
  TrackingNoEncontradoError,
  TrackingRateLimitError,
  TrackingValidacionError,
} from './services/trackingService'
import { leerCodigoDeUrl, limpiarCodigoDeUrl } from './utils/codigoUrl'
import { WHATSAPP_SOPORTE_LINK } from './constants/soporte'

function clasificarError(err) {
  if (err instanceof TrackingRateLimitError) return { tipo: 'rate_limit', mensaje: err.message }
  if (err instanceof TrackingNoEncontradoError) return { tipo: 'no_encontrado', mensaje: err.message }
  if (err instanceof TrackingValidacionError) return { tipo: 'validacion', mensaje: err.message }
  return { tipo: 'desconocido', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
}

// Cada cuánto se refresca el pedido mientras está "En Ruta" (posición del
// motorizado, hora estimada). No es push en vivo (eso requeriría un canal de
// broadcast que hoy no existe) — 20s es suficiente para que el mapa se sienta
// actualizado sin acercarse al límite de 10 consultas/min por IP del backend.
const INTERVALO_POLLING_MS = 20000
const CODIGO_EN_RUTA = 'en_ruta'

const MOCK_PEDIDO_PREVIEW = {
  codigo: 'Box Prime/002014',
  destinatario_nombre: 'DAMIAN LEON YUDNA ROSAURA',
  destinatario_direccion: 'SHALOM - HUARAZ - ANCASH / HUARAZ / HUARAZ',
  empresa: 'BOX PRIME',
  tipo_envio: 'COURIER',
  estado_actual: { codigo: 'despachado' },
  timeline: [],
  fecha_pedido: '29/07/2026',
  fecha_envio: '30/07/2026',
  codigo_courier: 'NNN9',
  guia_courier: '91526472',
  fecha_despacho: '30/07/2026 22:59',
  sede_entrega: { direccion: 'SHALOM - HUARAZ - ANCASH / HUARAZ / HUARAZ' },
  saldo_pendiente: 79,
}

export default function App() {
  const [pedido, setPedido] = useState(MOCK_PEDIDO_PREVIEW)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codigoInicial, setCodigoInicial] = useState(leerCodigoDeUrl)
  // Código + identificador de la última búsqueda exitosa, para poder repetirla
  // en el polling sin pedirle esos datos de nuevo al usuario.
  const [ultimaBusqueda, setUltimaBusqueda] = useState(null)

  // El código de la URL (link de WhatsApp) se consume una sola vez: se usa para
  // precargar el formulario y se borra de inmediato, para que un refresh (F5) o
  // volver a abrir la pestaña siempre arranque con los campos limpios.
  useEffect(() => {
    if (codigoInicial) limpiarCodigoDeUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(codigo, identificador) {
    setLoading(true)
    setError(null)

    try {
      const resultado = await buscarPedido(codigo, identificador)
      setPedido(resultado)
      setUltimaBusqueda({ codigo, identificador })
    } catch (err) {
      setError(clasificarError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleVolver() {
    setPedido(null)
    setError(null)
    setCodigoInicial('')
    setUltimaBusqueda(null)
    limpiarCodigoDeUrl()
  }

  // Polling: solo mientras el pedido esté "En Ruta" — antes no hay nada que
  // se mueva, y después (entregado/etc.) tampoco. Errores de red durante el
  // polling se ignoran en silencio: no tiene sentido tirar al usuario a una
  // pantalla de error por un refresh de fondo que falló una vez.
  useEffect(() => {
    if (!ultimaBusqueda || pedido?.estado_actual?.codigo !== CODIGO_EN_RUTA) return

    const intervalo = setInterval(async () => {
      try {
        const actualizado = await buscarPedido(ultimaBusqueda.codigo, ultimaBusqueda.identificador)
        setPedido(actualizado)
      } catch {
        // silencioso a propósito — se reintenta en el siguiente ciclo
      }
    }, INTERVALO_POLLING_MS)

    return () => clearInterval(intervalo)
  }, [ultimaBusqueda, pedido?.estado_actual?.codigo])

  if (pedido) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col">
        <SiteHeader onVolver={handleVolver} />
        <div className="w-full max-w-[1600px] mx-auto flex-1 flex flex-col gap-6 px-4 sm:px-8 py-10">
          <OrderResult pedido={pedido} />
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <SiteHeader />

      <div className="w-full flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md flex flex-col items-center">
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-violet-50 mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="h-11 w-11 text-violet-600">
              <path
                d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M4 7.5 12 12m0 0 8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 border-4 border-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-600">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Rastrea tu pedido</h1>
          <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
            Ingresa tu número de pedido y tu DNI o celular para consultar el estado y la ubicación de tu pedido en
            tiempo real.
          </p>

          <div className="w-full bg-white rounded-3xl shadow-[0_20px_50px_-20px_rgba(109,40,217,0.25)] border border-violet-50 p-8">
            <SearchForm
              onSubmit={handleSearch}
              loading={loading}
              error={error}
              codigoInicial={codigoInicial}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm font-semibold text-gray-900 mb-1">¿Tienes problemas para rastrear tu pedido?</p>
            <p className="text-xs text-gray-500 mb-4">Contáctanos por WhatsApp y te ayudaremos a encontrar tu pedido.</p>
            <a
              href={WHATSAPP_SOPORTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-600 transition-colors"
            >
              <WhatsAppOutlined /> Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
