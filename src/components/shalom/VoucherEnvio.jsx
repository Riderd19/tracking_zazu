import { useState } from 'react'
import { message } from 'antd'
import { DownloadOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons'
import { obtenerVoucherShalom } from '../../services/trackingService'

/** Un documento dibujado: la guía que se ve en el voucher, con su número y un código de barras. */
function IlustracionGuia({ guia }) {
  return (
    <div
      aria-hidden
      className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 sm:h-36 sm:w-36"
    >
      <div className="w-24 shrink-0 scale-[0.62] rounded-md bg-white p-2.5 shadow-md shadow-violet-900/10 sm:scale-100">
        <p className="mb-0.5 text-[6px] font-bold uppercase tracking-wider text-violet-700">Guía de envío</p>
        <p className="mb-2 truncate font-mono text-[9px] font-bold text-gray-900">{guia || '—'}</p>
        <div className="mb-1 h-0.5 w-full rounded bg-gray-200" />
        <div className="mb-1 h-0.5 w-4/5 rounded bg-gray-200" />
        <div className="mb-2.5 h-0.5 w-3/5 rounded bg-gray-200" />
        <div
          className="h-5 w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #111827 0 1px, transparent 1px 3px, #111827 3px 5px, transparent 5px 6px)',
          }}
        />
      </div>
    </div>
  )
}

/**
 * El voucher de envío de Shalom, destacado en el centro de la vista "en ruta".
 *
 * Es lo que la clienta tiene que llevar a la agencia (junto con su clave de recojo),
 * por eso va arriba y con el borde de acento, no como un botón más en la columna
 * lateral. "Ver" lo abre en otra pestaña; "Descargar" lo guarda como archivo y, si el
 * navegador no deja bajarlo directo (otro dominio sin CORS), cae a abrirlo para que
 * la clienta lo guarde desde ahí.
 *
 * El enlace se pide al backend en cada clic (ver TrackingPublicController::voucher):
 * reusa la identidad ya verificada, así que no se vuelve a pedir el DNI.
 *
 * `entregado`: el paquete ya se recogió y el voucher pasa a ser el comprobante del envío
 * (o la prueba para un reclamo). Cambian los textos y los botones van en violeta.
 * `lugar` es la agencia con su sucursal ("SHALOM - ZAPALLAL"), para la línea de la guía.
 */
export default function VoucherEnvio({ pedido, identidad, agencia, lugar = null, entregado = false }) {
  const [accion, setAccion] = useState(null)
  const guia = pedido.guia_courier
  const nombreAgencia = agencia || 'Shalom'
  const AGENCIA = nombreAgencia.toUpperCase()

  async function pedirUrl() {
    const { url } = await obtenerVoucherShalom(identidad)
    if (!url) throw new Error('El voucher todavía no está disponible.')
    return url
  }

  async function ver() {
    setAccion('ver')
    try {
      window.open(await pedirUrl(), '_blank', 'noopener,noreferrer')
    } catch (err) {
      message.error(err.message)
    } finally {
      setAccion(null)
    }
  }

  async function descargar() {
    setAccion('descargar')
    let url = null
    try {
      url = await pedirUrl()
      const respuesta = await fetch(url)
      if (!respuesta.ok) throw new Error('descarga')
      const archivo = await respuesta.blob()
      const extension = (archivo.type.split('/')[1] || 'pdf').replace('jpeg', 'jpg')
      const enlace = document.createElement('a')
      enlace.href = URL.createObjectURL(archivo)
      enlace.download = `voucher-${guia || pedido.codigo || 'envio'}.${extension}`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      setTimeout(() => URL.revokeObjectURL(enlace.href), 10000)
    } catch (err) {
      // Sin URL es un error real (el voucher no existe todavía); con URL pero sin poder
      // bajarlo, se abre para que lo guarden desde el visor del navegador.
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
      else message.error(err.message)
    } finally {
      setAccion(null)
    }
  }

  const ocupado = accion !== null

  return (
    <div className="w-full rounded-2xl border-[1.5px] border-[#560591] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-row items-start gap-3 sm:gap-5">
        <IlustracionGuia guia={guia} />

        <div className="min-w-0">
          <span className="mb-2 inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
            {entregado ? 'Comprobante de envío' : 'Necesario para recoger'}
          </span>
          <h2 className="mb-1 text-base font-bold tracking-tight text-gray-900 sm:mb-1.5 sm:text-lg">Tu voucher de envío</h2>
          <p className="mb-0 text-[13px] leading-5 text-gray-600 sm:mb-2">
            {entregado ? (
              <>
                <span className="sm:hidden">Descárgalo como comprobante de tu envío.</span>
                <span className="hidden sm:inline">
                  Es la guía que {AGENCIA} usó para tu paquete. Descárgala como comprobante de envío o por si
                  necesitas hacer un reclamo.
                </span>
              </>
            ) : (
              <>
                <span className="sm:hidden">Muéstralo en {AGENCIA} junto con tu clave de recojo.</span>
                <span className="hidden sm:inline">
                  Es la guía que {AGENCIA} usa para tu paquete. Muéstrala en la agencia junto con tu clave de recojo.
                </span>
              </>
            )}
          </p>
          <p className="mb-0 hidden truncate text-xs text-gray-500 sm:block">
            {guia ? `Guía ${guia}` : 'Guía pendiente'} · {(lugar || nombreAgencia).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5">
        <button
          type="button"
          onClick={ver}
          disabled={ocupado}
          className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-60 ${
            entregado ? 'bg-[#560591] hover:bg-violet-800' : 'bg-gray-900 hover:bg-gray-800'
          }`}
        >
          {accion === 'ver' ? <LoadingOutlined /> : <EyeOutlined />}
          Ver voucher
        </button>
        <button
          type="button"
          onClick={descargar}
          disabled={ocupado}
          className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-white text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
            entregado
              ? 'border-[#560591] text-[#560591] hover:bg-violet-50'
              : 'border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {accion === 'descargar' ? <LoadingOutlined /> : <DownloadOutlined />}
          Descargar{entregado && <span className="hidden sm:inline"> PDF</span>}
        </button>
      </div>
    </div>
  )
}
