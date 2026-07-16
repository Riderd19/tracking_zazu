import { useEffect, useState } from 'react'
import SearchForm from './components/SearchForm'
import OrderResult from './components/OrderResult'
import {
  buscarPedido,
  TrackingNoEncontradoError,
  TrackingRateLimitError,
  TrackingValidacionError,
} from './services/trackingService'
import { leerCodigoDeUrl, limpiarCodigoDeUrl } from './utils/codigoUrl'

function clasificarError(err) {
  if (err instanceof TrackingRateLimitError) return { tipo: 'rate_limit', mensaje: err.message }
  if (err instanceof TrackingNoEncontradoError) return { tipo: 'no_encontrado', mensaje: err.message }
  if (err instanceof TrackingValidacionError) return { tipo: 'validacion', mensaje: err.message }
  return { tipo: 'desconocido', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }
}

export default function App() {
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [codigoInicial, setCodigoInicial] = useState(leerCodigoDeUrl)

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
    limpiarCodigoDeUrl()
  }

  if (pedido) {
    return (
      <div className="min-h-screen w-full bg-[#faf9fc] px-4 py-10">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          <OrderResult pedido={pedido} onVolver={handleVolver} />
          <footer className="text-xs text-gray-400 text-center">
            Zazu 2026. Todos los derechos reservados.
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{
        background:
          'radial-gradient(circle at 18% 12%, rgba(124,58,237,0.10), transparent 42%), radial-gradient(circle at 84% 0%, rgba(124,58,237,0.07), transparent 38%), #faf9fc',
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-full flex flex-col items-center sm:bg-white sm:border sm:border-violet-100 sm:rounded-3xl sm:shadow-[0_20px_50px_-20px_rgba(109,40,217,0.25)] sm:p-8 sm:pt-7">
          <header className="w-full flex flex-col items-center mb-6">
            <img
              src="/zazu_logo.png"
              alt="Zazu Express"
              className="w-14 h-14 rounded-xl shadow-sm mb-3"
            />
            <span className="text-[11px] font-semibold tracking-widest text-violet-600 uppercase mb-1">
              Seguimiento de pedidos
            </span>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Zazu Tracking</h1>
            <p className="text-sm text-gray-500 text-center">
              Consulta el estado de tu pedido en tiempo real
            </p>
          </header>

          <main className="w-full">
            <SearchForm
              onSubmit={handleSearch}
              loading={loading}
              error={error}
              codigoInicial={codigoInicial}
            />
          </main>
        </div>

        <footer className="mt-6 text-xs text-gray-400 text-center">
          Zazu 2026. Todos los derechos reservados. <br />
        </footer>
      </div>
    </div>
  )
}
