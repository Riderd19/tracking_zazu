// Las fotos del celular pesan 3-8 MB y miden 4000 px: para que el asesor vea una
// captura o un producto sobra con 1600 px. Achicarla acá hace que suba rápido con
// datos móviles y que nunca choque con el tope del backend (5 MB).
//
// Se vuelve a codificar siempre, aunque ya sea chica: de paso se van los datos
// EXIF, que en una foto del celular pueden traer la ubicación GPS de la casa del
// cliente.
const LADO_MAXIMO = 1600
const CALIDAD = 0.82

async function decodificar(archivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      // 'from-image' respeta la rotación EXIF: sin eso, las fotos verticales
      // de algunos celulares llegan acostadas.
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' })
    } catch {
      // Algunos navegadores no aceptan la opción o el formato: se prueba con <img>.
    }
  }

  const url = URL.createObjectURL(archivo)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Devuelve un JPEG de hasta LADO_MAXIMO px por lado. Falla si el archivo no es una imagen legible. */
export async function achicarFoto(archivo) {
  const imagen = await decodificar(archivo)
  const ancho = imagen.width
  const alto = imagen.height
  const escala = Math.min(1, LADO_MAXIMO / Math.max(ancho, alto))

  const lienzo = document.createElement('canvas')
  lienzo.width = Math.max(1, Math.round(ancho * escala))
  lienzo.height = Math.max(1, Math.round(alto * escala))

  const ctx = lienzo.getContext('2d')
  // Fondo blanco: un PNG con transparencia quedaría negro al pasarlo a JPEG.
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, lienzo.width, lienzo.height)
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  imagen.close?.()

  const blob = await new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD))
  if (!blob) throw new Error('No se pudo procesar la foto.')
  return blob
}
