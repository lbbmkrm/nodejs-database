import { prisma } from "../src/prisma-client";

async function insertDatabase() {
  await prisma.user.createMany({
    data: [
      { email: "johndoe@example.com", name: "John Doe" },
      { email: "janedoe@example.com", name: "Jane Doe" },
      { email: "foobar@example.com", name: "Foo Bar" },
    ],
  });
}

describe("prisma client", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should be able to create data", async () => {
    /**
     * prisma.user.create
     * Membuat satu record user baru.
     * Return: Promise<User> — objek user lengkap.
     */
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
      },
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("johndoe@example.com");

    /**
     * prisma.user.createMany
     * Membuat banyak record user sekaligus.
     * Return: Promise<{ count: number }> — jumlah record berhasil dibuat.
     */
    const users = await prisma.user.createMany({
      data: [
        { name: "Jane Doe", email: "janedoe@example.com" },
        { name: "Foo Bar", email: "foobar@example.com" },
      ],
    });

    expect(users.count).toBe(2);
  });

  it("should be able to read data", async () => {
    // Insert dummy data sebelum membaca
    await insertDatabase();

    /**
     * findUnique — mencari user berdasarkan kolom unik (email).
     * Return: object record table / null
     */
    const uniqueData = await prisma.user.findUnique({
      where: { email: "janedoe@example.com" },
    });

    expect(uniqueData).not.toBeNull();
    expect(uniqueData).toMatchObject({
      name: "Jane Doe",
      email: "janedoe@example.com",
    });

    /**
     * findFirst — ambil user pertama yang cocok dengan filter tertentu.
     * return object record table / null
     */
    const first = await prisma.user.findFirst({
      where: { name: "Jane Doe" },
    });

    expect(first).toMatchObject({
      email: "janedoe@example.com",
      name: "Jane Doe",
    });

    /**
     * findMany — ambil semua user (tanpa filter).
     * Return: array of User
     */
    const findMany = await prisma.user.findMany();
    expect(findMany.length).toBeGreaterThanOrEqual(3);

    /**
     * count — menghitung jumlah total record user.
     * Return: number
     */
    const countRecord = await prisma.user.count();
    expect(countRecord).toBe(3);
  });

  it("should be able to update data", async () => {
    await insertDatabase();

    const johndoe = await prisma.user.findUnique({
      where: { email: "johndoe@example.com" },
    });

    /**
     * update — mengubah data user berdasarkan ID.
     * Return: User yang sudah diperbarui.
     */
    const updatedData = await prisma.user.update({
      where: { id: johndoe.id },
      data: {
        name: "updated name",
        email: "updatedemail@example.com",
      },
    });

    expect(updatedData).toMatchObject({
      name: "updated name",
      email: "updatedemail@example.com",
    });

    /**
     * updateMany — mengubah banyak record sekaligus.
     * Return: { count: number }
     */
    const updateMany = await prisma.user.updateMany({
      data: {
        phone: "08999999999",
      },
    });

    expect(updateMany.count).toBeGreaterThanOrEqual(3);

    /**
     * upsert — jika user ditemukan berdasarkan email, update.
     * Jika tidak ditemukan, maka create.
     */
    const upsert = await prisma.user.upsert({
      where: { email: "janesmith@example.com" },
      update: {
        name: "jane smith updated",
      },
      create: {
        email: "janesmith@example.com",
        name: "Jane Smith",
      },
    });

    expect(upsert).toMatchObject({
      email: "janesmith@example.com",
      name: "Jane Smith",
    });
  });

  it("should be able to delete data", async () => {
    await insertDatabase();

    const johndoe = await prisma.user.findUnique({
      where: { email: "johndoe@example.com" },
    });

    expect(johndoe).not.toBeNull();

    /**
     * delete — menghapus satu user berdasarkan ID.
     * Return: user yang dihapus.
     */
    const deleted = await prisma.user.delete({
      where: { id: johndoe.id },
    });

    expect(deleted).toMatchObject({
      email: "johndoe@example.com",
      name: "John Doe",
    });

    const shouldBeNull = await prisma.user.findUnique({
      where: { id: johndoe.id },
    });

    expect(shouldBeNull).toBeNull();

    /**
     * deleteMany — menghapus semua user.
     * findMany harus mengembalikan array kosong [].
     */
    await prisma.user.deleteMany();
    const getAll = await prisma.user.findMany();
    expect(getAll.length).toBe(0);
  });
  /**
   * afterAll
   * Hook yang dijalankan setelah semua test selesai.
   * Fungsinya adalah menutup koneksi Prisma agar proses berhenti bersih.
   */
  afterAll(async () => {
    await prisma.$disconnect();
  });
});
