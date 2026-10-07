import { useEffect, useState } from 'react'
import { Button, Modal, QRCode, Spin } from 'antd'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  KeyOutlined,
  LockFilled,
  QrcodeOutlined,
  ReloadOutlined,
  WalletFilled,
} from '@ant-design/icons'
import { buscarPedidoDeIdentidad, generarQrSaldo } from '../../services/trackingService'
import { pedirClaveUnaVez } from '../../services/claveRecojo'
import montosDelPedido from './montosDelPedido'

const POLL_MS = 10000

const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`

function Fila({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{valor}</span>
    </div>
  )
}

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
  // La clave de recojo de Shalom, pedida sola con el pago confirmado y la
  // ventana abierta: null mientras llega, y después la respuesta tal cual de
  // pedirClaveDeRecojo ({ ok, clave } o { ok: false, mensaje }).
  const [clave, setClave] = useState(null)

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
    if (!open || !qrVigente || (!identidad?.codigo && !identidad?.token)) return undefined

    const polling = setInterval(async () => {
      let actualizado
      try {
        actualizado = await buscarPedidoDeIdentidad(identidad)
        onPedidoUpdate?.(actualizado)
      } catch {
        // Un fallo temporal de la consulta no debe tumbar un QR que sigue vigente.
        return
      }
    }, POLL_MS)

    return () => clearInterval(polling)
  }, [open, qrVigente, identidad, onPedidoUpdate])

  // En Shalom, pagar es justamente lo que libera la clave de recojo: con la
  // ventana abierta y el pago confirmado se pide acá, para que aparezca en la
  // pantalla de "Pago realizado". Aparte del polling de arriba a propósito: el
  // pago puede detectarlo también el refresco general de la página (en ruta), y
  // en ese caso el polling de acá ya se habría cortado sin pedirla.
  //
  // Es la misma consulta que la fila "Clave de recojo" de la tarjeta, que se
  // desbloquea en el mismo momento: comparten el resultado para no gastar dos
  // intentos del límite de la clave.
  useEffect(() => {
    if (!open || !pagado || !pedido.es_shalom || !identidad) return undefined
    let vigente = true
    pedirClaveUnaVez(identidad).then((resultado) => {
      if (vigente) setClave(resultado)
    })
    return () => {
      vigente = false
    }
  }, [open, pagado, pedido.es_shalom, identidad])

  async function generar() {
    if (!identidad?.codigo && !identidad?.token) {
      setError('Vuelve a buscar tu pedido para poder generar el QR.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const generado = await generarQrSaldo(identidad)
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

  // Lo que falta es lo mismo que cobra el QR (`pago.amount`), para que el
  // monto de la tarjeta y el del botón nunca se contradigan.
  const { total } = montosDelPedido(pedido)
  const porPagar = pagado ? 0 : monto
  const yaPagado = Math.max(0, total - porPagar)

  let subtitulo = 'Págalo ahora y recibe tu pedido sin pendientes'
  if (pagado) subtitulo = 'Tu pedido ya no tiene saldo pendiente'
  else if (pedido.es_shalom) subtitulo = 'Págalo para ver tu clave de recojo'

  return (
    <>
      <div
        className={`rounded-2xl border bg-white p-4 shadow-sm ${
          pagado ? 'border-emerald-200' : 'border-violet-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
              pagado ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-100 text-[#5C009C]'
            }`}
          >
            {pagado ? <CheckCircleFilled /> : <WalletFilled />}
          </span>
          <div className="min-w-0">
            <p className="mb-0.5 text-[15px] font-semibold text-gray-900">
              {pagado ? 'Pago completado' : 'Tienes un saldo por pagar'}
            </p>
            <p className="mb-0 text-[13px] leading-snug text-gray-600">{subtitulo}</p>
          </div>
        </div>

        <div className={`mt-4 rounded-xl p-3.5 ${pagado ? 'bg-emerald-50' : 'bg-violet-50'}`}>
          {total > 0 && (
            <div
              className={`mb-3 flex flex-col gap-1.5 border-b pb-3 ${
                pagado ? 'border-emerald-200' : 'border-violet-200'
              }`}
            >
              <Fila label="Total del pedido" valor={money(total)} />
              <Fila label={pagado ? 'Pagado' : 'Ya pagaste'} valor={money(yaPagado)} />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {pagado ? 'Saldo pendiente' : 'Por pagar'}
            </span>
            <span className={`text-2xl font-bold ${pagado ? 'text-emerald-700' : 'text-[#5C009C]'}`}>
              {money(porPagar)}
            </span>
          </div>
        </div>

        {pagado ? (
          <p className="mt-3 mb-0 text-center text-xs text-gray-500">Método de pago: QR</p>
        ) : (
          <>
            <Button
              type="primary"
              block
              icon={<QrcodeOutlined />}
              onClick={abrir}
              className="mt-4 h-12! rounded-xl! bg-[#5C009C]! text-base! font-semibold! hover:bg-[#4A007E]!"
            >
              Pagar {money(porPagar)} con QR
            </Button>
            <p className="mt-3 mb-0 flex items-center justify-center gap-1 text-[11px] text-gray-500">
              <LockFilled /> Pago seguro con QR desde tu app bancaria
            </p>
          </>
        )}
      </div>

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
            <h3 className="mt-3 text-lg font-bold">Pago realizado</h3>
            <p>Tu pedido ya no tiene saldo pendiente.</p>

            {pedido.es_shalom && (
              <div className="mt-6 rounded-2xl bg-violet-50 p-5 text-gray-700">
                <p className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-900">
                  <KeyOutlined /> Tu clave de recojo
                </p>

                {!clave && <Spin />}

                {clave?.ok && (
                  <>
                    <div className="text-4xl font-bold tracking-widest text-violet-700">{clave.clave}</div>
                    <p className="mt-2 mb-0 text-xs font-semibold text-gray-500">
                      Muéstrala en la agencia junto a tu documento
                    </p>
                  </>
                )}

                {clave && !clave.ok && <p className="mb-0 text-sm text-gray-600">{clave.mensaje}</p>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
