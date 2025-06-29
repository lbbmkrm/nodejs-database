import { prisma } from "../src/prisma-client";

async function seedDatabase() {
  await prisma.user.createMany({
    data: [
      { email: "a@example.com", name: "Alice", age: 25 },
      { email: "b@example.com", name: "Bob", age: 30 },
      { email: "c@example.com", name: "Charlie", age: 35 },
      { email: "d@example.com", name: "David", age: 40 },
      { email: "e@example.com", name: "Eve", age: 45 },
    ],
  });

  const a = await prisma.user.findUnique({
    where: {
      email: "a@example.com",
    },
  });
  const b = await prisma.user.findUnique({
    where: {
      email: "b@example.com",
    },
  });
  const c = await prisma.user.findUnique({
    where: {
      email: "c@example.com",
    },
  });
  const d = await prisma.user.findUnique({
    where: {
      email: "d@example.com",
    },
  });
  const e = await prisma.user.findUnique({
    where: {
      email: "e@example.com",
    },
  });
  await prisma.post.createMany({
    data: [
      {
        userId: a.id,
        title: "Blog a",
        content: "Blog content a",
      },
      {
        userId: b.id,
        title: "Blog b",
        content: "Blog content b",
      },
      {
        userId: c.id,
        title: "Blog c",
        content: "Blog content c",
      },
      {
        userId: d.id,
        title: "Blog d",
        content: "Blog content d",
      },
      {
        userId: e.id,
        title: "Blog e",
        content: "Blog content e",
      },
    ],
  });
}

describe("prisma client - relation", () => {
  beforeEach(async () => {
    await prisma.$executeRaw`DELETE FROM users`;
    await prisma.$executeRaw`DELETE FROM posts`;
    await prisma.$executeRaw`DELETE FROM profiles`;
    await prisma.$executeRaw`DELETE FROM likes`;
  });

  it("should be able to create user with profiles and posts ", async () => {
    const user = await prisma.user.create({
      data: {
        email: "johndoe@example.com",
        name: "John Doe",
        profile: {
          create: {
            bio: "Example bio",
            address: "123 Main st",
          },
        },
        post: {
          create: [
            {
              title: "Example post",
              content: "Example content",
            },
            {
              title: "Example post2",
              content: "Example content2",
            },
          ],
        },
      },
      include: {
        profile: true,
        post: true,
      },
    });
    expect(user.profile).toMatchObject({
      bio: "Example bio",
      address: "123 Main st",
    });
    expect(user.post).toMatchObject([
      {
        title: "Example post",
        content: "Example content",
      },
      {
        title: "Example post2",
        content: "Example content2",
      },
    ]);
  });

  it("should be able to create like", async () => {
    await seedDatabase();
    const user = await prisma.user.findUnique({
      where: {
        email: "b@example.com",
      },
    });
    const user2 = await prisma.user.findUnique({
      where: {
        email: "d@example.com",
      },
    });

    const post = await prisma.post.findFirst({
      where: {
        title: {
          equals: "Blog a",
        },
      },
    });
    const post2 = await prisma.post.findFirst({
      where: {
        title: {
          equals: "Blog e",
        },
      },
    });
    const like = await prisma.like.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        post: {
          connect: {
            id: post.id,
          },
        },
      },
    });
    await prisma.like.createMany({
      data: [
        {
          userId: user2.id,
          postId: post2.id,
        },
        {
          userId: user2.id,
          postId: post.id,
        },
      ],
    });
    console.log("Like : ", like);
    expect(like).toMatchObject({
      userId: user.id,
      postId: post.id,
    });
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });
    expect(like).toMatchObject({
      userId: user.id,
      postId: post.id,
    });
    const toBeNull = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });
    expect(toBeNull).toBeFalsy();
  });
});
