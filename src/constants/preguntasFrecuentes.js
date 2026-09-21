// Preguntas frecuentes de la página de resultado del tracking, por tipo de
// envío — el cliente que rastrea un Delivery y uno de Courier tienen dudas
// distintas (hora del día vs. cuántos días). Arrays y no un objeto fijo de una
// sola pregunta: así una nueva entrada es agregar un elemento, no tocar el
// componente que las pinta.
export const FAQ_DELIVERY = [
  {
    pregunta: 'Horario de Entrega',
    respuesta:
      'No hay una hora fija de entrega, trabajamos mediante un rango de horario de 11 AM a 8 PM.',
  },
]

export const FAQ_COURIER = [
  {
    pregunta: 'Fecha de Entrega',
    respuesta:
      'Trabajamos junto a nuestro aliado Shalom, según sus indicaciones, el pedido llega a su destino entre 24 y 72 horas.',
  },
]

export function preguntasPara(tipoEnvio) {
  return tipoEnvio?.toUpperCase() === 'COURIER' ? FAQ_COURIER : FAQ_DELIVERY
}
