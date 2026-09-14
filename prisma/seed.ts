import { PrismaClient } from "@prisma/client";
import { CATEGORICAL_COLORS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { name: "Xavier" },
    update: {},
    create: { name: "Xavier", color: CATEGORICAL_COLORS.blue.light },
  });

  await prisma.user.upsert({
    where: { name: "Camila" },
    update: {},
    create: { name: "Camila", color: CATEGORICAL_COLORS.magenta.light },
  });

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log("Seed completado: usuarios Xavier y Camila listos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
