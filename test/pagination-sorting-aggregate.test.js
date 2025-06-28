import { prisma } from "../src/prisma-client";

async function seedUser() {
  await prisma.user.createMany({
    data: [
      { email: "a@example.com", name: "Alice", age: 25 },
      { email: "b@example.com", name: "Bob", age: 30 },
      { email: "c@example.com", name: "Charlie", age: 35 },
      { email: "d@example.com", name: "David", age: 40 },
      { email: "e@example.com", name: "Eve", age: 45 },
    ],
  });
}

describe("prisma client - pagination, sorting, aggregate, where", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should be able paginate data", async () => {
    await seedUser();
    const users = await prisma.user.findMany({
      take: 4,
      skip: 1,
      orderBy: {
        id: "asc",
      },
    });
    expect(users.length).toBe(4);
    expect(users).not.toMatchObject({
      email: "a@example.com",
      name: "Alice",
      age: 25,
    });
  });
  it("should be able to sort data", async () => {
    await seedUser();
    const users = await prisma.user.findMany({
      orderBy: { age: "desc" }, //aggregate
    });

    expect(users[0]).toMatchObject({
      email: "e@example.com",
      name: "Eve",
    });
    const lastData = users.length - 1;
    expect(users[lastData]).toMatchObject({
      email: "a@example.com",
      name: "Alice",
    });
  });
  it("should be able to apply where filter", async () => {
    await seedUser();
    let users = await prisma.user.findMany({
      where: {
        age: {
          gt: 30, //greather than
        },
      },
    });
    expect(users.length).toBe(3);

    users = await prisma.user.findMany({
      where: {
        age: {
          gte: 30, //greather than equals
        },
      },
    });

    expect(users.length).toBe(4);
    users = await prisma.user.findMany({
      where: {
        age: {
          lt: 30, //less than
        },
      },
    });
    expect(users.length).toBe(1);

    /* 
    selain gt,lt : 
    equals, not, in[], notIn[], contains, startsWith, endsWith 
     */
  });
});
