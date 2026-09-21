import { Collapse } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { preguntasPara } from '../../constants/preguntasFrecuentes'

// Pequeño acordeón de preguntas frecuentes, con el contenido según el tipo de
// envío del pedido que se está viendo (ver constants/preguntasFrecuentes.js).
export default function PreguntasFrecuentes({ tipoEnvio }) {
  const preguntas = preguntasPara(tipoEnvio)
  if (preguntas.length === 0) return null

  const items = preguntas.map((item, indice) => ({
    key: String(indice),
    label: <span className="text-sm font-semibold text-gray-900">{item.pregunta}</span>,
    children: <p className="mb-0 text-sm leading-6 text-gray-600">{item.respuesta}</p>,
  }))

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <QuestionCircleOutlined className="text-violet-600" /> Preguntas frecuentes
      </div>
      <Collapse items={items} ghost defaultActiveKey={['0']} expandIconPlacement="end" />
    </div>
  )
}
