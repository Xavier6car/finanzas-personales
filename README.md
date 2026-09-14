# Nosotros Finanzas 💛

Aplicación web de finanzas personales **compartidas** para dos personas (Xavier y
Camila): registro de ingresos y gastos individuales/compartidos, dashboard con
gráficos, presupuestos mensuales, metas de ahorro y control de saldos entre
ambos. Responsive, instalable como PWA, sin correos ni contraseñas.

## Stack técnico

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **Prisma 5 + SQLite** — base de datos basada en archivo, simple de operar para 2 usuarios
- **Tailwind CSS 4** — sistema de diseño propio con tokens light/dark
- **Recharts** — gráficos (barras, líneas) con paleta accesible/daltonismo-safe
- **bcryptjs** — hash del PIN opcional (sin contraseñas de verdad, sin correos)
- Service Worker + Web App Manifest → instalable como PWA

## Puesta en marcha

```bash
npm install
cp .env.example .env          # define DATABASE_URL (SQLite por defecto)
npx prisma migrate dev        # crea la base de datos y las tablas
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
| `npm run db:migrate`  | Nueva migración de Prisma                       |
| `npm run db:seed`     | (Re)crea los usuarios Xavier y Camila            |
| `npm run db:studio`   | Explorador visual de la base de datos            |

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
- SQLite es ideal para uso personal de 2 personas; para desplegar en un
  entorno con múltiples instancias del servidor, cambia `DATABASE_URL` a
  Postgres/MySQL y ajusta el `provider` en `prisma/schema.prisma` (el resto
  del código no depende del motor).
