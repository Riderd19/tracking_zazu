import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Spin } from 'antd'
import {
  CustomerServiceOutlined,
  ExclamationCircleFilled,
  MinusOutlined,
  PictureOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons'
import useChatDelPedido from '../../hooks/useChatDelPedido'
import { SoporteChatContext } from './soporteChatContext'

const MAX_CARACTERES = 1000

// Mensajes que el cliente puede mandar con un toque. Todos tienen respuesta
// fija en el backend, sin IA (ver ChatWebDelPedido::OPCIONES): la IA queda
// solo para lo que el cliente escribe con sus palabras.
//  - ayuda_pago: los pasos para pagar el saldo con Ligo Pay.
//  - cuando_llega: en qué va el envío y su fecha, con los datos del tracking.
//  - problema_clave: pide que describa el problema y lo pasa a Soporte.
//  - hablar_con_asesor: pasa el chat a un asesor.
// `soloShalom`: la clave de recojo existe solo en los envíos por Shalom.
const MENSAJES_PREDEFINIDOS = [
  { texto: 'Necesito ayuda con el pago', opcion: 'ayuda_pago' },
  { texto: '¿Cuándo llega mi pedido?', opcion: 'cuando_llega' },
  { texto: 'Tengo problemas con mi clave', opcion: 'problema_clave', soloShalom: true },
  { texto: 'Quiero hablar con un asesor', opcion: 'hablar_con_asesor' },
]

const AUTOR = {
  asistente: { nombre: 'Asistente virtual', icono: RobotOutlined },
  asesor: { nombre: 'Asesor de Zazu', icono: CustomerServiceOutlined },
}

function hora(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' })
}

/**
 * La foto de un mensaje. Se baja con la sesión del chat (no hay URL pública) y
 * solo cuando el mensaje se muestra; `url` viene ya resuelta en las fotos que el
 * cliente está subiendo.
 */
function Foto({ url: urlInicial, mensajeId, cargar }) {
  const [url, setUrl] = useState(urlInicial ?? null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    if (url || !mensajeId) return undefined
    let vigente = true
    cargar(mensajeId)
      .then((u) => { if (vigente) setUrl(u) })
      .catch(() => { if (vigente) setFallo(true) })
    return () => { vigente = false }
  }, [url, mensajeId, cargar])

  if (fallo) {
    return (
      <span className="flex items-center gap-1.5 text-xs opacity-80">
        <PictureOutlined /> No se pudo cargar la foto
      </span>
    )
  }

  if (!url) {
    return <span className="flex h-40 w-40 items-center justify-center"><Spin size="small" /></span>
  }

  return (
    // Se abre en otra pestaña para verla completa.
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img src={url} alt="Foto que enviaste" className="block max-h-64 max-w-full rounded-xl object-contain" />
    </a>
  )
}

function Burbuja({ de, texto, fecha, foto, pendiente, onReintentar, onDescartar }) {
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
        className={`max-w-[85%] rounded-2xl text-sm leading-relaxed whitespace-pre-line break-words ${
          foto ? 'p-1' : 'px-3.5 py-2.5'
        } ${
          delCliente ? 'rounded-br-md bg-violet-700 text-white' : 'rounded-bl-md bg-gray-100 text-gray-900'
        } ${pendiente?.estado === 'enviando' ? 'opacity-70' : ''}`}
      >
        {foto ? <Foto {...foto} /> : texto}
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
 * celular, el botón flotante de acá. Minimizado, el chat queda como ese botón
 * flotante también en escritorio, con el globito de mensajes sin leer.
 *
 * Aparece solo con el pedido ya verificado —por el enlace o por nota de venta +
 * DNI/celular— y usa esa misma identidad para abrir la conversación. Como la
 * conversación es del pedido, el cliente que vuelve otro día y verifica de nuevo
 * encuentra todo lo que ya habló.
 */
export default function ChatDelPedido({ pedido, identidad, children }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  // Por qué no se pudo mandar la foto elegida, si no se pudo ni empezar.
  const [avisoFoto, setAvisoFoto] = useState(null)
  const finalRef = useRef(null)
  const campoRef = useRef(null)
  const fotoRef = useRef(null)

  const chat = useChatDelPedido(identidad, abierto, pedido?.codigo)
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

  // Escape minimiza, como cualquier ventana.
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e) => { if (e.key === 'Escape') setAbierto(false) }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto])

  const enviar = () => {
    if (chat.enviar(texto)) setTexto('')
  }

  const alElegirFoto = async (e) => {
    const archivo = e.target.files?.[0]
    // Se limpia para poder elegir la misma foto otra vez.
    e.target.value = ''
    if (!archivo) return

    setAvisoFoto(null)
    try {
      await chat.enviarFoto(archivo)
    } catch (err) {
      setAvisoFoto(err.message)
    }
  }

  const atiendeAsesor = chat.atiende === 'asesor'
  // En escritorio el botón flotante aparece recién cuando hay conversación
  // (el chat se abrió y se minimizó, o se retomó con mensajes): antes de eso ya
  // está el botón grande "Contacta Soporte" de la vista.
  const flotanteEnEscritorio = chat.estado !== 'inactivo' || chat.noLeidos > 0
  // Con un asesor atendiendo no van: la respuesta fija sería del asistente, y
  // dos voces en el mismo chat confunden. Mientras se espera una respuesta
  // tampoco, para no apilar preguntas sin contestar.
  const conPredefinidos = chat.estado === 'listo' && !atiendeAsesor && !chat.esperandoRespuesta

  return (
    <SoporteChatContext.Provider value={soporte}>
      {children}

      {!abierto && (
        <button
          type="button"
          onClick={abrir}
          title="Chat de soporte"
          aria-label={
            chat.noLeidos > 0
              ? `Abrir el chat de soporte: ${chat.noLeidos} ${chat.noLeidos === 1 ? 'mensaje' : 'mensajes'} sin leer`
              : 'Abrir el chat de soporte'
          }
          className={`fixed right-4 bottom-4 z-[1000] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-violet-700 text-2xl text-white shadow-lg shadow-violet-900/30 transition hover:scale-105 hover:bg-violet-800 sm:right-6 sm:bottom-6 ${
            flotanteEnEscritorio ? '' : 'md:hidden'
          }`}
        >
          {chat.noLeidos > 0 && (
            <span className="absolute inset-0 animate-ping rounded-full bg-violet-500 opacity-30 motion-reduce:animate-none" />
          )}
          <CustomerServiceOutlined className="relative" />
          {chat.noLeidos > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
              {chat.noLeidos > 9 ? '9+' : chat.noLeidos}
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
            {/* Minimiza, no cierra: la conversación sigue y queda el botón
                flotante para volver. */}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Minimizar el chat"
              title="Minimizar"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white hover:bg-white/15"
            >
              <MinusOutlined />
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
                  <Burbuja
                    key={m.id}
                    de={m.de}
                    texto={m.texto}
                    fecha={m.fecha}
                    foto={m.imagen ? { mensajeId: m.id, cargar: chat.cargarFoto } : null}
                  />
                ))}

                {chat.pendientes.map((p) => (
                  <Burbuja
                    key={p.clave}
                    de="cliente"
                    texto={p.texto}
                    foto={p.foto ? { url: p.foto.url } : null}
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

                <div ref={finalRef} />
              </div>
            )}
          </div>

          {conPredefinidos && (
            <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-gray-100 px-3 pt-3 pb-1" aria-label="Mensajes rápidos">
              {MENSAJES_PREDEFINIDOS.filter((p) => !p.soloShalom || pedido?.es_shalom).map((predefinido) => (
                <button
                  key={predefinido.texto}
                  type="button"
                  onClick={() => chat.enviar(predefinido.texto, predefinido.opcion)}
                  className="shrink-0 cursor-pointer rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-violet-700 hover:bg-violet-50"
                >
                  {predefinido.texto}
                </button>
              ))}
            </div>
          )}

          {avisoFoto && (
            <p role="alert" className="mx-3 mt-2 mb-0 flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <ExclamationCircleFilled className="mt-0.5" />
              <span className="flex-1">{avisoFoto}</span>
              <button
                type="button"
                onClick={() => setAvisoFoto(null)}
                aria-label="Cerrar el aviso"
                className="cursor-pointer border-0 bg-transparent p-0 text-red-700"
              >
                <CloseOutlined />
              </button>
            </p>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); enviar() }}
            className={`flex shrink-0 items-end gap-2 px-3 py-3 ${conPredefinidos ? '' : 'border-t border-gray-200'}`}
          >
            {/* Una captura del pago, el producto que llegó, la pantalla de la
                agencia: la ve el asesor en el módulo Chat. */}
            <input
              ref={fotoRef}
              type="file"
              accept="image/*"
              onChange={alElegirFoto}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => fotoRef.current?.click()}
              disabled={chat.estado !== 'listo'}
              aria-label="Enviar una foto"
              title="Enviar una foto"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white text-lg text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PictureOutlined />
            </button>
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
