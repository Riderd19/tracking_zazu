import { useState } from 'react'
import { Image, message } from 'antd'
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons'
import FileLinesIcon from '../icons/FileLinesIcon'
import { obtenerVoucherShalom } from '../../services/trackingService'

// Igual que SaldoPendiente: reusa la identidad ya verificada al buscar el
// pedido (identidad.codigo/identificador) — el cliente no vuelve a escribir su
// DNI para el voucher, ya lo escribió una vez para llegar acá.
function BotonVoucher({ identidad }) {
  const [cargando, setCargando] = useState(false)

  async function descargar() {
    if (!identidad?.codigo && !identidad?.token) return
    setCargando(true)
    try {
      const { url } = await obtenerVoucherShalom(identidad)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      message.error(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={descargar}
      disabled={cargando}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white text-lg">
          {cargando ? <LoadingOutlined /> : <FileLinesIcon className="h-4 w-4" />}
        </span>
        <div className="min-w-0">
          <p className="mb-0 text-sm font-semibold text-gray-900">Voucher de envío</p>
          <p className="mb-0 text-xs text-gray-500">La guía que Shalom usa para tu paquete.</p>
        </div>
      </div>
    </button>
  )
}

function FotoPacking({ pedido }) {
  const fotos = [pedido.foto_packing_url, pedido.foto_packing_url_2].filter(Boolean)
  if (fotos.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <CameraOutlined /> Foto del empaquetado
      </div>
      <Image.PreviewGroup>
        <div className="flex gap-3">
          {fotos.map((src) => (
            <Image key={src} src={src} width={88} height={88} className="rounded-xl! object-cover" />
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  )
}

// Agrupa lo que solo aplica a pedidos de Courier Shalom: la foto que se sube
// en Packing y el voucher de envío. `pedido.es_shalom` ya viene resuelto por el
// backend (ClaveCourierShalom::esShalom) — acá no se vuelve a adivinar por el
// nombre de la agencia.
//
// La clave de recojo ya no va acá como botón aparte: es una fila más de la
// sección de datos de cada tarjeta, bloqueada hasta que el pedido esté pagado
// (ver ClaveRecojo.jsx).
export default function CourierShalomExtras({ pedido, identidad }) {
  if (!pedido.es_shalom) return null

  return (
    <div className="flex flex-col gap-3">
      <FotoPacking pedido={pedido} />
      <BotonVoucher identidad={identidad} />
    </div>
  )
}
