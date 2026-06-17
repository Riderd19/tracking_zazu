import { Form, Input, Select, Space, Button } from 'antd'
import { SearchOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { EMPRESAS, EMPRESA_EJEMPLOS } from '../constants/empresas'
import { combinarCodigo, parseCodigo, detectarCodigoCompleto } from '../utils/codigoPedido'

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

export default function SearchForm({ onSubmit, loading, error, codigoInicial }) {
  const [form] = Form.useForm()
  const { empresa: empresaInicial, numero: numeroInicial } = parseCodigo(codigoInicial)
  const empresaSeleccionada = Form.useWatch('empresa', form) ?? empresaInicial

  function handleFinish(values) {
    onSubmit(combinarCodigo(values.empresa, values.numero), values.identificador)
  }

  // Si el usuario pega/escribe un código completo (ej. desde WhatsApp) en el
  // campo de número, lo separamos en empresa + número sin que se note nada
  // más que el selector ajustándose solo.
  function handleNumeroChange(e) {
    const detectado = detectarCodigoCompleto(e.target.value)
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

      <Form.Item label="N° de pedido" required>
        <Space.Compact block>
          <Form.Item name="empresa" noStyle rules={[{ required: true, message: 'Selecciona la empresa' }]}>
            <Select
              size="large"
              style={{ width: '42%' }}
              options={EMPRESAS.map((empresa) => ({ label: empresa, value: empresa }))}
            />
          </Form.Item>
          <Form.Item
            name="numero"
            noStyle
            rules={[{ required: true, message: 'Ingresa el número de pedido' }]}
          >
            <Input
              size="large"
              placeholder={`Ej. ${EMPRESA_EJEMPLOS[empresaSeleccionada]}`}
              autoComplete="off"
              onChange={handleNumeroChange}
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        name="identificador"
        label="DNI o celular"
        rules={[{ required: true, message: 'Ingresa tu DNI o celular' }]}
      >
        <Input
          size="large"
          placeholder="Ej. 987654321"
          autoComplete="off"
          autoFocus={Boolean(codigoInicial)}
        />
      </Form.Item>

      <Form.Item className="mb-3">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          icon={<SearchOutlined />}
          loading={loading}
          block
        >
          Consultar
        </Button>
      </Form.Item>

      <p className="text-xs text-gray-400 text-center mb-0">
        Tus datos solo se usan para verificar la propiedad del pedido.
      </p>
    </Form>
  )
}
