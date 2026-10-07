import { useCallback, useEffect, useRef, useState } from 'react'
import {
  abrirChat,
  ChatSesionVencidaError,
  enviarMensaje,
  traerMensajes,
} from '../services/chatService'

// Cada cuánto se buscan mensajes nuevos. Con el chat abierto, rápido: el cliente
// está esperando la respuesta. Cerrado, lo justo para avisarle con el globito que
// el asesor le contestó.
const POLLING_ABIERTO_MS = 4000
const POLLING_CERRADO_MS = 20000

// Junta los mensajes nuevos con los que ya había, sin duplicar: el polling y la
// respuesta del envío pueden traer el mismo mensaje.
function juntar(previos, nuevos) {
  if (!nuevos?.length) return previos
  const porId = new Map(previos.map((m) => [m.id, m]))
  nuevos.forEach((m) => porId.set(m.id, m))
  return [...porId.values()].sort((a, b) => a.id - b.id)
}

let contadorClaves = 0
const nuevaClave = () => `pendiente-${Date.now()}-${++contadorClaves}`

// Hasta qué mensaje vio el cliente, por pedido y en este navegador. Que exista
// dice además que ese pedido ya tiene conversación: abrir el chat la crea en el
// Inbox (ChatWebDelPedido::abrir), así que solo se retoma sola la de quien ya
// la abrió alguna vez — si no, cada consulta del tracking le dejaría un chat
// vacío al asesor. Sin almacenamiento (modo privado), el globito cuenta solo lo
// que llega durante la visita.
const claveVisto = (pedido) => `zazu-chat-visto:${pedido}`

function leerVisto(pedido) {
  if (!pedido) return null
  try {
    const valor = localStorage.getItem(claveVisto(pedido))
    return valor === null ? null : Number(valor) || 0
  } catch {
    return null
  }
}

function guardarVisto(pedido, id) {
  if (!pedido) return
  try {
    localStorage.setItem(claveVisto(pedido), String(Math.max(id, leerVisto(pedido) ?? 0)))
  } catch {
    // Sin almacenamiento: no hay a quién avisarle en la próxima visita.
  }
}

const respuestasDespuesDe = (mensajes, visto) =>
  (mensajes ?? []).filter((m) => m.de !== 'cliente' && m.id > visto).length

/**
 * Todo el estado del chat del pedido: la sesión, los mensajes, el polling y los
 * envíos que están en camino o fallaron.
 *
 * La sesión se pide la primera vez que el cliente abre el chat, con la misma
 * identidad de la búsqueda (token del enlace o código + DNI/celular). Si vence,
 * se renueva sola con esa identidad: el cliente no vuelve a escribir nada.
 *
 * Si el cliente ya había abierto el chat de este pedido (en este navegador), la
 * sesión se retoma sola al cargar la página, sin abrir la ventana: así el globito
 * avisa de las respuestas que llegaron mientras no estaba.
 */
export default function useChatDelPedido(identidad, abierto, pedidoCodigo) {
  const [mensajes, setMensajes] = useState([])
  // Lo que el cliente escribió y todavía no confirmó el servidor, o que falló.
  const [pendientes, setPendientes] = useState([])
  const [atiende, setAtiende] = useState('asistente')
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false)
  // 'inactivo' | 'abriendo' | 'listo' | 'error'
  const [estado, setEstado] = useState('inactivo')
  const [error, setError] = useState(null)
  const [noLeidos, setNoLeidos] = useState(0)

  const sesionRef = useRef(null)
  const ultimoIdRef = useRef(0)
  const abiertoRef = useRef(abierto)

  useEffect(() => {
    abiertoRef.current = abierto
  }, [abierto])

  const aplicarEstado = useCallback((datos) => {
    if (datos.atiende) setAtiende(datos.atiende)
    if (typeof datos.esperando_respuesta === 'boolean') setEsperandoRespuesta(datos.esperando_respuesta)
  }, [])

  const recibir = useCallback((nuevos, { contarNoLeidos = false } = {}) => {
    const realmenteNuevos = (nuevos ?? []).filter((m) => m.id > ultimoIdRef.current)
    if (!realmenteNuevos.length) return

    ultimoIdRef.current = Math.max(ultimoIdRef.current, ...realmenteNuevos.map((m) => m.id))
    setMensajes((previos) => juntar(previos, realmenteNuevos))

    if (contarNoLeidos) {
      const respuestas = realmenteNuevos.filter((m) => m.de !== 'cliente').length
      if (respuestas) setNoLeidos((n) => n + respuestas)
    }
  }, [])

  const abrirSesion = useCallback(async () => {
    const datos = await abrirChat(identidad)
    sesionRef.current = datos.sesion
    aplicarEstado(datos)
    recibir(datos.mensajes)
    return datos
  }, [identidad, aplicarEstado, recibir])

  // Corre `accion` con la sesión vigente y, si venció, la renueva y reintenta una vez.
  const conSesion = useCallback(async (accion) => {
    try {
      return await accion(sesionRef.current ?? (await abrirSesion()).sesion)
    } catch (err) {
      if (!(err instanceof ChatSesionVencidaError)) throw err
      return accion((await abrirSesion()).sesion)
    }
  }, [abrirSesion])

  // Retoma sola la conversación que el cliente ya tenía (ver claveVisto). Una
  // sola vez al montar: el chat se monta de nuevo por cada pedido. Si falla, el
  // chat queda como si nunca se hubiera abierto y el botón lo intenta de nuevo.
  const retomadoRef = useRef(false)
  useEffect(() => {
    const visto = leerVisto(pedidoCodigo)
    if (retomadoRef.current || visto === null || !identidad) return
    retomadoRef.current = true

    abrirSesion()
      .then((datos) => {
        setEstado((actual) => (actual === 'inactivo' ? 'listo' : actual))
        if (!abiertoRef.current) setNoLeidos(respuestasDespuesDe(datos.mensajes, visto))
      })
      .catch(() => {
        // Silencioso: es un aviso de cortesía, no algo que el cliente pidió.
      })
  }, [pedidoCodigo, identidad, abrirSesion])

  // Con el chat abierto, todo lo que llega queda visto.
  useEffect(() => {
    if (abierto && estado === 'listo') guardarVisto(pedidoCodigo, mensajes.at(-1)?.id ?? 0)
  }, [abierto, estado, mensajes, pedidoCodigo])

  /** Abre el chat la primera vez (o reintenta si falló). Lo llama el botón. */
  const iniciar = useCallback(async () => {
    setNoLeidos(0)
    if (estado === 'listo' || estado === 'abriendo' || !identidad) return

    setEstado('abriendo')
    setError(null)
    try {
      await abrirSesion()
      setEstado('listo')
    } catch (err) {
      setError(err.message)
      setEstado('error')
    }
  }, [estado, identidad, abrirSesion])

  // Polling: solo con la sesión abierta. Un fallo de red se ignora y se reintenta
  // en el siguiente ciclo, igual que el polling del seguimiento.
  useEffect(() => {
    if (estado !== 'listo') return

    const intervalo = setInterval(async () => {
      try {
        const datos = await conSesion((sesion) => traerMensajes(sesion, ultimoIdRef.current))
        aplicarEstado(datos)
        recibir(datos.mensajes, { contarNoLeidos: !abiertoRef.current })
      } catch {
        // silencioso a propósito
      }
    }, abierto ? POLLING_ABIERTO_MS : POLLING_CERRADO_MS)

    return () => clearInterval(intervalo)
  }, [estado, abierto, conSesion, aplicarEstado, recibir])

  const mandar = useCallback(async (clave, texto) => {
    try {
      const datos = await conSesion((sesion) => enviarMensaje(sesion, texto))
      aplicarEstado(datos)
      recibir([datos.mensaje])
      setPendientes((previos) => previos.filter((p) => p.clave !== clave))
    } catch (err) {
      setPendientes((previos) => previos.map((p) => (
        p.clave === clave ? { ...p, estado: 'error', motivo: err.message } : p
      )))
    }
  }, [conSesion, aplicarEstado, recibir])

  /** Envía lo que escribió el cliente. Se ve en el hilo al instante. */
  const enviar = useCallback((texto) => {
    const limpio = (texto ?? '').trim()
    if (!limpio || estado !== 'listo') return false

    const clave = nuevaClave()
    setPendientes((previos) => [...previos, { clave, texto: limpio, estado: 'enviando' }])
    mandar(clave, limpio)
    return true
  }, [estado, mandar])

  const reintentar = useCallback((pendiente) => {
    setPendientes((previos) => previos.map((p) => (
      p.clave === pendiente.clave ? { ...p, estado: 'enviando', motivo: null } : p
    )))
    mandar(pendiente.clave, pendiente.texto)
  }, [mandar])

  const descartar = useCallback((pendiente) => {
    setPendientes((previos) => previos.filter((p) => p.clave !== pendiente.clave))
  }, [])

  return {
    mensajes,
    pendientes,
    atiende,
    esperandoRespuesta,
    estado,
    error,
    noLeidos,
    iniciar,
    enviar,
    reintentar,
    descartar,
  }
}
