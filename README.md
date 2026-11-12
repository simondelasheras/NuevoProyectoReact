# Power Sport

Simulación de una tienda de indumentaria deportiva, armada como portfolio. No procesa pagos.

Al confirmar una compra, el frontend vacía el carrito y repone el stock a propósito, para poder repetir la prueba. El correo de confirmación lo envía el backend solo si tiene SMTP configurado. Más abajo está el detalle, y el resto está en el README del backend.

## Stack

- Este repo: Next.js 14.0.2 (fijado en `package-lock.json`), React 18.2.0 y Bootstrap 5.
- API: Express y MongoDB, en [ProyectoBackendServer](https://github.com/simondelasheras/ProyectoBackendServer).

## Qué se puede hacer

- Recorrer la home y el shop.
- Ver un producto, elegir cantidad y agregarlo al carrito.
- Quitar una unidad o el ítem entero.
- Confirmar la compra con un email. Si el backend acepta el envío, el carrito queda vacío y el stock vuelve.

Si un producto tiene `countInStock` en 0, el botón pasa a "Out of Stock".

## Requisitos

- Node.js 18.17.0 o posterior. Es el `engines.node` de `next@14.0.2`.
- npm 9 o posterior, el que trae esa línea de Node. `package-lock.json` usa `lockfileVersion` 3 y se instala con `npm ci`.
- Los dos repos clonados. El backend necesita MongoDB en marcha. Los requisitos y el arranque del servidor están en el [README del backend](https://github.com/simondelasheras/ProyectoBackendServer/blob/dev/README.md).

## Carpetas

Cada bloque indica la carpeta. Los comandos del frontend se corren en `NuevoProyectoReact`. Los del backend, en `ProyectoBackendServer`.

```bash
git clone https://github.com/simondelasheras/NuevoProyectoReact
git clone https://github.com/simondelasheras/ProyectoBackendServer
```

## 1. Backend

El backend tiene que estar corriendo antes que la tienda. En `ProyectoBackendServer`, los comandos de arranque del README del backend son:

```bash
cd ProyectoBackendServer
cp .env.example .env
npm install
npm start
```

`npm start` ejecuta `node app.js`. El proceso espera a MongoDB antes de escuchar. En `.env.example`, `PORT=5050`: productos quedan en ese puerto y, como no se indican los otros dos, carritos quedan en 8080 y compra en 9090.

| Puerto | Recurso |
| --- | --- |
| 5050 | `/api/products` |
| 8080 | `/api/carts` |
| 9090 | `/api/buy` |

Dejá esa terminal abierta. Este repo no levanta esos servicios. Si `PORT` se deja vacío, el backend usa los mismos tres puertos.

En el `.env` del backend, `CONNECTION_STRING` es la URI de MongoDB. `CORS_ORIGINS` vacío vale `http://localhost:3000`. Abrí la tienda en http://localhost:3000. `http://127.0.0.1:3000` es otro origen: el navegador bloquea las llamadas a la API. Para usarlo, poné ese origen en `CORS_ORIGINS` y reiniciá el backend.

El correo usa las variables `BREVO_*` de ese mismo README. Si faltan usuario, clave o remitente, `POST /api/buy` responde 503 y no envía nada. El host por defecto es `smtp-relay.brevo.com` y el puerto por defecto es 587. Este frontend no simula una bandeja.

## 2. Productos

La tienda no lee `utils/db.json`. El listado sale de `GET /api/products` en el backend.

Ese archivo es el catálogo de ejemplo: 24 productos. Cargalo con el backend ya escuchando, desde `NuevoProyectoReact`:

```bash
cd NuevoProyectoReact
node <<'EOF'
const fs = require("fs");
const http = require("http");

const { products } = JSON.parse(fs.readFileSync("utils/db.json", "utf8"));

function post(body) {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      "http://localhost:5050/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  for (const item of products) {
    const { id, ...body } = item;
    const status = await post(body);
    if (status !== 201) {
      throw new Error("POST /api/products respondió " + status);
    }
  }
  console.log("Cargados " + products.length + " productos");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
EOF
```

Tiene que imprimir `Cargados 24 productos`. El `id` numérico del archivo no se manda: no está en el modelo del backend.

## 3. Variables del frontend

Si no definís nada, `utils/api.js` usa estos orígenes, sin barra final:

| Variable | Por defecto | Recurso |
| --- | --- | --- |
| `NEXT_PUBLIC_PRODUCTS_URL` | `http://localhost:5050` | `/api/products` |
| `NEXT_PUBLIC_CARTS_URL` | `http://localhost:8080` | `/api/carts` |
| `NEXT_PUBLIC_BUY_URL` | `http://localhost:9090` | `/api/buy` |

Los mismos valores están en `.env.example`. Para apuntar a otros orígenes, desde `NuevoProyectoReact`:

```bash
cp .env.example .env.local
```

Next.js lee `NEXT_PUBLIC_*` al arrancar `npm run dev` y al ejecutar `npm run build`. No se actualizan en caliente. En desarrollo, frená el servidor y volvé a correr `npm run dev`. En producción local, volvé a correr `npm run build` antes de `npm start`.

## 4. Desarrollo

Desde `NuevoProyectoReact`:

```bash
npm ci
npm run dev
```

`npm ci` instala lo que fija `package-lock.json`. `npm run dev` es `next dev` y sirve http://localhost:3000.

`npm run lint` es `next lint`. Revisa el código. No recorre la tienda. Este repo no tiene un script `test`.

## 5. Producción local

También desde `NuevoProyectoReact`, con el backend ya corriendo. No la levantes junto con `npm run dev`: las dos usan el puerto 3000.

```bash
npm ci
npm run build
npm start
```

`npm run build` es `next build`. En ese build quedan fijas las `NEXT_PUBLIC_*`. `npm start` es `next start` y sirve ese resultado en http://localhost:3000.

## 6. Qué deberías ver

Abrí http://localhost:3000.

- La home muestra el carrusel con "WELCOME TO POWER SPORT" y, más abajo, el título SHOP.
- Shop muestra las tarjetas Men Section y Women Section. Debajo está el listado, con MEN y WOMEN.
- Sin backend, o sin productos cargados, ese listado queda vacío.
- Con el catálogo del paso 2, en MEN aparece "Jersey Boca Jrs". `countInStock` empieza en 20.

Para probar una compra:

1. En esa tarjeta, "View Product", elegí una cantidad, "Add to Cart" y "Yes".
2. "Cart" abre el panel. Ahí se ve la cantidad.
3. "Remove One" saca una unidad. "Remove All" saca el ítem.
4. "Buy Now", escribí un email y "Confirm Purchase".

Si el backend envió el correo, aparece "Your purchase is confirmed.", el número de Cart vuelve a 0 y el stock de ese producto vuelve al valor anterior. En el ejemplo, Jersey Boca Jrs queda otra vez en 20.

Esa vuelta del stock es deliberada. La compra no cobra ni deja el depósito descontado: el frontend repone las unidades para que la tienda se pueda probar de nuevo. No es un fallo.

Si faltan las variables de correo del backend, la compra no se confirma, el carrito sigue cargado y el stock no vuelve. El sitio muestra el error. El 503 está explicado en el README del backend.

![Home y shop de Power Sport](docs/tienda.png)

## Pendiente para publicarla

Las URLs ya no están fijas en el código. Para salir de localhost todavía falta decidir el hosting. Este sitio es Next.js y se sirve con `next start`. El backend es otro proceso, con tres puertos. No hay un proveedor elegido.

Además:

- MongoDB y las variables `CONNECTION_STRING` y `BREVO_*` del backend, con un remitente verificado en Brevo.
- Con `CORS_ORIGINS` vacío, el backend solo permite `http://localhost:3000`. Para publicarla hay que poner ahí el origen del sitio.
- Definir `NEXT_PUBLIC_PRODUCTS_URL`, `NEXT_PUBLIC_CARTS_URL` y `NEXT_PUBLIC_BUY_URL` en el build del frontend, con el origen público de cada servicio.
- `npm audit` del 11 de noviembre de 2026 reporta 17 avisos: 2 críticos, 11 altos y 4 moderados. Los críticos están en `next` y en `form-data`. Corregirlos implica subir Next y otras dependencias, con salto de versión y riesgo de romper el build. Queda pendiente.
- `eslint` está en 8.20.0 y `eslint-config-next` en 12.2.2, con Next 14.0.2. Alinear el config con Next 14 puede cambiar las reglas de lint. Queda pendiente.
- Varias imágenes viven en Imgur. Si esos enlaces dejan de responder, la tienda se ve rota. Pasarlas al repo sería un cambio aparte.

La reposición del stock después de comprar sigue siendo a propósito, para poder repetir la prueba.
