import { useEffect, useState } from 'react'
import { Button, Modal, QRCode, Spin } from 'antd'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CreditCardOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { buscarPedido, generarQrSaldo } from '../services/trackingService'

const POLL_MS = 10000

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`

function secondsLeft(expiresAt) {
  if (!expiresAt) return 0
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function countdown(seconds) {
  const horas = Math.floor(seconds / 3600)
  const minutos = Math.floor((seconds % 3600) / 60)
  const resto = seconds % 60
  return [horas, minutos, resto].map((parte) => String(parte).padStart(2, '0')).join(':')
}

// El pago con QR de Ligo Pay. El estado (si ya hay un QR vigente, si ya se
// pagó, el monto) viene siempre dentro de `pedido.ligo_payment` — lo arma
// TrackingPublicController::ligoPaymentState() en cada /public/tracking — así
// que este componente no guarda su propia copia del pago: solo pide generar
// uno nuevo cuando hace falta y, mientras el modal está abierto, vuelve a
// consultar el tracking para enterarse cuando Ligo confirma el pago.
export default function SaldoPendiente({ pedido, identidad, onPedidoUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pago = pedido.ligo_payment ?? {}
  const monto = Number(pago.amount ?? pedido.saldo_pendiente ?? 0)
  const pagado = pago.status === 'pagado'
  // `remaining` se deriva de `pago.expires_at` en cada render — nunca se
  // sincroniza en un efecto — y `tick` solo fuerza un re-render por segundo
  // mientras el QR está vigente, para que la cuenta regresiva se vea avanzar.
  const [, setTick] = useState(0)
  const remaining = secondsLeft(pago.expires_at)
  const qrVigente = pago.status === 'vigente' && Boolean(pago.qr_value) && remaining > 0

  useEffect(() => {
    if (!open || !qrVigente) return undefined
    const timer = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [open, qrVigente])

  // Ligo confirma el pago por webhook, no hay forma de que este tab se entere
  // solo: mientras el modal esté abierto con un QR vigente, se vuelve a
  // consultar el tracking cada 10s (mismo endpoint que ya usa App.jsx para el
  // polling de "en ruta") para detectar el cambio de estado.
  useEffect(() => {
    if (!open || !qrVigente || !identidad?.codigo) return undefined

    const polling = setInterval(async () => {
      try {
        const actualizado = await buscarPedido(identidad.codigo, identidad.identificador)
        onPedidoUpdate?.(actualizado)
      } catch {
        // Un fallo temporal de la consulta no debe tumbar un QR que sigue vigente.
      }
    }, POLL_MS)

    return () => clearInterval(polling)
  }, [open, qrVigente, identidad, onPedidoUpdate])

  async function generar() {
    if (!identidad?.codigo) {
      setError('Vuelve a buscar tu pedido para poder generar el QR.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const generado = await generarQrSaldo(identidad.codigo, identidad.identificador)
      onPedidoUpdate?.({
        ...pedido,
        saldo_pendiente: generado.amount,
        ligo_payment: { ...pago, ...generado },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function abrir() {
    setOpen(true)
    setError('')
    if (!qrVigente && !pagado) generar()
  }

  if (monto <= 0 && !pagado) return null

  return (
    <>
      <button
        type="button"
        onClick={pagado ? undefined : abrir}
        disabled={pagado}
        className={`w-full rounded-2xl p-4 text-left border-0 transition-colors ${
          pagado ? 'bg-emerald-50 cursor-default' : 'bg-violet-50 hover:bg-violet-100 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-lg ${
              pagado ? 'bg-emerald-500' : 'bg-gray-900'
            }`}
          >
            {pagado ? <CheckCircleFilled /> : <CreditCardOutlined />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-0">
              {pagado ? 'Pago confirmado' : 'Saldo pendiente'}
            </p>
            <p className="text-xs text-gray-500 mb-0">
              {pagado ? 'Tu pedido ya no tiene saldo pendiente.' : 'Haz clic para pagar mediante un QR seguro.'}
            </p>
          </div>
        </div>

        {!pagado && <p className="text-2xl font-bold text-violet-700 mb-0">{money(monto)}</p>}
      </button>

      <Modal open={open} onCancel={() => setOpen(false)} footer={null} centered title="Pagar saldo pendiente">
        {loading && (
          <div className="py-12 text-center">
            <Spin size="large" />
          </div>
        )}

        {!loading && qrVigente && (
          <div className="flex flex-col items-center py-4 text-center">
            <QRCode value={pago.qr_value} size={220} errorLevel="H" bordered={false} />
            <h3 className="mt-4 mb-1 text-lg font-bold">Escanea y paga a {pago.business_name ?? 'ZAZU'}</h3>
            <div className="text-2xl font-bold text-violet-700">{money(monto)}</div>
            <div className="mt-3 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
              <ClockCircleOutlined /> Vence en {countdown(remaining)}
            </div>
            <p className="mt-3 mb-0 text-xs text-gray-500">La confirmación se actualizará automáticamente.</p>
          </div>
        )}

        {!loading && !qrVigente && !pagado && (
          <div className="py-5 text-center">
            <p>{error || 'El QR venció o todavía no pudo generarse.'}</p>
            <Button type="primary" icon={<ReloadOutlined />} onClick={generar}>
              Generar un nuevo QR
            </Button>
          </div>
        )}

        {!loading && pagado && (
          <div className="py-10 text-center text-emerald-700">
            <CheckCircleFilled className="text-5xl" />
            <h3 className="mt-3 text-lg font-bold">Pago confirmado</h3>
            <p>Tu pedido ya no tiene saldo pendiente.</p>
          </div>
        )}
      </Modal>
    </>
  )
}
