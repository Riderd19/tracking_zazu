export const CODIGO_PEDIDO_ANULADO_DEMO = "DEMO/ANULADO";
export const IDENTIFICADOR_PEDIDO_ANULADO_DEMO = "12345678";

export const PEDIDO_ANULADO_DEMO = {
  codigo: "OS-7K29P4",
  destinatario_nombre: "Daniel Inche T.",
  destinatario_direccion: "Shalom Surquillo",
  empresa: "Bravos",
  tipo_envio: "COURIER",
  codigo_courier: "89276338",
  fecha_pedido: "2026-06-22T10:15:00-05:00",
  fecha_despacho: "2026-06-22T12:05:00-05:00",
  fecha_en_ruta: "2026-06-22T12:05:00-05:00",
  fecha_envio: null,
  fecha_cancelacion: "2026-06-22T15:45:00-05:00",
  motivo_cancelacion: "Solicitud del cliente",
  estado_reembolso: "En proceso",
  estado_actual: {
    codigo: "cancelado",
    nombre: "Pedido anulado",
  },
  timeline: [
    { codigo: "pendiente", fecha: "2026-06-22T10:15:00-05:00" },
    { codigo: "despachado", fecha: "2026-06-22T12:05:00-05:00" },
    { codigo: "en_ruta", fecha: "2026-06-22T12:05:00-05:00" },
    { codigo: "cancelado", fecha: "2026-06-22T15:45:00-05:00" },
  ],
  articulos: [],
  saldo_pendiente: 0,
  total_pagado: 0,
};
