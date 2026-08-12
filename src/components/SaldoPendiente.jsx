import { CreditCardOutlined } from '@ant-design/icons'
import { message } from 'antd'

// El pago en línea todavía no existe — el botón queda visible (el saldo
// pendiente es información real que el cliente necesita) pero avisa que la
// función no está lista en vez de fingir un flujo de pago que no hace nada.
export default function SaldoPendiente({ monto }) {
  return (
    <button
      type="button"
      onClick={() => message.info('En Desarrollo')}
      className="w-full rounded-2xl bg-violet-50 hover:bg-violet-100 transition-colors p-4 text-left border-0 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white text-lg">
          <CreditCardOutlined />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0">Saldo pendiente</p>
          <p className="text-xs text-gray-500 mb-0">Págalo al recibir tu pedido</p>
        </div>
      </div>

      <p className="text-2xl font-bold text-violet-700 mb-0">S/ {monto.toFixed(2)}</p>
    </button>
  )
}
