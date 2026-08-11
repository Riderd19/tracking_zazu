export function combinarCodigo(empresa, numero) {
  return `${empresa}/${numero.trim()}`
}

// Empresa que se preselecciona en el formulario cuando no hay un código de URL
// que indique cuál usar — Overshark es la empresa principal de este micrositio,
// así que se prioriza sobre el orden alfabético que trae la API.
function empresaPorDefecto(empresas) {
  const overshark = empresas.find((e) => e.value.toLowerCase().includes('overshark'))
  return (overshark ?? empresas[0])?.value
}

// El prefijo real (value, ej. "#Gloria") no siempre es el que la gente escribe a mano
// al reenviar un código por WhatsApp — suelen copiar el nombre visible de la empresa
// (ej. "Gloria"), así que se acepta cualquiera de los dos para no romper la detección.
function buscarEmpresa(prefijo, empresas) {
  const texto = prefijo.trim().toLowerCase()
  return empresas.find((e) => e.value.toLowerCase() === texto || e.label.toLowerCase() === texto)
}

// "Gloria/000004" -> { empresa: '#Gloria', numero: '000004' }
export function parseCodigo(codigoCompleto, empresas) {
  if (!codigoCompleto) return { empresa: empresaPorDefecto(empresas), numero: '' }

  const posicion = codigoCompleto.indexOf('/')
  if (posicion === -1) return { empresa: empresaPorDefecto(empresas), numero: codigoCompleto }

  const empresa = buscarEmpresa(codigoCompleto.slice(0, posicion), empresas)
  if (!empresa) return { empresa: empresaPorDefecto(empresas), numero: codigoCompleto }

  return { empresa: empresa.value, numero: codigoCompleto.slice(posicion + 1) }
}

// Detecta si lo que el usuario escribió/pegó en el campo de número ya es un
// código completo (ej. pegó "Gloria/000004" desde un WhatsApp). Solo dispara
// si el texto antes de la "/" coincide con una empresa conocida, para no
// interferir con números normales.
export function detectarCodigoCompleto(valor, empresas) {
  if (!valor.includes('/')) return null

  const [posibleEmpresa, ...resto] = valor.split('/')
  const empresa = buscarEmpresa(posibleEmpresa, empresas)
  if (!empresa) return null

  return { empresa: empresa.value, numero: resto.join('/').trim() }
}
