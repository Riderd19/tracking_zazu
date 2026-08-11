import { CreditCardOutlined } from '@ant-design/icons'

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

      <p className="text-2xl font-bold text-violet-700 mb-0">S/ {monto.toFixed(2)}</p>
    </div>
  )
}
