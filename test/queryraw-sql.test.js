import { prisma } from "../src/prisma-client";

describe("prisma client", () => {
  it("should be able to query sql", async () => {
    const id = 1;
    const values =
      await prisma.$queryRaw`SELECT * FROM example WHERE id = ${id}`;
    for (const row of values) {
      console.log(`id = ${row.id}, name = ${row.name}`);
    }
    expect(values).toBeTruthy();
    expect(values[0]).toMatchObject({
      id: "1",
    });
  });
});
