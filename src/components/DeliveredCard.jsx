import {
  CalendarOutlined,
  CheckCircleFilled,
  EnvironmentFilled,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons'
import { Button, Modal } from 'antd'
import { useState } from 'react'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'
import { nombreYAgencia } from '../utils/agencia'
import { formatearFecha } from '../utils/fecha'
import OrderItemsSummary from './OrderItemsSummary'

function fechaEntrega(pedido) {
  const hito = pedido.timeline?.find((item) => item.codigo === 'entregado')
  return pedido.fecha_entregado_zazu1 ?? pedido.fecha_entrega_real ?? hito?.fecha ?? pedido.fecha_actualizacion ?? null
}

export default function DeliveredCard({ pedido }) {
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const fecha = formatearFecha(fechaEntrega(pedido))
  const esCourier = pedido.tipo_envio?.toUpperCase() === 'COURIER'
  const lugarCompleto = pedido.sede_entrega?.nombre
    ?? pedido.sede_entrega?.direccion
    ?? pedido.destinatario_direccion
    ?? 'Dirección registrada del pedido'
  const lugar = nombreYAgencia(lugarCompleto)

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:justify-center md:gap-8 md:px-[8%] lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)]">
        <div className="relative z-10 w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircleFilled />
            Entrega completada
          </div>

          <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">Pedido entregado</h2>
          {fecha && <p className="mb-2 text-xs font-medium text-gray-500">{fecha}</p>}
          <p className="mb-3 text-xs leading-5 text-gray-500">
            Tu pedido fue entregado correctamente. Gracias por confiar en Zazu Express.
          </p>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {esCourier && (
              <div className="flex items-start gap-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                  <FileTextOutlined />
                </span>
                <div>
                  <p className="mb-0.5 text-xs font-medium text-gray-400">Código</p>
                  <p className="mb-0 text-xs font-semibold text-gray-700">
                    {pedido.codigo_courier || 'No Disponible'}
                  </p>
                </div>
              </div>
            )}

            {esCourier && (
              <div className="flex items-start gap-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                  <FileDoneOutlined />
                </span>
                <div>
                  <p className="mb-0.5 text-xs font-medium text-gray-400">Guía</p>
                  <p className="mb-0 text-xs font-semibold text-gray-700">
                    {pedido.guia_courier || 'Pendiente'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                <EnvironmentFilled />
              </span>
              <div className="min-w-0">
                <p className="mb-0.5 text-xs font-medium text-gray-400">Lugar de entrega</p>
                <p className="mb-0 text-xs font-semibold leading-5 text-gray-700">{lugar}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                <CalendarOutlined />
              </span>
              <div>
                <p className="mb-0.5 text-xs font-medium text-gray-400">Fecha de entrega</p>
                <p className="mb-0 text-xs font-semibold text-gray-700">{fecha ?? 'Fecha no disponible'}</p>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            className="mt-4 h-10! bg-[#5C009C]! text-xs! font-semibold!"
            icon={<EyeOutlined />}
            onClick={() => setDetalleAbierto(true)}
            block
          >
            Ver detalle del pedido
          </Button>

          <a className="mt-2 block" href={WHATSAPP_SOPORTE_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="h-9! text-xs! font-semibold!" icon={<WhatsAppOutlined />} block>
              ¿Necesitas ayuda con tu entrega?
            </Button>
          </a>
        </div>

        <div className="relative flex h-64 items-end justify-center overflow-hidden md:h-105">
          <span className="absolute left-[12%] top-[18%] h-28 w-28 rounded-full bg-violet-100/50 blur-3xl" />
          <img
            src="/images/pedido-entregado-zazu.png"
            alt="Repartidor de Zazu entregando el pedido a la clienta"
            className="relative z-10 h-full w-full object-contain object-center drop-shadow-[0_18px_24px_rgba(76,29,149,0.1)]"
          />
        </div>
      </div>

      <Modal
        title="Detalle de tu pedido"
        open={detalleAbierto}
        onCancel={() => setDetalleAbierto(false)}
        footer={null}
        width={560}
        centered
        destroyOnHidden
      >
        <div className="mt-5 flex flex-col gap-4">
          {pedido.articulos?.length > 0 ? (
            <OrderItemsSummary pedido={pedido} inicialmenteAbierto />
          ) : (
            <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
              No hay artículos disponibles para mostrar.
            </p>
          )}
        </div>
      </Modal>
    </section>
  )
}
