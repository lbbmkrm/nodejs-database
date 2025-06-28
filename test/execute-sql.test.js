import { prisma } from "../src/prisma-client";

describe("prisma client", () => {
  it("should be able to execute sql", async () => {
    const id = 1;
    const name = "John Doe";
    await prisma.$executeRaw`DELETE FROM example`;
    const affected =
      await prisma.$executeRaw`INSERT INTO example(id,name) VALUES(${id}, ${name})`;
    expect(affected).toBe(1);
  });
});
