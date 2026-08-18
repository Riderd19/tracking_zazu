import { FileDoneOutlined } from "@ant-design/icons";
import { tipoEntrega } from "../utils/agencia";
import { formatearFecha } from "../utils/fecha";
import StatusInfoCard from "./StatusInfoCard";

// Pedidos en "en_gestión" (pendiente/confirmado/registrado/etc., ver
// EN_GESTION en OrderTimeline): el primer paso del tracking, la venta ya se
// registró pero el pedido todavía no pasó a Empaquetado y Entrega.
export default function RegisteredCard({ pedido, lugar, className = "" }) {
  const { codigo, tipo_envio: tipoEnvio, fecha_pedido: fechaPedido } = pedido;

  return (
    <StatusInfoCard
      pedido={pedido}
      className={className}
      badgeIcon={<FileDoneOutlined />}
      badgeTexto="Pedido Registrado"
      titulo="Tu pedido fue registrado correctamente"
      fecha={formatearFecha(fechaPedido)}
      descripcion="En breve comenzaremos a preparar tu pedido para su entrega."
      campos={[
        { label: "Pedido", valor: codigo },
        tipoEnvio?.toUpperCase() === "COURIER" && {
          label: "Código",
          valor: pedido.codigo_courier || "No Disponible",
        },
        { label: "Tipo de entrega", valor: tipoEntrega(tipoEnvio, lugar) },
        { label: "Próximo paso", valor: "Preparando pedido" },
      ].filter(Boolean)}
    />
  );
}
