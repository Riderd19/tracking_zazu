import { createContext, useContext } from 'react'

// Lo que el resto de la página necesita del chat para ofrecerlo: abrirlo y
// cuántas respuestas no leídas tiene. Lo provee ChatDelPedido.
export const SoporteChatContext = createContext(null)

/** null fuera de ChatDelPedido: quien lo use no muestra nada. */
export function useSoporteChat() {
  return useContext(SoporteChatContext)
}
