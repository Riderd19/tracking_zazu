import { CreditCardOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { WHATSAPP_SOPORTE_LINK } from '../constants/soporte'

// "Pagar ahora" no procesa ningún pago real (no hay pasarela integrada acá):
// abre WhatsApp de soporte, el mismo canal que ya usamos en el resto del sitio,
// para no dejar un botón muerto ni improvisar un flujo de cobro.
export default function SaldoPendiente({ monto }) {
  return (
    <div className="w-full sm:w-64 shrink-0 rounded-2xl bg-violet-50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white text-lg">
          <CreditCardOutlined />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0">Saldo pendiente</p>
          <p className="text-xs text-gray-500 mb-0">Págalo al recibir tu pedido</p>
        </div>
      </div>

      <p className="text-2xl font-bold text-violet-700 mb-3">S/ {monto.toFixed(2)}</p>

      <a
        href={WHATSAPP_SOPORTE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white text-sm font-semibold py-2.5 hover:bg-violet-700 transition-colors"
      >
        Pagar ahora <ArrowRightOutlined />
      </a>
    </div>
  )
}
