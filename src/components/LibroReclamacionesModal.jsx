import { useState } from 'react'
import { Modal, Form, Input, Select, Radio, Button, Space } from 'antd'
import { WHATSAPP_SOPORTE_NUMERO } from '../constants/soporte'

const { TextArea } = Input

// Campos mínimos que exige el Libro de Reclamaciones Virtual en Perú (D.S.
// N° 011-2011-PCM y modificatorias): datos del consumidor, tipo de
// reclamación (reclamo/queja), detalle de los hechos y el pedido concreto
// del consumidor. Por ahora esto es solo frontend — no hay backend propio
// para guardar el reclamo, así que al enviar se arma el mensaje completo y
// se abre WhatsApp hacia soporte para que llegue a una persona real, en vez
// de mostrar un falso "reclamo registrado" que no fue a ningún lado.
function construirMensajeWhatsApp(valores) {
  const lineas = [
    '*Libro de Reclamaciones — Zazu Express*',
    '',
    `Tipo: ${valores.tipo === 'queja' ? 'Queja' : 'Reclamo'}`,
    `Nombre: ${valores.nombre}`,
    `Documento: ${valores.tipoDocumento} ${valores.numeroDocumento}`,
    `Domicilio: ${valores.domicilio}`,
    `Email: ${valores.email}`,
    valores.telefono ? `Teléfono: ${valores.telefono}` : null,
    valores.numeroPedido ? `N° de pedido: ${valores.numeroPedido}` : null,
    valores.monto ? `Monto reclamado: S/ ${valores.monto}` : null,
    '',
    'Detalle de los hechos:',
    valores.detalle,
    '',
    'Pedido del consumidor:',
    valores.pedidoConsumidor,
  ].filter(Boolean)

  return lineas.join('\n')
}

export default function LibroReclamacionesModal({ open, onClose }) {
  const [form] = Form.useForm()
  const [enviado, setEnviado] = useState(false)

  function handleClose() {
    setEnviado(false)
    form.resetFields()
    onClose()
  }

  function handleFinish(valores) {
    const mensaje = construirMensajeWhatsApp(valores)
    window.open(`https://wa.me/${WHATSAPP_SOPORTE_NUMERO}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer')
    setEnviado(true)
  }

  return (
    <Modal open={open} onCancel={handleClose} footer={null} title="Libro de Reclamaciones" width={640} destroyOnHidden>
      {enviado ? (
        <div className="py-6 text-center">
          <p className="text-base font-semibold text-gray-900 mb-2">Tu reclamo está listo para enviarse</p>
          <p className="text-sm text-gray-500 mb-6">
            Se abrió WhatsApp con todos los datos completados — solo confirma el envío desde ahí para que llegue a
            nuestro equipo de soporte.
          </p>
          <Button type="primary" onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ tipoDocumento: 'DNI', tipo: 'reclamo' }}>
          <p className="text-xs text-gray-500 mb-4">
            Conforme al Código de Protección y Defensa del Consumidor, puedes registrar aquí tu reclamo o queja.
            <strong> Reclamo:</strong> disconformidad relacionada al producto o servicio.
            <strong> Queja:</strong> disconformidad no relacionada al producto/servicio, o malestar respecto a la
            atención.
          </p>

          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="reclamo">Reclamo</Radio>
              <Radio value="queja">Queja</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item name="nombre" label="Nombres y apellidos" rules={[{ required: true, message: 'Ingresa tu nombre completo' }]}>
              <Input placeholder="Ej. Juan Pérez Ramos" />
            </Form.Item>
            <Form.Item label="Documento de identidad" required>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="tipoDocumento" noStyle rules={[{ required: true }]}>
                  <Select style={{ width: '35%' }}>
                    <Select.Option value="DNI">DNI</Select.Option>
                    <Select.Option value="CE">CE</Select.Option>
                    <Select.Option value="Pasaporte">Pasaporte</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="numeroDocumento" noStyle rules={[{ required: true, message: 'Ingresa tu número de documento' }]}>
                  <Input style={{ width: '65%' }} placeholder="Número" />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Ingresa un email válido' }]}>
              <Input placeholder="tucorreo@ejemplo.com" />
            </Form.Item>
            <Form.Item name="telefono" label="Teléfono (opcional)">
              <Input placeholder="Ej. 987654321" />
            </Form.Item>
          </div>

          <Form.Item name="domicilio" label="Domicilio" rules={[{ required: true, message: 'Ingresa tu domicilio' }]}>
            <Input placeholder="Dirección completa" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item name="numeroPedido" label="N° de pedido (opcional)">
              <Input placeholder="Ej. Overshark/051765" />
            </Form.Item>
            <Form.Item name="monto" label="Monto reclamado en S/ (opcional)">
              <Input type="number" min={0} placeholder="0.00" />
            </Form.Item>
          </div>

          <Form.Item name="detalle" label="Detalle de los hechos" rules={[{ required: true, message: 'Describe lo ocurrido' }]}>
            <TextArea rows={3} placeholder="Describe qué ocurrió" />
          </Form.Item>

          <Form.Item name="pedidoConsumidor" label="¿Qué solicitas?" rules={[{ required: true, message: 'Indica qué solicitas' }]}>
            <TextArea rows={2} placeholder="Ej. Reembolso, cambio de producto, respuesta formal, etc." />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Enviar reclamo
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
