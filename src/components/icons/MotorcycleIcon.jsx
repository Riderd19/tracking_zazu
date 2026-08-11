import { MOTORCYCLE_ICON_PATH } from '../../constants/motorcycleIconPath'

// Ícono de motorizado con marca Zazu, para usar junto a otros íconos de antd
// (hereda color por currentColor igual que ellos).
export default function MotorcycleIcon({ style, className = '' }) {
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
      <path d={MOTORCYCLE_ICON_PATH} />
    </svg>
  )
}
