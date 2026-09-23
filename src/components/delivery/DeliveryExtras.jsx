import { useState } from 'react'
import { Alert, Button, ConfigProvider, DatePicker, Modal, message } from 'antd'
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import SelectorUbicacion from '../mapas/SelectorUbicacion'
import {
  actualizarUbicacion,
  buscarPedido,
  buscarPedidoPorToken,
  reprogramarEntrega,
} from '../../services/trackingService'

const FORMATO_API = 'YYYY-MM-DD'

function enPalabras(fechaIso) {
  return dayjs(fechaIso).locale('es').format('dddd D [de] MMMM')
}

// Mismo look que los botones de CourierShalomExtras.
function BotonAccion({ icono, titulo, descripcion, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-violet-300 hover:bg-violet-50"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white text-lg">
          {icono}
        </span>
        <div className="min-w-0">
          <p className="mb-0 text-sm font-semibold text-gray-900">{titulo}</p>
          <p className="mb-0 text-xs text-gray-500">{descripcion}</p>
        </div>
      </div>
    </button>
  )
}

// El calendario solo deja elegir lo que el backend va a aceptar: desde mañana
// hasta `fecha_limite_reprogramacion`, que sale del mismo cálculo que aplica
// el endpoint (CambioDeEntregaPortal::limiteDeReprogramacion). Si igual lo
// rechaza (el plazo cambió entre que se abrió la página y se confirmó), el
// motivo se muestra acá mismo.
function FormularioFecha({ pedido, identidad, onListo }) {
  const [manana] = useState(() => dayjs().add(1, 'day').startOf('day'))
  const limite = pedido.fecha_limite_reprogramacion ? dayjs(pedido.fecha_limite_reprogramacion) : null
  const vigente = pedido.fecha_entrega_vigente

  const [fecha, setFecha] = useState(() => {
    if (!vigente) return null
    const inicial = dayjs(vigente)
    const elegible = !inicial.isBefore(manana, 'day') && (!limite || !inicial.isAfter(limite, 'day'))
    return elegible ? inicial : null
  })
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

  const sinCambios = !fecha || fecha.format(FORMATO_API) === vigente

  async function confirmar() {
    setGuardando(true)
    setAviso('')
    try {
      const resultado = await reprogramarEntrega(identidad, fecha.format(FORMATO_API))
      if (resultado.ok) {
        await onListo(resultado)
      } else {
        setAviso(resultado.mensaje)
      }
    } catch (err) {
      setAviso(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <ConfigProvider locale={esES}>
      <div className="flex flex-col gap-4 pt-2">
        {vigente && (
          <p className="mb-0 text-sm text-gray-600">
            Tu entrega está programada para el <strong>{enPalabras(vigente)}</strong>.
          </p>
        )}

        <DatePicker
          value={fecha}
          onChange={setFecha}
          format="DD/MM/YYYY"
          placeholder="Elige el nuevo día"
          disabledDate={(dia) => dia.isBefore(manana, 'day') || Boolean(limite && dia.isAfter(limite, 'day'))}
          allowClear={false}
          showToday={false}
          inputReadOnly
          size="large"
          className="w-full"
        />

        {limite && (
          <p className="mb-0 text-xs text-gray-500">Puedes moverla hasta el {enPalabras(limite)}.</p>
        )}

        {aviso && <Alert type="warning" showIcon title={aviso} />}

        <Button
          type="primary"
          className="h-10! bg-[#5C009C]! text-xs! font-semibold!"
          loading={guardando}
          disabled={sinCambios}
          onClick={confirmar}
          block
        >
          Confirmar nueva fecha
        </Button>
      </div>
    </ConfigProvider>
  )
}

// El punto arranca donde el pedido ya tiene su destino. Si no tiene
// coordenadas, arranca en null y no se deja confirmar hasta que el cliente
// marque uno: confirmar el centro de referencia de Lima mandaría el paquete a
// un lugar que nadie eligió.
function FormularioUbicacion({ pedido, identidad, onListo }) {
  const [punto, setPunto] = useState(pedido.destino_coordenadas ?? null)
  const [movido, setMovido] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

  function elegir(nuevo) {
    setPunto(nuevo)
    setMovido(true)
    setAviso('')
  }

  async function confirmar() {
    setGuardando(true)
    setAviso('')
    try {
      const resultado = await actualizarUbicacion(identidad, punto.lat, punto.lng)
      if (resultado.ok) {
        await onListo(resultado)
      } else {
        setAviso(resultado.mensaje)
      }
    } catch (err) {
      setAviso(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      {pedido.destinatario_direccion && (
        <p className="mb-0 text-sm text-gray-600">
          Dirección actual: <strong>{pedido.destinatario_direccion}</strong>
        </p>
      )}

      <SelectorUbicacion valor={punto} onChange={elegir} />

      {aviso && <Alert type="warning" showIcon title={aviso} />}

      <Button
        type="primary"
        className="h-10! bg-[#5C009C]! text-xs! font-semibold!"
        loading={guardando}
        disabled={!punto || !movido}
        onClick={confirmar}
        block
      >
        Confirmar ubicación
      </Button>
    </div>
  )
}

// Lo que solo aplica a pedidos Delivery que todavía admiten cambios:
// reprogramar el día y mover el punto de entrega. `puede_editar_entrega` ya
// viene resuelto por el backend (PedidoEditablePorCliente, la misma regla que
// usa el bot de WhatsApp) — acá no se vuelve a adivinar por el estado.
export default function DeliveryExtras({ pedido, identidad, onPedidoUpdate }) {
  const [abierto, setAbierto] = useState(null)

  if (pedido.tipo_envio?.toUpperCase() !== 'DELIVERY' || !pedido.puede_editar_entrega) return null
  if (!identidad?.codigo && !identidad?.token) return null

  // Mismo patrón que SaldoPendiente: tras el cambio se vuelve a consultar el
  // tracking para que la página muestre la fecha / el mapa nuevos. Si ese
  // refresco falla, el cambio ya quedó guardado igual: no se le muestra error.
  async function listo(resultado) {
    setAbierto(null)
    message.success(resultado.mensaje)
    try {
      const actualizado = identidad.token
        ? await buscarPedidoPorToken(identidad.token)
        : await buscarPedido(identidad.codigo, identidad.identificador)
      onPedidoUpdate?.(actualizado)
    } catch {
      // silencioso a propósito — ver arriba
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4">
      <BotonAccion
        icono={<CalendarOutlined />}
        titulo="Reprogramar entrega"
        descripcion="Elige otro día para recibir tu pedido."
        onClick={() => setAbierto('fecha')}
      />
      <BotonAccion
        icono={<EnvironmentOutlined />}
        titulo="Cambiar ubicación de entrega"
        descripcion="Marca en el mapa dónde quieres recibirlo."
        onClick={() => setAbierto('ubicacion')}
      />

      <Modal
        open={abierto === 'fecha'}
        onCancel={() => setAbierto(null)}
        footer={null}
        centered
        destroyOnHidden
        title="Reprogramar entrega"
      >
        <FormularioFecha pedido={pedido} identidad={identidad} onListo={listo} />
      </Modal>

      <Modal
        open={abierto === 'ubicacion'}
        onCancel={() => setAbierto(null)}
        footer={null}
        centered
        destroyOnHidden
        width={640}
        title="Cambiar ubicación de entrega"
      >
        <FormularioUbicacion pedido={pedido} identidad={identidad} onListo={listo} />
      </Modal>
    </div>
  )
}
