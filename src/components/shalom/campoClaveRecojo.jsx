import ValorClaveRecojo from './ClaveRecojo'
import { estadoClaveRecojo } from '../../services/claveRecojo'

/**
 * La fila "Clave de recojo", para las tarjetas que arman sus campos como lista de
 * `{ label, valor }` (StatusInfoCard y CourierTrackingCard). null si el pedido no
 * tiene clave de recojo (no es Shalom, o es un pedido viejo sin ticket).
 *
 * Vive aparte de ClaveRecojo.jsx porque ese archivo exporta un componente, y el
 * fast refresh de Vite exige que un archivo con componentes no exporte nada más.
 */
export function campoClaveRecojo(pedido, identidad) {
  if (!estadoClaveRecojo(pedido)) return null
  return { label: 'Clave de recojo', valor: <ValorClaveRecojo pedido={pedido} identidad={identidad} /> }
}
