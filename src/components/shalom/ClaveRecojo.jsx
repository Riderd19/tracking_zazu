import { useEffect, useState } from 'react'
import { Tooltip } from 'antd'
import { LoadingOutlined, LockOutlined } from '@ant-design/icons'
import { estadoClaveRecojo, pedirClaveUnaVez } from '../../services/claveRecojo'

/** Pagado completo: pide la clave y la muestra. */
function ClaveLiberada({ identidad }) {
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    let vigente = true
    pedirClaveUnaVez(identidad).then((r) => {
      if (vigente) setResultado(r)
    })
    return () => {
      vigente = false
    }
  }, [identidad])

  if (!resultado) {
    return <LoadingOutlined className="text-violet-600" aria-label="Cargando clave" />
  }

  if (!resultado.ok) {
    // Pagado pero la clave todavía no está cargada, u otro motivo que el backend
    // explica: se muestra corto y con el detalle a mano.
    return (
      <Tooltip title={resultado.mensaje}>
        <span className="text-xs font-semibold text-amber-600">Se está generando</span>
      </Tooltip>
    )
  }

  return (
    <span className="rounded-md bg-violet-50 px-2 py-0.5 font-mono text-sm font-bold tracking-[0.2em] text-violet-700">
      {resultado.clave}
    </span>
  )
}

/**
 * El valor de la fila "Clave de recojo" de la sección de datos (Shalom).
 *
 * Bloqueada mientras el pedido tenga saldo; visible cuando ya está pagado completo.
 * El backend manda solo el estado (`pedido.clave_recojo.estado`), nunca la clave:
 * la clave se pide aparte y solo cuando está liberada.
 *
 * Se libera sola al pagar por Ligo: SaldoPendiente consulta el pedido mientras el
 * QR está abierto, y con el pago confirmado el estado llega como `liberada`.
 */
export default function ValorClaveRecojo({ pedido, identidad }) {
  if (estadoClaveRecojo(pedido) === 'liberada' && (identidad?.codigo || identidad?.token)) {
    return <ClaveLiberada identidad={identidad} />
  }

  return (
    <Tooltip title="Se libera cuando completes el pago de tu pedido.">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400">
        <LockOutlined />
        <span className="tracking-[0.2em]">••••</span>
      </span>
    </Tooltip>
  )
}
