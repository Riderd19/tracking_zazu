// El "lugar" de un pedido (sede de entrega o dirección del destinatario) a veces
// llega como un solo string con 3 segmentos separados por " - ": agencia -
// nombre/sucursal - departamento/provincia/distrito (ej. "SHALOM - AV
// CHARCANI - AREQUIPA / AREQUIPA / CAYMA"). Estos helpers separan esos
// segmentos para mostrar cada parte donde corresponde, sin la ubicación
// política completa.
export function segmentosAgencia(valor) {
  return (valor ?? '').split(' - ').map((s) => s.trim()).filter(Boolean)
}

// Agencia + su sucursal (los primeros dos segmentos), sin la ubicación
// política. Si el valor no trae ese formato, se devuelve tal cual.
export function nombreYAgencia(valor) {
  const segmentos = segmentosAgencia(valor)
  return segmentos.length > 0 ? segmentos.slice(0, 2).join(' - ') : (valor ?? '')
}

// Solo la agencia (primer segmento) — para textos como "Rastrear en Shalom".
export function agenciaBase(valor) {
  return segmentosAgencia(valor)[0] ?? (valor ?? '')
}

// Etiqueta de "Tipo de entrega" según los 4 tipos de envío reales (ver
// TipoEnvio en el backend) — para COURIER se usa la agencia de destino en
// vez del código genérico, igual que el resto del tracking.
export function tipoEntrega(tipoEnvio, lugar) {
  const codigo = tipoEnvio?.toUpperCase()
  if (codigo === 'COURIER') return `Agencia ${agenciaBase(lugar) || 'por confirmar'}`
  if (codigo === 'DELIVERY') return 'Delivery a domicilio'
  if (codigo === 'ENTREGA_ALMACEN') return 'Entrega en almacén'
  if (codigo === 'RECOJO_TIENDA') return 'Recojo en tienda'
  return 'Pendiente'
}
