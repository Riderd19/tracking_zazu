# Tracking Zazu

Frontend publico para consultar pedidos de la Plataforma Zazu.

## Configuracion de la API

La API se define al compilar con `VITE_API_URL`:

- Desarrollo: copia `.env.example` a `.env`.
- Produccion: copia `.env.production.example` a `.env.production` antes de ejecutar `npm run build`.

Si no se define la variable, el build de produccion usa `https://zazu.com.pe/api` como respaldo.

La API debe exponer `/api/public/tracking`, `/api/public/empresas` y `/api/public/trackingligo/qr`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
