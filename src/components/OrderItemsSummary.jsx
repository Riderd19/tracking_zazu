import { useState } from 'react'
import { DownOutlined, UpOutlined, ShoppingOutlined, SafetyCertificateOutlined } from '@ant-design/icons'

// `nombre`/`variante` vienen tal cual del CRM (ticket_productos.nombre_crm /
// variante_crm) — no hay talla/color como campos separados en el dato real,
// vienen embebidos en un solo texto ("Color: Negro / Talla: L"). El CRM manda
// una línea por color (mismo producto+talla repetido varias veces), lo que en
// pantalla se veía como el mismo polo listado N veces — se agrupan por
// nombre+talla y se juntan los colores en una sola fila.
const PATRON_VARIANTE = /Color:\s*(.+?)\s*\/\s*Talla:\s*(.+)/i

function agruparArticulos(articulos) {
  const filas = []
  const posicionPorClave = new Map()

  for (const articulo of articulos) {
    const { nombre, variante, cantidad, precio_unitario } = articulo
    const total = Number(cantidad) * Number(precio_unitario)
    const match = variante?.match(PATRON_VARIANTE)

    // Sin "Color: X / Talla: Y" reconocible (ej. "Servicio de envío", regalos):
    // no hay nada que agrupar, se deja tal cual llegó.
    if (!match) {
      filas.push({ nombre, talla: null, colores: new Map(), cantidad: Number(cantidad), total })
      continue
    }

    const [, color, talla] = match
    const colorTrim = color.trim()
    const clave = `${nombre}__${talla.trim()}`
    const posicion = posicionPorClave.get(clave)

    if (posicion === undefined) {
      posicionPorClave.set(clave, filas.length)
      filas.push({
        nombre,
        talla: talla.trim(),
        colores: new Map([[colorTrim, Number(cantidad)]]),
        cantidad: Number(cantidad),
        total,
      })
    } else {
      const fila = filas[posicion]
      fila.colores.set(colorTrim, (fila.colores.get(colorTrim) ?? 0) + Number(cantidad))
      fila.cantidad += Number(cantidad)
      fila.total += total
    }
  }

  return filas
}

function Articulo({ fila }) {
  const { nombre, talla, colores, cantidad, total } = fila

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="mb-0 text-sm font-semibold text-gray-900">{nombre}</p>
        <p className="mb-0 shrink-0 text-sm font-semibold text-violet-700">S/ {total.toFixed(2)}</p>
      </div>
      <div className="mt-1 flex flex-col gap-1.5 text-xs text-gray-500">
        <p className="mb-0">
          Cantidad: {cantidad}
          {talla && ` · Talla: ${talla}`}
        </p>
        {colores.size > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-gray-50 px-2.5 py-2">
            {[...colores].map(([color, cant]) => (
              <div key={color} className="flex items-center justify-between gap-2">
                <span className="truncate">{color}</span>
                <span className="shrink-0 font-semibold text-gray-700">{cant}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Detalle de artículos del ticket — el backend público de tracking hoy no
// manda esto (ver TrackingPublicController), así que se oculta solo si
// `pedido.articulos` no llega, igual que Código/Guía con el courier.
export default function OrderItemsSummary({ pedido }) {
  const [detalleAbierto, setDetalleAbierto] = useState(true)
  const { articulos, total_pagado, metodo_pago, tipo_pago } = pedido

  if (!articulos?.length) return null

  // "Pago Completo" (ver TrackingPublicController::datosPedido en el backend)
  // significa que ya no hay nada por cobrar contra entrega — el aviso de
  // seguridad de pago solo aplica cuando todavía va a haber un cobro.
  const pagoCompleto = tipo_pago === 'Pago Completo'

  const filas = agruparArticulos(articulos)

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-5">
      <p className="mb-0 text-sm font-semibold text-gray-900">Resumen de tu pedido</p>

      <button
        type="button"
        onClick={() => setDetalleAbierto((v) => !v)}
        className="mt-3 flex w-full items-center justify-between gap-2 border-0 bg-transparent p-0 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm text-gray-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <ShoppingOutlined />
          </span>
          {articulos.length} artículo{articulos.length === 1 ? '' : 's'}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-violet-600">
          {detalleAbierto ? 'Detalles' : 'Ver Detalles'}
          {detalleAbierto ? <UpOutlined /> : <DownOutlined />}
        </span>
      </button>

      {detalleAbierto && (
        // Sin límite de alto: agrupar por nombre+talla ya reduce las 10+ líneas
        // crudas del CRM a un puñado de filas, así que cortar con scroll acá
        // solo escondía artículos a medias. Mejor que la tarjeta crezca entera.
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {filas.map((fila, i) => (
            <Articulo key={`${fila.nombre}-${fila.talla}-${i}`} fila={fila} />
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Total pagado</span>
        <span className="text-lg font-bold text-violet-700">S/ {Number(total_pagado).toFixed(2)}</span>
      </div>

      {metodo_pago && (
        <div className="mt-3 flex items-center justify-between gap-2 text-sm">
          <span className="text-gray-500">Método de pago</span>
          <span className="text-right font-medium text-gray-900">{metodo_pago}</span>
        </div>
      )}

      {!pagoCompleto && (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <SafetyCertificateOutlined className="text-emerald-500" />
          Tus pagos están 100% seguros
        </div>
      )}
    </div>
  )
}
