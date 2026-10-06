import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Spin } from 'antd'
import {
  CloseOutlined,
  CustomerServiceOutlined,
  ExclamationCircleFilled,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons'
import useChatDelPedido from '../../hooks/useChatDelPedido'
import { SoporteChatContext } from './soporteChatContext'

const MAX_CARACTERES = 1000

// Para el cliente que no sabe por dónde empezar. Se envían tal cual.
const SUGERENCIAS = [
  '¿Cuándo llega mi pedido?',
  '¿Cuánto me falta pagar?',
  'Quiero hablar con un asesor',
]

const AUTOR = {
  asistente: { nombre: 'Asistente virtual', icono: RobotOutlined },
  asesor: { nombre: 'Asesor de Zazu', icono: CustomerServiceOutlined },
}

function hora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' })
}

function Burbuja({ de, texto, fecha, pendiente, onReintentar, onDescartar }) {
  const delCliente = de === 'cliente'
  const autor = AUTOR[de]

  return (
    <div className={`flex flex-col ${delCliente ? 'items-end' : 'items-start'}`}>
      {autor && (
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-gray-500">
          <autor.icono />
          {autor.nombre}
        </span>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line break-words ${
          delCliente ? 'rounded-br-md bg-violet-700 text-white' : 'rounded-bl-md bg-gray-100 text-gray-900'
        } ${pendiente?.estado === 'enviando' ? 'opacity-70' : ''}`}
      >
        {texto}
      </div>
      {pendiente?.estado === 'error' ? (
        <span className="mt-1 flex flex-wrap items-center justify-end gap-2 text-[11px] text-red-600">
          <ExclamationCircleFilled />
          {pendiente.motivo}
          <button type="button" onClick={onReintentar} className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-violet-700">
            Reintentar
          </button>
          <button type="button" onClick={onDescartar} className="cursor-pointer border-0 bg-transparent p-0 text-gray-500">
            Descartar
          </button>
        </span>
      ) : (
        <span className="mt-1 text-[11px] text-gray-400">
          {pendiente ? 'Enviando…' : hora(fecha)}
        </span>
      )}
    </div>
  )
}

function Escribiendo() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500" aria-live="polite">
      <span className="flex gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-3 py-2.5">
        {[0, 150, 300].map((retraso) => (
          <span
            key={retraso}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${retraso}ms` }}
          />
        ))}
      </span>
      El asistente está escribiendo…
    </div>
  )
}

/**
 * El chat del pedido: la conversación con el asistente virtual y, cuando hace
 * falta, con un asesor de Zazu.
 *
 * Envuelve la página del seguimiento para compartir con ella cómo se abre
 * (SoporteChatContext): en escritorio lo abre el botón grande "Contacta
 * Soporte" que cada vista pone debajo de su imagen (BotonContactaSoporte); en
 * celular, el botón flotante de acá.
 *
 * Aparece solo con el pedido ya verificado —por el enlace o por nota de venta +
 * DNI/celular— y usa esa misma identidad para abrir la conversación. Como la
 * conversación es del pedido, el cliente que vuelve otro día y verifica de nuevo
 * encuentra todo lo que ya habló.
 */
export default function ChatDelPedido({ pedido, identidad, children }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const finalRef = useRef(null)
  const campoRef = useRef(null)

  const chat = useChatDelPedido(identidad, abierto)
  const { iniciar, noLeidos } = chat

  const abrir = useCallback(() => {
    setAbierto(true)
    iniciar()
  }, [iniciar])

  const soporte = useMemo(() => ({ abrir, noLeidos }), [abrir, noLeidos])

  // Al pie con cada mensaje nuevo, y con el aviso de "escribiendo".
  useEffect(() => {
    if (abierto) finalRef.current?.scrollIntoView({ block: 'end' })
  }, [abierto, chat.mensajes.length, chat.pendientes.length, chat.esperandoRespuesta])

  // El foco al campo apenas el chat está listo, para escribir sin otro clic.
  useEffect(() => {
    if (abierto && chat.estado === 'listo') campoRef.current?.focus()
  }, [abierto, chat.estado])

  // Escape cierra, como cualquier ventana.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const enviar = (valor = texto) => {
    if (chat.enviar(valor)) setTexto('')
  }

  const sinMensajes = chat.mensajes.length === 0 && chat.pendientes.length === 0
  const atiendeAsesor = chat.atiende === 'asesor'

  return (
    <SoporteChatContext.Provider value={soporte}>
      {children}

      {/* Solo en celular: en escritorio lo abre BotonContactaSoporte, debajo de
          la imagen del estado. */}
      {!abierto && (
        <button
          type="button"
          onClick={abrir}
          aria-label="Contacta Soporte"
          className="fixed right-4 bottom-4 z-[1000] flex cursor-pointer items-center gap-2 rounded-full border-0 bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition-colors hover:bg-violet-800 sm:right-6 sm:bottom-6 md:hidden"
        >
          <CustomerServiceOutlined className="text-lg" />
          <span>Contacta Soporte</span>
          {chat.noLeidos > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold">
              {chat.noLeidos}
            </span>
          )}
        </button>
      )}

      {abierto && (
        <section
          role="dialog"
          aria-label="Chat de tu pedido"
          className="fixed inset-0 z-[1000] flex flex-col bg-white sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100vh-48px)] sm:w-[380px] sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl"
        >
          <header className="flex shrink-0 items-center gap-3 bg-violet-700 px-4 py-3 text-white sm:rounded-t-2xl">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg">
              {atiendeAsesor ? <CustomerServiceOutlined /> : <RobotOutlined />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-0 truncate text-sm font-semibold">Chat de tu pedido {pedido?.codigo}</p>
              <p className="mb-0 truncate text-xs text-violet-100">
                {atiendeAsesor ? 'Te atiende un asesor de Zazu' : 'Asistente virtual · Responde al instante'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar el chat"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white hover:bg-white/15"
            >
              <CloseOutlined />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4" style={{ minHeight: 0 }}>
            {chat.estado === 'abriendo' && (
              <div className="flex h-full items-center justify-center"><Spin /></div>
            )}

            {chat.estado === 'error' && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <ExclamationCircleFilled className="text-2xl text-red-500" />
                <p className="mb-0 text-sm text-gray-600">{chat.error}</p>
                <button
                  type="button"
                  onClick={chat.iniciar}
                  className="cursor-pointer rounded-full border-0 bg-violet-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Reintentar
                </button>
              </div>
            )}

            {chat.estado === 'listo' && (
              <div className="flex flex-col gap-4">
                <Burbuja
                  de="asistente"
                  texto={`¡Hola! Soy el asistente virtual de Zazu. Puedo ayudarte con el estado, el pago o la entrega de tu pedido${pedido?.codigo ? ` ${pedido.codigo}` : ''}. ¿En qué te ayudo?`}
                />

                {chat.mensajes.map((m) => (
                  <Burbuja key={m.id} de={m.de} texto={m.texto} fecha={m.fecha} />
                ))}

                {chat.pendientes.map((p) => (
                  <Burbuja
                    key={p.clave}
                    de="cliente"
                    texto={p.texto}
                    pendiente={p}
                    onReintentar={() => chat.reintentar(p)}
                    onDescartar={() => chat.descartar(p)}
                  />
                ))}

                {chat.esperandoRespuesta && !atiendeAsesor && <Escribiendo />}

                {chat.esperandoRespuesta && atiendeAsesor && (
                  <p className="mb-0 rounded-xl bg-violet-50 px-3 py-2.5 text-center text-xs text-violet-900">
                    Un asesor de Zazu te responderá en este chat. Puedes cerrarlo: tus mensajes quedan
                    guardados y los verás cuando vuelvas a consultar tu pedido.
                  </p>
                )}

                {sinMensajes && (
                  <div className="flex flex-wrap gap-2">
                    {SUGERENCIAS.map((sugerencia) => (
                      <button
                        key={sugerencia}
                        type="button"
                        onClick={() => enviar(sugerencia)}
                        className="cursor-pointer rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50"
                      >
                        {sugerencia}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={finalRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); enviar() }}
            className="flex shrink-0 items-end gap-2 border-t border-gray-200 px-3 py-3"
          >
            <textarea
              ref={campoRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, MAX_CARACTERES))}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="Escribe tu consulta…"
              rows={1}
              disabled={chat.estado !== 'listo'}
              aria-label="Tu mensaje"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={chat.estado !== 'listo' || !texto.trim()}
              aria-label="Enviar mensaje"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border-0 bg-violet-700 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendOutlined />
            </button>
          </form>
        </section>
      )}
    </SoporteChatContext.Provider>
  )
}
