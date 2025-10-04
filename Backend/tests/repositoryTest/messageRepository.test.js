const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Message = require("../../model/message");
const messageRepository = require("../../repository/messageRepository");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Message.deleteMany();
});

describe("MessageRepository", () => {
  test("createMessage - success", async () => {
    const fakeConversationId = new mongoose.Types.ObjectId();

    const data = {
      content: "Xin chào",
      sender: "user",
      conversation_id: fakeConversationId,
      emotion: "happy",
    };

    const result = await messageRepository.createMessage(data);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Thêm dữ liệu message thành công");

    const saved = await Message.findOne({
      conversation_id: fakeConversationId,
    });
    expect(saved).not.toBeNull();
    expect(saved.sender).toBe("user");
    expect(saved.emotion).toBe("happy");
    expect(saved.content).toBe("Xin chào");
  });

  test("createMessage - thiếu content → fail", async () => {
    const fakeConversationId = new mongoose.Types.ObjectId();

    const data = {
      // thiếu content
      sender: "bot",
      conversation_id: fakeConversationId,
    };

    const result = await messageRepository.createMessage(data);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Lỗi khi thêm dữ liệu vào message");
  });

  test("findByConversationId - success", async () => {
    const c1 = new mongoose.Types.ObjectId();
    const c2 = new mongoose.Types.ObjectId();

    await Message.insertMany([
      { content: "A", sender: "user", conversation_id: c1, emotion: "neutral" },
      { content: "B", sender: "bot", conversation_id: c1, emotion: "sad" },
      { content: "C", sender: "user", conversation_id: c2, emotion: "angry" },
    ]);

    const result = await messageRepository.findByConversationId(c1.toString());

    expect(result.success).toBe(true);
    expect(result.messages.length).toBe(2);
    expect(result.messages[0].conversation_id.toString()).toBe(c1.toString());
  });

  test("findByConversationId - không tìm thấy", async () => {
    const result = await messageRepository.findByConversationId(
      new mongoose.Types.ObjectId().toString()
    );

    expect(result.success).toBe(true);
    expect(result.messages).toEqual([]);
  });
});
