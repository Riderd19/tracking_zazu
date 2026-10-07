import { useCallback, useEffect, useRef, useState } from 'react'
import {
  abrirChat,
  ChatSesionVencidaError,
  enviarImagen as subirImagen,
  enviarMensaje,
  traerImagen,
  traerMensajes,
} from '../services/chatService'
import { achicarFoto } from '../utils/achicarFoto'

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

/**
 * Todo el estado del chat del pedido: la sesión, los mensajes, el polling y los
 * envíos que están en camino o fallaron.
 *
 * La sesión se pide la primera vez que el cliente abre el chat, con la misma
 * identidad de la búsqueda (token del enlace o código + DNI/celular). Si vence,
 * se renueva sola con esa identidad: el cliente no vuelve a escribir nada.
 */
export default function useChatDelPedido(identidad, abierto) {
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
  // Fotos ya traídas (o recién subidas), por id de mensaje: los mensajes no
  // cambian, así que cada foto se baja una sola vez.
  const fotosRef = useRef(new Map())

  // Las URLs de blob viven hasta que se cierra la página, salvo que se suelten.
  useEffect(() => {
    const fotos = fotosRef.current
    return () => {
      fotos.forEach((url) => URL.revokeObjectURL(url))
      fotos.clear()
    }
  }, [])

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
    return datos.sesion
  }, [identidad, aplicarEstado, recibir])

  // Corre `accion` con la sesión vigente y, si venció, la renueva y reintenta una vez.
  const conSesion = useCallback(async (accion) => {
    try {
      return await accion(sesionRef.current ?? (await abrirSesion()))
    } catch (err) {
      if (!(err instanceof ChatSesionVencidaError)) throw err
      return accion(await abrirSesion())
    }
  }, [abrirSesion])

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

  const mandar = useCallback(async ({ clave, texto, opcion, foto }) => {
    try {
      const datos = await conSesion((sesion) => (
        foto ? subirImagen(sesion, foto.blob) : enviarMensaje(sesion, texto, opcion)
      ))
      // La foto que se acaba de subir ya está en el navegador: no se vuelve a bajar.
      if (foto) fotosRef.current.set(datos.mensaje.id, foto.url)
      aplicarEstado(datos)
      recibir([datos.mensaje])
      setPendientes((previos) => previos.filter((p) => p.clave !== clave))
    } catch (err) {
      setPendientes((previos) => previos.map((p) => (
        p.clave === clave ? { ...p, estado: 'error', motivo: err.message } : p
      )))
    }
  }, [conSesion, aplicarEstado, recibir])

  /**
   * Envía lo que escribió el cliente. Se ve en el hilo al instante.
   * `opcion` es la clave de un mensaje predefinido, si tocó uno.
   */
  const enviar = useCallback((texto, opcion = null) => {
    const limpio = (texto ?? '').trim()
    if (!limpio || estado !== 'listo') return false

    const pendiente = { clave: nuevaClave(), texto: limpio, opcion, estado: 'enviando' }
    setPendientes((previos) => [...previos, pendiente])
    mandar(pendiente)
    return true
  }, [estado, mandar])

  /**
   * Envía una foto que eligió el cliente. Se achica antes de subirla y se ve en
   * el hilo al instante. Rechaza si el archivo no es una imagen que el navegador
   * pueda leer: quien llama le muestra el motivo al cliente.
   */
  const enviarFoto = useCallback(async (archivo) => {
    if (!archivo || estado !== 'listo') return

    let blob
    try {
      blob = await achicarFoto(archivo)
    } catch {
      throw new Error('No pudimos leer esa foto. Prueba con otra en JPG o PNG.')
    }

    const pendiente = {
      clave: nuevaClave(),
      texto: '',
      foto: { blob, url: URL.createObjectURL(blob) },
      estado: 'enviando',
    }
    setPendientes((previos) => [...previos, pendiente])
    mandar(pendiente)
  }, [estado, mandar])

  /** La URL de la foto de un mensaje, bajándola con la sesión la primera vez. */
  const cargarFoto = useCallback(async (mensajeId) => {
    const guardada = fotosRef.current.get(mensajeId)
    if (guardada) return guardada

    const blob = await conSesion((sesion) => traerImagen(sesion, mensajeId))
    const url = URL.createObjectURL(blob)
    fotosRef.current.set(mensajeId, url)
    return url
  }, [conSesion])

  const reintentar = useCallback((pendiente) => {
    setPendientes((previos) => previos.map((p) => (
      p.clave === pendiente.clave ? { ...p, estado: 'enviando', motivo: null } : p
    )))
    mandar(pendiente)
  }, [mandar])

  const descartar = useCallback((pendiente) => {
    if (pendiente.foto) URL.revokeObjectURL(pendiente.foto.url)
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
    enviarFoto,
    cargarFoto,
    reintentar,
    descartar,
  }
}
