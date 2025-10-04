const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Conversation = require("../../model/conversation");
const conversationRepository = require("../../repository/conversationRepository");
const User = require("../../model/user");
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
  await Conversation.deleteMany(); // clean up
});

describe("ConversationRepository", () => {
  test("createConversation - thành công", async () => {
    const fakeUserId = "68522e2ae4be0e3a5bd03bc9";

    const result = await conversationRepository.createConversation({
      user_id: fakeUserId,
      title: "Cuộc trò chuyện thử nghiệm",
      mood_before: 3,
      mood_after: 7,
    });

    expect(result.success).toEqual(true);
    expect(result.message).toEqual("Thêm conversation vào database thành công");

    const created = await Conversation.findOne({ user_id: fakeUserId });
    expect(created).not.toEqual(null);
    expect(created.mood_before).toEqual(3);
    expect(created.mood_after).toEqual(7);
  });

  test("createConversation - thiếu trường bắt buộc", async () => {
    const result = await conversationRepository.createConversation({
      // thiếu user_id, mood_after
      title: "Thiếu dữ liệu",
      mood_before: 5,
    });

    expect(result.success).toEqual(false);
    expect(result.message).toEqual(
      "Thiếu thông tin bắt buộc để tạo conversation"
    );
  });

  test("getConversationByUserId - có dữ liệu", async () => {
    const userId = "68522e2ae4be0e3a5bd03bbf";

    await Conversation.insertMany([
      { user_id: userId, title: "A", mood_before: 5, mood_after: 8 },
      { user_id: userId, title: "B", mood_before: 4, mood_after: 9 },
    ]);

    const result = await conversationRepository.getConversationByUserId(
      userId.toString()
    );
    expect(result.success).toEqual(true);
    expect(result.conversations.length).toEqual(2);
    expect(result.conversations[0]).toHaveProperty("title");
  });

  test("getConversationByUserId - không có dữ liệu", async () => {
    const userId = new mongoose.Types.ObjectId();
    const result = await conversationRepository.getConversationByUserId(
      userId.toString()
    );

    expect(result.success).toEqual(false);
    expect(result.message).toEqual(
      "Không có dữ liệu conversation cho user này"
    );
  });
});
