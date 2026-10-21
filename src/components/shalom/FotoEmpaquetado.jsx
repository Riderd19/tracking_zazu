import { useState } from 'react'
import { Image } from 'antd'
import { CameraOutlined, RightOutlined } from '@ant-design/icons'

/**
 * La foto que se sube en Packing, como una fila compacta: miniatura, texto y "Ver".
 * Al tocarla se abre la galería (las dos fotos, si hay dos). No aparece si no hay foto.
 */
export default function FotoEmpaquetado({ pedido, className = '' }) {
  const [abierta, setAbierta] = useState(false)
  const fotos = [pedido.foto_packing_url, pedido.foto_packing_url_2].filter(Boolean)

  if (fotos.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/40 ${className}`}
      >
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-400">
          <CameraOutlined className="text-lg" />
          <img src={fotos[0]} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-900">Foto del empaquetado</span>
          <span className="block text-xs text-gray-500">
            Así se preparó tu paquete{fotos.length > 1 ? ` · ${fotos.length} fotos` : ''}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-violet-700">
          Ver <RightOutlined className="text-[10px]" />
        </span>
      </button>

      <div className="hidden">
        <Image.PreviewGroup
          preview={{ open: abierta, onOpenChange: (open) => setAbierta(open) }}
        >
          {fotos.map((src) => (
            <Image key={src} src={src} alt="Foto del empaquetado" />
          ))}
        </Image.PreviewGroup>
      </div>
    </>
  )
}
