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
