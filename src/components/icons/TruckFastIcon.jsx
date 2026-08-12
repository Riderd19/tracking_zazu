export default function TruckFastIcon({ style, className = '' }) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 3 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', ...style }}
      aria-hidden
    >
      <path d="M7 7h34a6 6 0 0 1 6 6v3h5l9 10v10a6 6 0 0 1-6 6h-2a9 9 0 0 0-18 0H28a9 9 0 0 0-18 0H7a6 6 0 0 1-6-6V13a6 6 0 0 1 6-6Z" fill="currentColor" />
      <path d="M47 21h4l7 8H47v-8Z" fill="white" />
      <circle cx="19" cy="41" r="7" fill="currentColor" />
      <circle cx="19" cy="41" r="3" fill="white" />
      <circle cx="44" cy="41" r="7" fill="currentColor" />
      <circle cx="44" cy="41" r="3" fill="white" />
    </svg>
  )
}
