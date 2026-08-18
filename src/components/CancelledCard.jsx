import {
  CloseCircleFilled,
  CreditCardOutlined,
  FileTextOutlined,
  InfoCircleFilled,
  SyncOutlined,
} from "@ant-design/icons";
import { formatearFecha } from "../utils/fecha";
import { WHATSAPP_SOPORTE_LINK } from "../constants/soporte";

function dato(pedido, nombres, respaldo) {
  const encontrado = nombres.map((nombre) => pedido?.[nombre]).find(Boolean);
  return encontrado ?? respaldo;
}

function Fila({ icono, label, valor, destacado = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3 text-gray-700">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          {icono}
        </span>
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <span
        className={`text-right text-xs ${
          destacado
            ? "rounded-md border border-red-400 bg-red-50 px-2 py-1 font-medium text-red-600"
            : "font-medium text-gray-600"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

export default function CancelledCard({ pedido }) {
  const eventoCancelado = pedido?.timeline
    ?.filter((evento) =>
      ["cancelado", "anulado"].includes(evento?.codigo),
    )
    .at(-1);
  const fechaCancelacion = dato(
    pedido,
    ["fecha_cancelacion", "fecha_anulacion"],
    eventoCancelado?.fecha,
  );
  const motivo = dato(
    pedido,
    ["motivo_cancelacion", "motivo_anulacion", "motivo"],
    "Solicitud del cliente",
  );
  const reembolso = dato(
    pedido,
    ["estado_reembolso", "reembolso"],
    "En proceso",
  );

  return (
    <article className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-red-400 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <CloseCircleFilled />
        Pedido anulado
      </div>

      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">
        Tu pedido ha sido anulado
      </h2>
      {fechaCancelacion && (
        <p className="mb-3 text-xs font-medium text-gray-500">
          {formatearFecha(fechaCancelacion)}
        </p>
      )}
      <p className="mb-3 text-xs leading-5 text-gray-600">
        Hemos confirmado tu solicitud de anulación. La compra será cancelada
        y se gestionará el reembolso según el método de pago utilizado.
      </p>

      <div className="divide-y divide-gray-100 border-y border-gray-200">
        <Fila
          icono={<InfoCircleFilled />}
          label="Motivo"
          valor={motivo}
        />
        <Fila
          icono={<FileTextOutlined />}
          label="Código"
          valor={pedido.codigo_courier || "No Disponible"}
        />
        <Fila
          icono={<SyncOutlined />}
          label="Fecha de solicitud"
          valor={formatearFecha(fechaCancelacion) ?? "No disponible"}
        />
        <Fila
          icono={<CloseCircleFilled />}
          label="Estado actual"
          valor="Anulado"
          destacado
        />
        <Fila
          icono={<CreditCardOutlined />}
          label="Reembolso"
          valor={reembolso}
        />
      </div>

      <a
        href={WHATSAPP_SOPORTE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-10 items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900 transition-colors hover:border-violet-300 hover:text-violet-700"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[11px] text-white">
          ?
        </span>
        ¿Necesitas ayuda?
      </a>
    </article>
  );
}
