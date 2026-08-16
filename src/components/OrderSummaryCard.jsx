import { InboxOutlined } from "@ant-design/icons";
import ClockIcon from "./icons/ClockIcon";
import LocationDotIcon from "./icons/LocationDotIcon";
import BuildingIcon from "./icons/BuildingIcon";
import FileLinesIcon from "./icons/FileLinesIcon";
import OrderTimeline from "./OrderTimeline";
import { EN_GESTION } from "../constants/estadosPedido";
import SaldoPendiente from "./SaldoPendiente";
import OrderItemsSummary from "./OrderItemsSummary";
import DeliveredCard from "./DeliveredCard";
import CourierTrackingCard from "./CourierTrackingCard";
import AgencyMap from "./AgencyMap";
import PreparingCard from "./PreparingCard";
import RegisteredCard from "./RegisteredCard";

// Bloque ícono + 2 líneas de texto. `enfasisArriba` decide cuál línea va en
// negrita: el primer campo (Pedido/Cliente) destaca el código arriba, los
// demás destacan el valor abajo (igual patrón que ya usaba "Entrega estimada").
// Colores, tamaños y tipografía calcados del inspector de Figma (Dev Mode):
// círculo bg gray-100/ícono gray-700 a 58px, texto 14px/20px, valores peso 600
// en gray-900, etiquetas peso 500 en gray-700 (peso 400 solo para "Cliente: ...").
// Ninguna línea trunca con "...": un código de pedido o una dirección larga se
// cortaban sin forma de leerlos completos. Por defecto se ajustan a varias
// líneas; `abajoSinAjuste` (Destino) en cambio fuerza una sola fila completa —
// el scroll horizontal queda aislado a esa línea (no al campo entero ni al
// grid completo), así funciona igual sin importar el ancho de pantalla o
// cuántas columnas tenga el grid en cada breakpoint. `abajo` es opcional
// (Código, courier): sin segunda línea, el ícono+texto se centran en vez de
// alinearse arriba, para no dejar espacio vacío debajo.
function Campo({
  icon,
  arriba,
  abajo,
  enfasisArriba = false,
  abajoSinAjuste = false,
}) {
  return (
    <div
      className={`flex gap-3 min-w-0 ${abajo ? "items-start" : "items-center"}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
        {icon}
      </span>
      <div className="min-w-0 flex flex-col gap-2">
        <p
          className={`mb-0 break-words text-sm leading-5 ${
            enfasisArriba
              ? "font-semibold text-gray-900"
              : "font-medium text-gray-700"
          }`}
        >
          {arriba}
        </p>
        {abajo &&
          (abajoSinAjuste ? (
            <div className="overflow-x-auto scrollbar-hide">
              <p
                className={`mb-0 whitespace-nowrap text-sm leading-5 ${
                  enfasisArriba
                    ? "font-normal text-gray-700"
                    : "font-semibold text-gray-900"
                }`}
              >
                {abajo}
              </p>
            </div>
          ) : (
            <p
              className={`mb-0 break-words text-sm leading-5 ${
                enfasisArriba
                  ? "font-normal text-gray-700"
                  : "font-semibold text-gray-900"
              }`}
            >
              {abajo}
            </p>
          ))}
      </div>
    </div>
  );
}

// El backend a veces guarda la dirección con el Plus Code de Google delante
// (ej. "V3P7+HXQ, Huaca del Sol...") — es un código interno de geocodificación,
// no aporta nada al cliente y solo ocupa espacio.
function quitarPlusCode(direccion) {
  return direccion.replace(/^\S+\+\S+,\s*/, "");
}

export default function OrderSummaryCard({ pedido }) {
  const {
    codigo,
    destinatario_nombre,
    destinatario_direccion,
    empresa,
    tipo_envio,
    estado_actual,
    timeline,
    fecha_pedido,
    fecha_envio,
    codigo_courier,
    fecha_despacho,
    fecha_en_ruta,
    fecha_entregado_zazu1,
    sede_entrega,
    saldo_pendiente,
    tipo_pago,
    destino_coordenadas: destinoCoordenadas,
  } = pedido;

  // Si el pedido es de recojo en tienda, el "destino" es la sede, no la
  // dirección del destinatario (que puede no aplicar o venir vacía).
  const destinoCompleto =
    sede_entrega?.direccion ?? destinatario_direccion ?? "No disponible";
  const destino = quitarPlusCode(destinoCompleto);
  const esCourier = tipo_envio?.toUpperCase() === "COURIER";
  const entregado = estado_actual?.codigo === "entregado";
  // Courier en ruta: el paquete está en manos de un courier externo (Shalom,
  // etc.), no de un motorizado propio — ver CourierTrackingCard/AgencyMap.
  const courierEnRuta = esCourier && estado_actual?.codigo === "en_ruta";
  const despachado = estado_actual?.codigo === "despachado";
  const enGestion = EN_GESTION.includes(estado_actual?.codigo);
  const hayResumen = saldo_pendiente > 0 || pedido.articulos?.length > 0;
  // Despachado / Pedido Registrado comparten el mismo layout de 3 columnas (tarjeta
  // de estado + resumen + imagen), solo cambia qué tarjeta e ilustración se
  // muestran — ver StatusInfoCard.
  const tarjetaEstado = despachado
    ? {
        Componente: PreparingCard,
        imagenSrc: "/images/pedido-preparando-zazu.png",
        imagenAlt: "Repartidor de Zazu empaquetando el pedido en el almacén",
        imagenClassName: "md:scale-125",
        gridClassName:
          "lg:grid-cols-[minmax(300px,360px)_minmax(460px,600px)]",
      }
    : enGestion
      ? {
          Componente: RegisteredCard,
          imagenSrc: "/images/pedido-registrado-zazu.png",
          imagenAlt: "Pedido de Zazu recién registrado, listo para preparar",
          imagenClassName: "",
          gridClassName:
            "lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)]",
        }
      : null;

  return (
    <div>
      <div className="rounded bg-gray-50 p-6 grid grid-cols-1 sm:grid-cols-[repeat(2,max-content)] sm:justify-between gap-x-5 gap-y-5 2xl:flex 2xl:flex-nowrap 2xl:items-start 2xl:[&>*:last-child]:-translate-x-4">
        <Campo
          icon={<InboxOutlined className="text-xl" />}
          arriba={`Pedido ${codigo}`}
          abajo={`Cliente: ${destinatario_nombre}`}
          enfasisArriba
        />
        {/* Línea divisoria como elemento propio, con el mismo gap-x-8 fijo a
            cada lado (ver flex arriba) — queda centrada en el hueco entre
            campos, y los huecos miden exactamente lo mismo sin importar el
            largo del contenido de cada campo. */}
        <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
        <Campo
          icon={<BuildingIcon className="w-6 h-6" />}
          arriba="Empresa"
          abajo={empresa ?? "No disponible"}
        />
        <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
        <Campo
          icon={<LocationDotIcon className="w-6 h-6" />}
          arriba="Destino"
          abajo={destino}
          abajoSinAjuste
        />
        <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
        <Campo
          icon={<ClockIcon className="w-6 h-6" />}
          arriba="Fecha de envío"
          abajo={fecha_envio ?? "Pendiente"}
          abajoSinAjuste
        />
        {esCourier && (
          <>
            <span className="hidden 2xl:block w-px shrink-0 bg-gray-200 self-stretch" />
            <Campo
              icon={<FileLinesIcon className="w-5 h-6" />}
              arriba={`Código: ${codigo_courier || "Pendiente"}`}
            />
          </>
        )}
      </div>

      {courierEnRuta || tarjetaEstado ? (
        // Courier en ruta / Preparando Pedido / Pedido Registrado: tarjeta de estado, mapa
        // o imagen, y resumen van en una sola fila de 3 columnas (igual
        // altura de inicio) — a diferencia del layout de abajo, acá el
        // resumen NO es un sidebar aparte, es una columna más, para que las
        // 3 tarjetas arranquen alineadas justo debajo de la línea de tiempo.
        <div className="mt-10 flex flex-col gap-12">
          <OrderTimeline
            timeline={timeline}
            estadoActual={estado_actual}
            fechaPedido={fecha_pedido}
            fechaDespacho={fecha_despacho}
            fechaEnRuta={fecha_en_ruta}
            fechaEntregado={fecha_entregado_zazu1}
          />
          {/* md:px-[12.5%]: OrderTimeline reparte sus 4 pasos en columnas
              iguales con el círculo centrado en cada una, así que "En
              Gestión" y "Entregado" quedan a 1/8 del ancho total desde cada
              borde, no pegados al borde. Este mismo inset alinea el borde de
              las tarjetas con esos círculos en vez de con el contenedor. */}
          {courierEnRuta ? (
            <div
              className={
                hayResumen
                  ? "grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] xl:grid-cols-[minmax(280px,360px)_minmax(360px,700px)_minmax(260px,320px)] xl:justify-center"
                  : "grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] lg:grid-cols-[minmax(300px,360px)_minmax(460px,700px)] lg:justify-center lg:gap-8"
              }
            >
              <CourierTrackingCard pedido={pedido} lugar={destino} />
              <AgencyMap
                coordenadas={destinoCoordenadas}
                lugar={destino}
                className="md:h-95 lg:h-105"
              />
              {hayResumen && (
                <div className="flex flex-col gap-5">
                  <OrderItemsSummary pedido={pedido} compactoConModal />
                  {["COURIER", "DELIVERY"].includes(
                    tipo_envio?.toUpperCase(),
                  ) &&
                    saldo_pendiente > 0 &&
                    tipo_pago !== "Pago Completo" && (
                      <SaldoPendiente monto={saldo_pendiente} />
                    )}
                </div>
              )}
            </div>
          ) : (
            // Preparando Pedido / Pedido Registrado: solo se muestran la
            // tarjeta de estado y su ilustración, como en el diseño de esta
            // etapa del tracking.
            <div
              className={`grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] lg:justify-center lg:gap-8 ${tarjetaEstado.gridClassName}`}
            >
              <tarjetaEstado.Componente pedido={pedido} lugar={destino} />
              {/* La ilustración tiene fondo transparente y ya incluye su
                  composición completa. `object-contain` conserva todos sus
                  bordes; el zoom + cover anterior cortaba la lámpara, la
                  planta y parte de las cajas. */}
              <div className="h-64 w-full rounded-2xl md:h-95 lg:h-105">
                <img
                  src={tarjetaEstado.imagenSrc}
                  alt={tarjetaEstado.imagenAlt}
                  className={`h-full w-full object-contain object-center transition-transform ${tarjetaEstado.imagenClassName}`}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-12">
            <OrderTimeline
              timeline={timeline}
              estadoActual={estado_actual}
              fechaPedido={fecha_pedido}
              fechaDespacho={fecha_despacho}
              fechaEnRuta={fecha_en_ruta}
              fechaEntregado={fecha_entregado_zazu1}
            />
            {entregado && <DeliveredCard pedido={pedido} />}
          </div>
        </div>
      )}
    </div>
  );
}
