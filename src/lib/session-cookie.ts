// Nombre de la cookie de sesión, en su propio archivo sin más dependencias.
// El proxy (middleware) corre en el Edge Runtime y no puede cargar módulos
// que dependan de Node.js (como Prisma o bcryptjs) — por eso este valor no
// vive en src/lib/auth.ts, para no arrastrar esas dependencias al bundle del
// Edge cuando el proxy solo necesita el nombre de la cookie.
export const SESSION_COOKIE = "fp_session";
