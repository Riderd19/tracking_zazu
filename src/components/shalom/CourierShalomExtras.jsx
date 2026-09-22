import { useState } from 'react'
import { Image, Modal, Spin, message } from 'antd'
import { CameraOutlined, KeyOutlined, LoadingOutlined } from '@ant-design/icons'
import FileLinesIcon from '../icons/FileLinesIcon'
import { obtenerVoucherShalom, pedirClaveDeRecojo } from '../../services/trackingService'

// Igual que SaldoPendiente: reusa la identidad ya verificada al buscar el
// pedido (identidad.codigo/identificador) — el cliente no vuelve a escribir su
// DNI para el voucher o la clave, ya lo escribió una vez para llegar acá.
function BotonVoucher({ identidad }) {
  const [cargando, setCargando] = useState(false)

  async function descargar() {
    if (!identidad?.codigo) return
    setCargando(true)
    try {
      const { url } = await obtenerVoucherShalom(identidad.codigo, identidad.identificador)
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

// Clave de recojo: solo tiene sentido ofrecerla cuando el pedido ya está
// "Pago Completo" (ver ClaveCourierShalom::claveParaEntregar en el backend —
// si el pedido todavía debe, la respuesta siempre viene sin clave, aunque el
// documento sea correcto).
function BotonClave({ identidad }) {
  const [open, setOpen] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)

  async function abrir() {
    setOpen(true)
    setResultado(null)
    if (!identidad?.codigo) return
    setCargando(true)
    try {
      const data = await pedirClaveDeRecojo(identidad.codigo, identidad.identificador)
      setResultado(data)
    } catch (err) {
      setResultado({ ok: false, mensaje: err.message })
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-violet-300 hover:bg-violet-50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white text-lg">
            <KeyOutlined />
          </span>
          <div className="min-w-0">
            <p className="mb-0 text-sm font-semibold text-gray-900">Clave de recojo</p>
            <p className="mb-0 text-xs text-gray-500">La necesitas para retirar tu paquete en agencia.</p>
          </div>
        </div>
      </button>

      <Modal open={open} onCancel={() => setOpen(false)} footer={null} centered title="Clave de recojo">
        {cargando && (
          <div className="py-12 text-center">
            <Spin size="large" />
          </div>
        )}

        {!cargando && resultado?.ok && (
          <div className="py-8 text-center">
            <p className="mb-2 text-xs font-medium text-gray-500">Muéstrala en la agencia junto a tu documento</p>
            <div className="text-4xl font-bold tracking-widest text-violet-700">{resultado.clave}</div>
          </div>
        )}

        {!cargando && resultado && !resultado.ok && (
          <div className="py-8 text-center text-gray-600">
            <p className="mb-0 text-sm">{resultado.mensaje}</p>
          </div>
        )}
      </Modal>
    </>
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
// en Packing, el voucher de envío y la clave de recojo. `pedido.es_shalom` ya
// viene resuelto por el backend (ClaveCourierShalom::esShalom) — acá no se
// vuelve a adivinar por el nombre de la agencia.
export default function CourierShalomExtras({ pedido, identidad }) {
  if (!pedido.es_shalom) return null

  const pagoCompleto = pedido.tipo_pago === 'Pago Completo'

  return (
    <div className="flex flex-col gap-3">
      <FotoPacking pedido={pedido} />
      <BotonVoucher identidad={identidad} />
      {pagoCompleto && <BotonClave identidad={identidad} />}
    </div>
  )
}
