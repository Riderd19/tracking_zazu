import { EyeOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import { WHATSAPP_SOPORTE_LINK } from "../constants/soporte";
import OrderItemsSummary from "./OrderItemsSummary";

function Fila({ label, valor }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-900">{valor}</span>
    </div>
  );
}

// Tarjeta de estado genérica para los pasos previos a "en ruta" (Pedido
// registrado, Preparando pedido) — mismo look que CourierTrackingCard, pero
// sin datos de courier. El detalle se abre en un modal para mantener limpia
// esta vista y evitar una columna adicional junto a la ilustración.
export default function StatusInfoCard({
  pedido,
  badgeIcon,
  badgeTexto,
  titulo,
  fecha,
  descripcion,
  campos,
  className = "",
}) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  return (
    <>
      <div
        className={`w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}
      >
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
        {badgeIcon}
        {badgeTexto}
      </div>

      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">
        {titulo}
      </h2>
      {fecha && (
        <p className="mb-2 text-xs font-medium text-gray-500">{fecha}</p>
      )}
      <p className="mb-3 text-xs leading-5 text-gray-500">{descripcion}</p>

      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {campos.map(({ label, valor }) => (
          <Fila key={label} label={label} valor={valor} />
        ))}
      </div>

        <Button
          type="primary"
          className="mt-4 h-10! bg-[#5C009C]! text-xs! font-semibold!"
          icon={<EyeOutlined />}
          onClick={() => setDetalleAbierto(true)}
          block
        >
          Click para ver el detalle de tu pedido
        </Button>

        <a
        className="mt-2 block"
        href={WHATSAPP_SOPORTE_LINK}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className="h-10! text-xs! font-semibold!"
          icon={<WhatsAppOutlined />}
          block
        >
          ¿Necesitas ayuda?
        </Button>
        </a>
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
        <div className="mt-5">
          {pedido?.articulos?.length > 0 ? (
            <OrderItemsSummary pedido={pedido} inicialmenteAbierto />
          ) : (
            <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
              No hay artículos disponibles para mostrar.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
