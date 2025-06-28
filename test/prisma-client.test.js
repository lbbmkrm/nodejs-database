import { PrismaClient } from "@prisma/client";

describe("prisma client", () => {
  test("test koneksi ke database", async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    // do something

    await prisma.$disconnect();
  });
});
