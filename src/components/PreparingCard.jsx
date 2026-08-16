import { InboxOutlined } from "@ant-design/icons";
import { tipoEntrega } from "../utils/agencia";
import { formatearFecha } from "../utils/fecha";
import StatusInfoCard from "./StatusInfoCard";

// Pedidos en "Preparando Pedido": ya salieron de venta y están siendo alistados
// para el envío (courier, delivery propio, almacén o tienda), todavía sin
// datos de seguimiento externo.
export default function PreparingCard({ pedido, lugar, className = "" }) {
  const {
    codigo,
    tipo_envio: tipoEnvio,
    fecha_despacho: fechaDespacho,
  } = pedido;

  return (
    <StatusInfoCard
      pedido={pedido}
      className={className}
      badgeIcon={<InboxOutlined />}
      badgeTexto="Preparando pedido"
      titulo="Estamos preparando tu pedido"
      fecha={formatearFecha(fechaDespacho)}
      descripcion="Estamos organizando y validando tu pedido para dejarlo listo para el envío."
      campos={[
        { label: "Pedido", valor: codigo },
        { label: "Tipo de entrega", valor: tipoEntrega(tipoEnvio, lugar) },
        { label: "Próximo paso", valor: "En ruta" },
      ]}
    />
  );
}
