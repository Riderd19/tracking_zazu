// Códigos viejos de pedidos.estado (confirmado, en_preparacion, listo,
// procesado, registrado, solicitud_portal, asignado, recepcionado) que caen
// en el paso "Pedido Registrado" del timeline — ver OrderTimeline.jsx y el fallback
// del backend para pedidos sin ticket vinculado.
export const EN_GESTION = [
  "pendiente",
  "confirmado",
  "registrado",
  "solicitud_portal",
  "procesado",
  "en_preparacion",
  "listo",
  "asignado",
  "recepcionado",
];

// `pedidos.estado_id` con los que el cliente ya puede pagar su saldo antes de
// que el pedido salga en ruta: la tarjeta de pago aparece también en las de
// Registrado y Preparando. En ruta se ofrece siempre (ver ResumenLateral).
// Son ids de la tabla `estados` en producción: 2 = registrado, 3 = despachado.
export const ESTADOS_ID_CON_PAGO = [2, 3];
