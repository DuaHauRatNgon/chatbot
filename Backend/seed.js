const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import các models
const User = require("./model/user");
const Conversation = require("./model/conversation");
const Message = require("./model/message");

// Cấu hình môi trường
const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SEED_COUNT: {
    USERS: parseInt(process.env.SEED_USERS) || 10,
    CONVERSATIONS_PER_USER:
      parseInt(process.env.SEED_CONVERSATIONS_PER_USER) || 3,
    MESSAGES_PER_CONVERSATION:
      parseInt(process.env.SEED_MESSAGES_PER_CONVERSATION) || 8,
  },
};

// Faker locale cho tiếng Việt
faker.locale = "vi";

// Kết nối database với retry logic
const connectDB = async (retries = 5) => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(config.MONGODB_URI, options);

  } catch (error) {
    console.error(
      `❌ Lỗi kết nối MongoDB (${retries} lần thử còn lại):`,
      error.message
    );

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return connectDB(retries - 1);
    } else {
      console.error("💥 Không thể kết nối database sau nhiều lần thử");
      process.exit(1);
    }
  }
};

// Hàm tạo users với validation tốt hơn
const createUsers = async (count = config.SEED_COUNT.USERS) => {
  const users = [];
  const emails = new Set(); // Đảm bảo email unique


  for (let i = 0; i < count; i++) {
    try {
      let email;
      let attempts = 0;

      // Đảm bảo email unique
      do {
        email = faker.internet.email().toLowerCase();
        attempts++;
        if (attempts > 50) {
          throw new Error("Không thể tạo email unique sau 50 lần thử");
        }
      } while (emails.has(email));

      emails.add(email);

      const password = faker.internet.password({ length: 12 });
      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      const user = {
        name: faker.person.fullName(),
        email: email,
        hashedPassword: hashedPassword,
        age: faker.number.int({ min: 16, max: 80 }),
        gender: faker.helpers.arrayElement(["male", "female"]),
        role: i === 0 ? "admin" : "customer", // User đầu tiên là admin
        created_at: faker.date.past({ years: 2 }),
      };

      users.push(user);

      if (config.NODE_ENV === "development") {
      }
    } catch (error) {
      console.error(`❌ Lỗi tạo user ${i + 1}:`, error.message);
      continue;
    }
  }

  if (users.length === 0) {
    throw new Error("Không thể tạo users nào");
  }

  const createdUsers = await User.insertMany(users);
  return createdUsers;
};

// Hàm tạo conversations với mood logic hợp lý hơn
const createConversations = async (
  users,
  conversationsPerUser = config.SEED_COUNT.CONVERSATIONS_PER_USER
) => {
  const conversations = [];

  // Danh sách tiêu đề cuộc trò chuyện có ý nghĩa
  const conversationTitles = [
    "Tâm sự về công việc",
    "Chia sẻ về tình cảm",
    "Hỏi về sức khỏe tinh thần",
    "Tư vấn học tập",
    "Nói chuyện về gia đình",
    "Thắc mắc về cuộc sống",
    "Hỗ trợ tâm lý",
    "Giải tỏa căng thẳng",
    "Lời khuyên về mối quan hệ",
    "Động viên tinh thần",
    "Chia sẻ cảm xúc",
    "Hướng dẫn thư giãn",
  ];


  for (const user of users) {
    for (let i = 0; i < conversationsPerUser; i++) {
      try {
        const moodBefore = faker.number.int({ min: 1, max: 10 });
        // Mood after thường tốt hơn mood before (giả định chatbot có hiệu quả)
        const moodAfter = Math.min(
          10,
          moodBefore + faker.number.int({ min: 0, max: 3 })
        );

        const conversation = {
          user_id: user._id,
          title: faker.helpers.arrayElement(conversationTitles),
          mood_before: moodBefore,
          mood_after: moodAfter,
          created_at: faker.date.between({
            from: user.created_at,
            to: new Date(),
          }),
        };

        conversations.push(conversation);
      } catch (error) {
        console.error(
          `❌ Lỗi tạo conversation cho user ${user.name}:`,
          error.message
        );
        continue;
      }
    }
  }

  if (conversations.length === 0) {
    throw new Error("Không thể tạo conversations nào");
  }

  const createdConversations = await Conversation.insertMany(conversations);
  return createdConversations;
};

// Hàm tạo messages với nội dung được sửa lỗi và phong phú hơn
const createMessages = async (
  conversations,
  messagesPerConversation = config.SEED_COUNT.MESSAGES_PER_CONVERSATION
) => {
  const messages = [];

  // Danh sách tin nhắn mẫu cho user (đã sửa lỗi chính tả)
  const userMessages = [
    "Hôm nay tôi cảm thấy rất căng thẳng",
    "Tôi gặp khó khăn trong công việc",
    "Làm thế nào để tôi có thể cảm thấy tốt hơn?",
    "Tôi đang lo lắng về tương lai",
    "Cảm ơn bạn đã lắng nghe tôi",
    "Tôi muốn chia sẻ về ngày hôm nay",
    "Tôi cần lời khuyên về mối quan hệ",
    "Làm sao để tôi có thể tự tin hơn?",
    "Tôi đang trải qua một thời gian khó khăn",
    "Bạn có thể giúp tôi không?",
    "Tôi cảm thấy buồn chán với cuộc sống",
    "Mọi thứ dường như không như ý muốn",
    "Tôi không biết phải làm gì tiếp theo",
    "Có khi nào bạn cũng cảm thấy cô đơn không?",
    "Tôi muốn thay đổi bản thân",
    "Làm thế nào để vượt qua nỗi sợ hãi?",
    "Tôi cảm thấy áp lực từ gia đình",
    "Bạn có thể chia sẻ kinh nghiệm không?",
  ];

  // Danh sách tin nhắn mẫu cho bot (phong phú và tự nhiên hơn)
  const botMessages = [
    "Tôi hiểu bạn đang cảm thấy căng thẳng. Hãy thử thở sâu và thư giãn nhé.",
    "Mọi khó khăn đều có thể vượt qua được. Bạn có muốn chia sẻ cụ thể không?",
    "Có nhiều cách để cải thiện tâm trạng. Bạn thích hoạt động nào nhất?",
    "Lo lắng là điều bình thường. Hãy tập trung vào những gì bạn có thể kiểm soát.",
    "Rất vui được giúp đỡ bạn. Tôi luôn ở đây khi bạn cần.",
    "Cảm ơn bạn đã chia sẻ. Điều gì khiến bạn cảm thấy ấn tượng nhất hôm nay?",
    "Mối quan hệ cần sự hiểu biết và giao tiếp. Bạn đã thử nói chuyện thẳng thắn chưa?",
    "Sự tự tin đến từ việc chấp nhận bản thân. Bạn có nhiều điểm mạnh đấy.",
    "Thời gian khó khăn sẽ qua đi. Bạn mạnh mẽ hơn bạn nghĩ.",
    "Tất nhiên! Tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.",
    "Cảm giác buồn chán thỉnh thoảng là bình thường. Hãy thử tìm một hoạt động mới nhé.",
    "Không phải lúc nào mọi thứ cũng diễn ra như ý. Điều quan trọng là cách chúng ta phản ứng.",
    "Đôi khi không biết bước tiếp theo cũng là một cơ hội để khám phá.",
    "Cô đơn là cảm xúc con người ai cũng trải qua. Bạn không đơn độc trong điều này.",
    "Muốn thay đổi là bước đầu tuyệt vời. Bạn muốn bắt đầu từ điều gì nhỏ nhất?",
    "Nỗi sợ hãi thường không đáng sợ như chúng ta tưởng. Hãy đối mặt từng bước nhỏ.",
    "Áp lực gia đình có thể nặng nề. Bạn đã thử trò chuyện với họ về cảm nhận chưa?",
    "Tôi sẵn sàng chia sẻ. Bạn muốn nghe về chủ đề nào cụ thể?",
  ];


  for (const [index, conversation] of conversations.entries()) {
    try {
      const conversationMessages = [];

      for (let i = 0; i < messagesPerConversation; i++) {
        // Xen kẽ tin nhắn giữa user và bot
        const isUserMessage = i % 2 === 0;
        const sender = isUserMessage ? "user" : "bot";
        const messageArray = isUserMessage ? userMessages : botMessages;

        // Tạo timestamp hợp lý (tin nhắn sau phải muộn hơn tin nhắn trước)
        const baseTime = conversation.created_at;
        const messageTime = new Date(baseTime.getTime() + i * 2 * 60 * 1000); // Cách nhau 2 phút

        // Xác định emotion dựa trên mood và sender
        let emotion;
        if (isUserMessage) {
          // User emotion dựa trên mood_before/after
          const avgMood =
            (conversation.mood_before + conversation.mood_after) / 2;
          if (avgMood <= 3) emotion = "sad";
          else if (avgMood <= 5) emotion = "neutral";
          else if (avgMood <= 7) emotion = "happy";
          else emotion = "happy";
        } else {
          // Bot thường neutral hoặc positive
          emotion = faker.helpers.arrayElement(["neutral", "happy", "happy"]); // Bias về positive
        }

        const message = {
          conversation_id: conversation._id,
          content: faker.helpers.arrayElement(messageArray),
          sender: sender,
          timestamp: messageTime,
          emotion: emotion,
        };

        conversationMessages.push(message);
      }

      messages.push(...conversationMessages);

      // Progress indicator
      if ((index + 1) % 10 === 0) {

      }
    } catch (error) {
      console.error(
        `❌ Lỗi tạo messages cho conversation ${conversation._id}:`,
        error.message
      );
      continue;
    }
  }

  if (messages.length === 0) {
    throw new Error("Không thể tạo messages nào");
  }

  // Insert theo batch để tối ưu performance
  const batchSize = 1000;
  const createdMessages = [];

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    try {
      const batchResult = await Message.insertMany(batch);
      createdMessages.push(...batchResult);
      console.log(
        `📦 Đã insert batch ${Math.floor(i / batchSize) + 1}: ${
          batchResult.length
        } messages`
      );
    } catch (error) {
      console.error(
        `❌ Lỗi insert batch ${Math.floor(i / batchSize) + 1}:`,
        error.message
      );
    }
  }

  console.log(`✅ Đã tạo ${createdMessages.length} tin nhắn`);
  return createdMessages;
};

// Hàm xóa dữ liệu cũ với confirmation
const clearDatabase = async (force = false) => {
  try {
    if (!force && config.NODE_ENV === "production") {
      throw new Error(
        "Không được phép xóa dữ liệu trong môi trường production mà không có cờ force"
      );
    }

    console.log("🗑️  Đang xóa dữ liệu cũ...");

    const deleteResults = await Promise.allSettled([
      Message.deleteMany({}),
      Conversation.deleteMany({}),
      User.deleteMany({}),
    ]);

    deleteResults.forEach((result, index) => {
      const collections = ["Messages", "Conversations", "Users"];
      if (result.status === "fulfilled") {
        console.log(
          `✅ Đã xóa ${collections[index]}: ${result.value.deletedCount} documents`
        );
      } else {
        console.error(
          `❌ Lỗi xóa ${collections[index]}:`,
          result.reason.message
        );
      }
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa dữ liệu:", error.message);
    throw error;
  }
};

// Hàm hiển thị thống kê database
const showDatabaseStats = async () => {
  try {
    const [userCount, conversationCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      Message.countDocuments(),
    ]);

    console.log("\n📊 Thống kê dữ liệu hiện tại:");
    console.log(`👥 Users: ${userCount}`);
    console.log(`💬 Conversations: ${conversationCount}`);
    console.log(`💌 Messages: ${messageCount}`);

    // Thống kê chi tiết
    if (userCount > 0) {
      const userStats = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      console.log("\n👤 Phân loại Users:");
      userStats.forEach((stat) => {
        console.log(`   ${stat._id}: ${stat.count}`);
      });
    }

    if (messageCount > 0) {
      const messageStats = await Message.aggregate([
        {
          $group: {
            _id: "$sender",
            count: { $sum: 1 },
          },
        },
      ]);

      console.log("\n💬 Phân loại Messages:");
      messageStats.forEach((stat) => {
        console.log(`   ${stat._id}: ${stat.count}`);
      });
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê:", error.message);
  }
};

// Hàm seed chính với error handling tốt hơn
const seedDatabase = async () => {
  const startTime = Date.now();

  try {
    console.log("🌱 Bắt đầu quá trình seed dữ liệu...");
    console.log(
      `⚙️  Cấu hình: ${config.SEED_COUNT.USERS} users, ${config.SEED_COUNT.CONVERSATIONS_PER_USER} conversations/user, ${config.SEED_COUNT.MESSAGES_PER_CONVERSATION} messages/conversation`
    );

    // Kết nối database
    await connectDB();

    // Hiển thị thống kê trước khi xóa
    console.log("\n📋 Trạng thái database trước khi seed:");
    await showDatabaseStats();

    // Xóa dữ liệu cũ
    await clearDatabase();

    // Tạo dữ liệu mới
    console.log("\n🔄 Bắt đầu tạo dữ liệu mới...");

    // Tạo users
    const users = await createUsers();

    // Tạo conversations
    const conversations = await createConversations(users);

    // Tạo messages
    const messages = await createMessages(conversations);

    // Hiển thị kết quả
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n🎉 Seed dữ liệu thành công!");
    console.log(`⏱️  Thời gian thực hiện: ${duration} giây`);

    // Hiển thị thống kê cuối
    await showDatabaseStats();

    // Hiển thị thông tin admin nếu ở development mode
    if (config.NODE_ENV === "development" && users.length > 0) {
      const adminUser = users.find((u) => u.role === "admin");
      if (adminUser) {
        console.log("\n🔑 Thông tin Admin:");
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   (Kiểm tra console log phía trên để lấy password)`);
      }
    }
  } catch (error) {
    console.error("\n💥 Lỗi trong quá trình seed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    // Đóng kết nối
    try {
      await mongoose.connection.close();
      console.log("\n🔐 Đã đóng kết nối database");
    } catch (error) {
      console.error("❌ Lỗi khi đóng database:", error.message);
    }
    process.exit(0);
  }
};

// Xử lý signal để đóng kết nối gracefully
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Nhận signal SIGINT, đang đóng kết nối...");
  try {
    await mongoose.connection.close();
    console.log("✅ Đã đóng kết nối database");
  } catch (error) {
    console.error("❌ Lỗi khi đóng database:", error.message);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n🛑 Nhận signal SIGTERM, đang đóng kết nối...");
  try {
    await mongoose.connection.close();
    console.log("✅ Đã đóng kết nối database");
  } catch (error) {
    console.error("❌ Lỗi khi đóng database:", error.message);
  }
  process.exit(0);
});

// Chạy seed
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, clearDatabase, showDatabaseStats };
