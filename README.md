# Nosotros Finanzas 💛

Aplicación web de finanzas personales **compartidas** para dos personas (Xavier y
Camila): registro de ingresos y gastos individuales/compartidos, dashboard con
gráficos, presupuestos mensuales, metas de ahorro y control de saldos entre
ambos. Responsive, instalable como PWA, sin correos ni contraseñas.

## Stack técnico

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **Prisma 5 + PostgreSQL** — para poder desplegarse en hostings sin disco persistente (Vercel, etc.)
- **Tailwind CSS 4** — sistema de diseño propio con tokens light/dark
- **Recharts** — gráficos (barras, líneas) con paleta accesible/daltonismo-safe
- **bcryptjs** — hash del PIN opcional (sin contraseñas de verdad, sin correos)
- Service Worker + Web App Manifest → instalable como PWA

## Puesta en marcha (local)

Necesitas una base de datos PostgreSQL (local o gratis en la nube, ver
[Neon](https://neon.tech)).

```bash
npm install
cp .env.example .env          # pega tu DATABASE_URL de Postgres
npm run db:push               # crea las tablas a partir del esquema
npm run db:seed               # crea los usuarios Xavier y Camila
npm run dev                   # http://localhost:3000
```

Scripts útiles:

| Script              | Qué hace                                       |
| -------------------- | ----------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                          |
| `npm run build`       | Build de producción                             |
| `npm run start`       | Sirve el build de producción                    |
| `npm run lint`        | ESLint                                          |
| `npm run db:push`     | Sincroniza las tablas con `prisma/schema.prisma` |
| `npm run db:seed`     | (Re)crea los usuarios Xavier y Camila            |
| `npm run db:studio`   | Explorador visual de la base de datos            |

## Publicarla en la web (para entrar desde cualquier navegador/celular)

La combinación más simple y gratuita es **Vercel** (hosting, hecho por los
creadores de Next.js) + **Neon** (Postgres gratis en la nube). Son ~10
minutos, sin tarjeta de crédito:

1. **Base de datos — [neon.tech](https://neon.tech)**
   - Crea una cuenta gratis (puedes usar tu cuenta de GitHub).
   - "Create a project" → cualquier nombre y región.
   - En el dashboard del proyecto, copia el **Connection string** (el que
     dice "Pooled connection"). Se ve así:
     `postgresql://usuario:password@ep-algo-pooler.region.aws.neon.tech/neondb?sslmode=require`

2. **Hosting — [vercel.com](https://vercel.com)**
   - Crea una cuenta gratis con tu mismo GitHub.
   - "Add New…" → "Project" → importa el repositorio
     `Xavier6car/finanzas-personales`.
   - En "Environment Variables" agrega:
     - `DATABASE_URL` = el connection string de Neon del paso 1.
   - Click en **Deploy**. Cuando termine, Vercel te da una URL como
     `https://finanzas-personales-xxxx.vercel.app` — esa es la que abren
     Xavier y Camila desde cualquier navegador o celular.

3. **Crear las tablas y los usuarios en la base de producción** (una sola
   vez). Desde tu computadora, con el repo clonado:
   ```bash
   npm install
   echo 'DATABASE_URL="<el connection string de Neon>"' > .env
   npm run db:push
   npm run db:seed
   ```
   (También puedo hacer este paso yo si me compartes el connection string
   de Neon en el chat.)

4. Listo — recarga la URL de Vercel y ya debería aparecer la pantalla
   "¿Quién eres?". Cada vez que se haga `git push` a esta rama, Vercel
   vuelve a desplegar automáticamente.

> Si prefieres otro hosting (Netlify, Railway, tu propio servidor, etc.) el
> único requisito es exponer la variable `DATABASE_URL` apuntando a un
> Postgres accesible desde ahí; el resto del proyecto es un Next.js estándar.

## Cómo funciona el acceso

No hay registro con correo/contraseña. Al entrar se pregunta **"¿Quién eres?"**
y cada quien elige su nombre. La sesión se recuerda en el dispositivo (cookie
de 1 año) y se puede cambiar de usuario en cualquier momento desde el menú.
Opcionalmente, en **Ajustes** se puede configurar un PIN de 4-6 dígitos por
persona y exigirlo al ingresar. Ambos usuarios ven siempre la misma
información: no hay datos privados entre Xavier y Camila.

## Módulos

- **Dashboard** — resumen del período (ingresos/gastos por persona, balance,
  ahorro acumulado, % de ingresos gastado) con selector de período (este mes,
  mes anterior, últimos 3 meses, este año, rango personalizado) y gráficos de
  gastos por categoría, ingresos vs. gastos por persona, evolución mensual y
  compartido vs. individual.
- **Ingresos** — registro con tipo, descripción, monto, fecha y cuenta/medio
  opcional. Editar/eliminar con confirmación.
- **Gastos** — registro con categoría, descripción (obligatoria), monto y
  fecha. Puede marcarse como **compartido** con división **50/50** o
  **personalizada** (valida que la suma coincida con el total). Se distingue
  siempre "quién pagó" de "a quién corresponde" cada parte.
- **Historial** — todos los movimientos (ingresos + gastos) con filtros por
  persona, tipo, categoría, mes, rango de fechas, compartidos y texto de
  búsqueda; orden por fecha o monto; editar/eliminar.
- **Presupuestos** — presupuesto mensual por categoría, por persona o conjunto
  (hogar), con barra de progreso y alertas visuales al acercarse (≥80%) o
  superar (100%) el límite.
- **Metas de ahorro** — objetivo, fecha meta, aportes de cada persona, barra
  de progreso y cálculo de cuánto falta.
- **Saldos entre nosotros** — cuánto pagó cada quien en gastos compartidos,
  cuánto le corresponde asumir y quién debe pagarle a quién para saldar
  cuentas. Configurable como **control de reembolsos** o **solo control
  presupuestario** (sin generar deudas) desde Ajustes.
- **Ajustes** — PIN por usuario, exigir PIN al ingresar, modo de saldos
  compartidos, cambiar de usuario.

## Notas de diseño y límites conocidos

- La moneda principal es **USD**; el campo existe en el esquema para admitir
  otras monedas en el futuro, pero el dashboard suma montos asumiendo una sola
  moneda.
- Pensada para **2 usuarios fijos** (Xavier y Camila) sembrados por el script
  de seed; no hay un flujo de alta de usuarios adicionales.
- El Service Worker cachea únicamente el "app shell" (íconos, manifest,
  página de respaldo offline): los datos financieros requieren conexión, ya
  que viven en la base de datos vía Server Actions.
- El esquema usa `prisma db push` en lugar de migraciones versionadas, por
  simplicidad para una app de 2 usuarios. Si el proyecto crece, se puede
  migrar a `prisma migrate` sin cambiar el resto del código.
