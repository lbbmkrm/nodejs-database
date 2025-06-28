import { prisma } from "../src/prisma-client";

describe("prisma client", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
  });
  it("should be able to transaction data with sequential transaction", async () => {
    // sequential transaction return value array
    const [user, post, ...others] = await prisma.$transaction([
      // operasi pertama
      prisma.user.create({
        data: {
          email: "johndoe@example.com",
          name: "John Doe",
        },
      }),
      // operasi kedua
      prisma.post.create({
        data: {
          title: "Foobar",
          content: "Example content",
        },
      }),
      //   operasi ketiga
      prisma.user.createMany({
        data: [
          {
            email: "janedoe@example.com",
            name: "Jane Doe",
          },
          {
            email: "janesmith@example.com",
            name: "Jane Smith",
          },
        ],
      }),
      //   operasi keempat
      prisma.user.deleteMany(),
    ]);
    expect(user).toMatchObject({
      email: "johndoe@example.com",
      name: "John Doe",
    });
    expect(post).toMatchObject({
      title: "Foobar",
      content: "Example content",
    });
    expect(others[0].count).toBe(2);
    expect(others[1].count).toBe(3);
  });

  it("should be able to transaction data with interactive transaction", async () => {
    // interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: "johndoe@example.com",
          name: "John Doe",
        },
      });
      const posts = await tx.post.createMany({
        data: [
          {
            title: "Post 1",
            content: "Example content post 1",
          },
          {
            title: "Post 2",
            content: "Example content post 2",
          },
          {
            title: "Post 3",
            content: "Example content post 3",
          },
        ],
      });
      const updatedPosts = await tx.post.updateMany({
        data: {
          description: `Blog created by ${user.name}`,
        },
      });
      const post = await tx.post.create({
        data: {
          title: "Post 4",
          content: "Example content 4",
        },
      });
      const deletePosts = await tx.post.deleteMany({
        where: {
          description: `Blog created by ${user.name}`,
        },
      });

      return {
        user,
        post,
        posts,
        updatedPosts,
        deletePosts,
      };
    });

    expect(result.user).toMatchObject({
      email: "johndoe@example.com",
      name: "John Doe",
    });
    expect(result.post).toMatchObject({
      title: "Post 4",
      content: "Example content 4",
    });
    expect(result.posts.count).toBe(3);
    expect(result.deletePosts.count).toBe(3);
  });
});
