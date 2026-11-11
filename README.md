# Power Sport

Simulación de una tienda de indumentaria deportiva, armada como portfolio. No procesa pagos.

Al confirmar una compra, el backend envía un correo de confirmación por Brevo. El frontend repone el stock a propósito, para que los productos sigan disponibles y la tienda se pueda volver a probar.

## Stack

- Este repo: Next.js 14, React 18 y Bootstrap 5.
- API: Express y MongoDB, en [ProyectoBackendServer](https://github.com/simondelasheras/ProyectoBackendServer).

## Qué se puede hacer

- Recorrer la home y el shop.
- Ver un producto, elegir cantidad y agregarlo al carrito.
- Quitar una unidad o el ítem entero.
- Confirmar la compra con un email. El carrito queda vacío y el stock vuelve.

Si un producto tiene `countInStock` en 0, el botón pasa a "Out of Stock".

## Cómo ejecutarlo

Hacen falta los dos repos y una base MongoDB local. Las dependencias de este repo se instalan con npm, usando `package-lock.json`.

### 1. MongoDB

Levantá un MongoDB en la máquina. La URI va en el backend, en la variable `CONNECTION_STRING`. El archivo de ejemplo del backend trae el nombre de las variables, sin claves.

### 2. Backend

```bash
git clone https://github.com/simondelasheras/ProyectoBackendServer
cd ProyectoBackendServer
cp .env.example .env
npm install
npm start
```

En `.env` completá `CONNECTION_STRING`. Para que el correo salga, también `BREVO_SMTP_HOST`, `BREVO_SMTP_PORT`, `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY` y `BREVO_FROM_EMAIL`. El remitente tiene que estar autorizado en Brevo. Si faltan usuario, clave o remitente, la compra responde 503 y no envía nada.

El proceso abre tres puertos:

| Puerto | Recurso |
| --- | --- |
| 5050 | `/api/products` |
| 8080 | `/api/carts` |
| 9090 | `/api/buy` |

`PORT` puede listarlos juntos: `5050,8080,9090`.

### 3. Productos

`utils/db.json` es el catálogo de ejemplo. La tienda no lo lee: los productos salen de `GET /api/products`.

Para cargarlo en la base del backend, insertá el arreglo `products` en la colección `products`. El campo numérico `id` no forma parte del modelo; se puede omitir. Mongoose asigna `_id`.

### 4. Frontend

```bash
npm ci
npm run dev
```

Abrí http://localhost:3000. El backend solo acepta ese origen.

Las llamadas usan estas variables. Si no están definidas, quedan en localhost. No llevan barra final.

| Variable | Por defecto | Recurso |
| --- | --- | --- |
| `NEXT_PUBLIC_PRODUCTS_URL` | `http://localhost:5050` | `/api/products` |
| `NEXT_PUBLIC_CARTS_URL` | `http://localhost:8080` | `/api/carts` |
| `NEXT_PUBLIC_BUY_URL` | `http://localhost:9090` | `/api/buy` |

Los nombres están en `.env.example`, con esos mismos valores locales. Para apuntar a otro origen, copialos a `.env.local`. Next.js incorpora `NEXT_PUBLIC_*` al construir: después de cambiarlas hay que volver a correr `npm run dev` o `npm run build`.

`npm run lint` revisa el código y `npm run build` lo compila. Este repo no tiene un script `test`. Esos dos comandos no ejecutan pruebas de la tienda.

![Home y shop de Power Sport](docs/tienda.png)

## Pendiente para publicarla

Las URLs ya no están fijas en el código. Para salir de localhost todavía falta decidir el hosting. Este sitio es Next.js y se sirve con `next start`. El backend es otro proceso, con tres puertos. No hay un proveedor elegido.

Además:

- MongoDB y las variables `CONNECTION_STRING` y `BREVO_*` del backend, con un remitente verificado en Brevo.
- El CORS del backend solo permite `http://localhost:3000`. Hay que abrirlo al origen público del sitio.
- Definir `NEXT_PUBLIC_PRODUCTS_URL`, `NEXT_PUBLIC_CARTS_URL` y `NEXT_PUBLIC_BUY_URL` en el build del frontend, con el origen público de cada servicio.
- `npm audit` del 11 de noviembre de 2026 reporta 17 avisos: 2 críticos, 11 altos y 4 moderados. Los críticos están en `next` y en `form-data`. Corregirlos implica subir Next y otras dependencias, con salto de versión y riesgo de romper el build. Queda pendiente.
- `eslint` está en 8.20.0 y `eslint-config-next` en 12.2.2, con Next 14.0.2. Alinear el config con Next 14 puede cambiar las reglas de lint. Queda pendiente.
- Varias imágenes viven en Imgur. Si esos enlaces dejan de responder, la tienda se ve rota. Pasarlas al repo sería un cambio aparte.

La reposición del stock después de comprar sigue siendo a propósito, para poder repetir la prueba.
