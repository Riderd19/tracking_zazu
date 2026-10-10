import {
  CloseCircleFilled,
  FileTextOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { formatearFecha } from "../../utils/fecha";
import CourierShalomExtras from "../shalom/CourierShalomExtras";

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
            ? "rounded-md border border-red-400 bg-red-50 px-2 py-1 font-semibold text-red-600"
            : "font-semibold text-gray-600"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

export default function CancelledCard({ pedido, identidad }) {
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
  return (
    <article className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-red-400 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
        <CloseCircleFilled />
        Pedido anulado
      </div>

      <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900">
        Tu pedido ha sido anulado
      </h2>
      {fechaCancelacion && (
        <p className="mb-3 text-xs font-semibold text-gray-500">
          {formatearFecha(fechaCancelacion)}
        </p>
      )}
      <p className="mb-3 text-xs leading-5 text-gray-600">
        Hemos confirmado tu solicitud de anulación. La compra será cancelada
        y se gestionará el reembolso según el método de pago utilizado.
      </p>

      <div className="divide-y divide-gray-100 border-y border-gray-200">
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
      </div>

      <div className="mt-4">
        <CourierShalomExtras pedido={pedido} identidad={identidad} />
      </div>
    </article>
  );
}
