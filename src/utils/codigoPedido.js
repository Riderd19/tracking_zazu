import { EMPRESAS } from '../constants/empresas'

export function combinarCodigo(empresa, numero) {
  return `${empresa}/${numero.trim()}`
}

// "Overshark/037564" -> { empresa: 'Overshark', numero: '037564' }
export function parseCodigo(codigoCompleto) {
  if (!codigoCompleto) return { empresa: EMPRESAS[0], numero: '' }

  const empresa = EMPRESAS.find((e) => codigoCompleto.startsWith(`${e}/`))
  if (!empresa) return { empresa: EMPRESAS[0], numero: codigoCompleto }

  return { empresa, numero: codigoCompleto.slice(empresa.length + 1) }
}

// Detecta si lo que el usuario escribió/pegó en el campo de número ya es un
// código completo (ej. pegó "Box Prime/000908" desde un WhatsApp). Solo
// dispara si el texto antes de la "/" coincide con una empresa conocida
// (sin importar mayúsculas), para no interferir con números normales.
export function detectarCodigoCompleto(valor) {
  if (!valor.includes('/')) return null

  const [posibleEmpresa, ...resto] = valor.split('/')
  const empresa = EMPRESAS.find(
    (e) => e.toLowerCase() === posibleEmpresa.trim().toLowerCase(),
  )
  if (!empresa) return null

  return { empresa, numero: resto.join('/').trim() }
}
