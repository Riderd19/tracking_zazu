import { useEffect, useState } from 'react'
import { Form, Input, Select, Button } from 'antd'
import { CloseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { listarEmpresas } from '../../services/trackingService'
import { combinarCodigo, parseCodigo, detectarCodigoCompleto } from '../../utils/codigoPedido'
import PasoNumero from '../buscar/PasoNumero'

const ERROR_CONFIG = {
  no_encontrado: {
    titulo: 'No encontramos un pedido con esos datos',
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-500',
    icon: <CloseOutlined className="text-[10px] text-white" />,
  },
  validacion: {
    titulo: 'Revisa los datos ingresados',
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-500',
    icon: <CloseOutlined className="text-[10px] text-white" />,
  },
  rate_limit: {
    titulo: 'Demasiados intentos',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500',
    icon: <ClockCircleOutlined className="text-[10px] text-white" />,
  },
  desconocido: {
    titulo: 'Ocurrió un error',
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-500',
    icon: <CloseOutlined className="text-[10px] text-white" />,
  },
}

function Etiqueta({ numero, htmlFor, area, children }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ gridArea: area }}
      className={`mb-2.5 flex items-center gap-2.5 text-base font-semibold text-gray-900 ${area === 'l2' ? 'lg:ml-2.5' : ''}`}
    >
      <PasoNumero numero={numero} />
      {children}
    </label>
  )
}

/**
 * `numeroRef` e `identificadorRef` marcan los dos campos a los que apuntan las
 * flechas que salen de la nota de venta de ejemplo (ver ConectoresNota).
 */
export default function SearchForm({ onSubmit, loading, error, codigoInicial, numeroRef, identificadorRef }) {
  const [form] = Form.useForm()
  // empresas: [{ label, value }] — el "value" es el prefijo real que usa external_ref
  // en el backend (no siempre igual a label, ver TrackingPublicController::empresas).
  const [empresas, setEmpresas] = useState([])
  const [empresasLoading, setEmpresasLoading] = useState(true)
  const { empresa: empresaInicial, numero: numeroInicial } = parseCodigo(codigoInicial, empresas)

  // Se cargan una sola vez al montar. Si el código de la URL llegó antes de que
  // resuelva el fetch, se vuelve a resolver empresa/número con la lista ya
  // completa (initialValues de antd solo aplica en el primer render).
  useEffect(() => {
    let cancelado = false

    listarEmpresas()
      .then((lista) => {
        if (cancelado) return
        setEmpresas(lista)
        form.setFieldsValue(parseCodigo(codigoInicial, lista))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setEmpresasLoading(false)
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFinish(values) {
    onSubmit(combinarCodigo(values.empresa, values.numero), values.identificador)
  }

  // Si el usuario pega/escribe un código completo (ej. desde WhatsApp) en el
  // campo de número, lo separamos en empresa + número sin que se note nada
  // más que el selector ajustándose solo.
  function handleNumeroChange(e) {
    const detectado = detectarCodigoCompleto(e.target.value, empresas)
    if (detectado) {
      form.setFieldsValue({ empresa: detectado.empresa, numero: detectado.numero })
    }
  }

  const errorConfig = error ? (ERROR_CONFIG[error.tipo] ?? ERROR_CONFIG.desconocido) : null

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      initialValues={{ empresa: empresaInicial, numero: numeroInicial }}
      className="w-full animate-fade-in-up"
    >
      {errorConfig && (
        <div
          className={`mb-5 flex items-start gap-3 rounded-2xl border ${errorConfig.border} ${errorConfig.bg} p-4 animate-shake`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${errorConfig.iconBg}`}
          >
            {errorConfig.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">{errorConfig.titulo}</p>
            <p className="text-xs text-gray-500 mb-0">{error.mensaje}</p>
          </div>
        </div>
      )}

      <div className="buscar-grid">
        <Etiqueta numero={1} htmlFor="pedido-numero-input" area="l1">N° de pedido</Etiqueta>
        <Etiqueta numero={2} htmlFor="pedido-identificador-input" area="l2">DNI o celular</Etiqueta>

        <Form.Item
          name="empresa"
          style={{ gridArea: 'sel' }}
          className="mb-2 lg:mb-0"
          rules={[{ required: true, message: 'Selecciona tu tienda' }]}
        >
          <Select
            size="large"
            aria-label="Tienda"
            placeholder="Selecciona tu tienda"
            showSearch
            optionFilterProp="label"
            loading={empresasLoading}
            options={empresas}
          />
        </Form.Item>

        <div ref={numeroRef} style={{ gridArea: 'num' }}>
          <Form.Item
            name="numero"
            className="mb-4 lg:mb-0"
            rules={[{ required: true, message: 'Ingresa el número de pedido' }]}
          >
            <Input
              id="pedido-numero-input"
              size="large"
              placeholder="Ej. 067812"
              autoComplete="off"
              onChange={handleNumeroChange}
            />
          </Form.Item>
        </div>

        <div ref={identificadorRef} style={{ gridArea: 'dni' }} className="lg:ml-2.5">
          <Form.Item
            name="identificador"
            className="mb-5 lg:mb-0"
            rules={[{ required: true, message: 'Ingresa tu DNI o celular' }]}
          >
            <Input
              id="pedido-identificador-input"
              size="large"
              inputMode="tel"
              placeholder="Ej. 45678912 o 987654321"
              autoComplete="off"
              autoFocus={Boolean(codigoInicial)}
            />
          </Form.Item>
        </div>

        <Form.Item style={{ gridArea: 'btn' }} className="mb-0 lg:ml-2.5">
          <Button type="primary" htmlType="submit" size="large" loading={loading} block>
            Rastrear pedido
          </Button>
        </Form.Item>
      </div>
    </Form>
  )
}
