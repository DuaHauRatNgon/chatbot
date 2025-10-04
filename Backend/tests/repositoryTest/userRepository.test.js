const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../model/User");
const userRepository = require("../../repository/userRepository");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("UserRepository", () => {
  test("register - new user", async () => {
    const userData = {
      email: "test@example.com",
      hashedPassword: "123456",
      name: "Test User",
      age: 25,
      gender: "male",
    };

    const result = await userRepository.register(userData);
    expect(result.success).toBe(true);
    expect(result.user.email).toBe("test@example.com");
  });

  test("register - duplicate email", async () => {
    const userData = {
      email: "duplicate@example.com",
      hashedPassword: "123456",
      name: "Dup User",
      age: 20,
      gender: "female",
    };

    // Tạo user trước
    await User.create(userData);

    const result = await userRepository.register(userData);
    expect(result.success).toBe(false);
    expect(result.message).toBe("Tài khoản đã tồn tại");
  });

  test("login - success", async () => {
    const user = await User.create({
      email: "login@example.com",
      hashedPassword: "abc123",
      name: "Login User",
      age: 30,
      gender: "male",
    });

    const result = await userRepository.login("login@example.com");
    expect(result.success).toBe(true);
    expect(result.user.email).toBe("login@example.com");
  });

  test("login - wrong email", async () => {
    const result = await userRepository.login("notfound@example.com");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Sai email");
  });
});
