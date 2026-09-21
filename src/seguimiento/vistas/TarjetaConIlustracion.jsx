/**
 * El layout que comparten "Pedido Registrado" y "Preparando Pedido": la
 * tarjeta de estado a la izquierda y su ilustración a la derecha.
 *
 * Es el molde, no una vista: quien lo usa (RegistradoView / PreparandoView)
 * elige qué tarjeta, qué imagen y qué anchos. Si mañana uno de esos estados
 * necesita otro layout para Courier, deja de usar este molde y ya — los demás
 * no se enteran.
 */
export default function TarjetaConIlustracion({
  children,
  imagenSrc,
  imagenAlt,
  imagenClassName = '',
  gridClassName = '',
}) {
  return (
    <div
      className={`grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(260px,320px)_1fr] md:px-[8%] lg:justify-center lg:gap-8 ${gridClassName}`}
    >
      {children}
      {/* La ilustración tiene fondo transparente y ya incluye su composición
          completa. `object-contain` conserva todos sus bordes; el zoom + cover
          anterior cortaba la lámpara, la planta y parte de las cajas. El
          padding es del contenedor y no de la imagen: así respeta el aire
          alrededor que trae el diseño en vez de que la ilustración toque el
          borde de la columna cuando el contenedor crece en pantallas grandes. */}
      <div className="h-64 w-full rounded-2xl p-4 md:h-95 md:p-8 lg:h-105 lg:p-10">
        <img
          src={imagenSrc}
          alt={imagenAlt}
          className={`h-full w-full object-contain object-center transition-transform ${imagenClassName}`}
        />
      </div>
    </div>
  )
}
