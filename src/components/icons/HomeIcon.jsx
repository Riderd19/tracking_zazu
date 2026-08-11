import { HOME_ICON_PATH } from '../../constants/homeIconPath'

// Ícono de casa (destino) con marca Zazu, mismo patrón que MotorcycleIcon.
export default function HomeIcon({ style, className = '' }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 30 30"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <path d={HOME_ICON_PATH} />
    </svg>
  )
}
