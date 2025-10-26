const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation", // Tham chiếu tới bảng conversations
    required: true,
  },
  content: {
    type: String,
    required: [true, "Nội dung tin nhắn là bắt buộc"],
    trim: true,
  },
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: [true, "Người gửi là bắt buộc"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  emotion: {
    type: String,
    enum: [
      "happy",        // vui vẻ, hạnh phúc
      "excited",      // phấn khích, hứng thú
      "love",         // yêu thương, mến mộ
      "sad",          // buồn, thất vọng
      "depression",   // trầm cảm nghiêm trọng (tuyệt vọng, muốn chết)
      "ennui",        // chán nản, mệt mỏi, buồn tẻ, bất lực
      "anxiety",      // lo âu, bất an, căng thẳng
      "fear",         // sợ hãi, hoảng sợ
      "angry",        // tức giận, bực bội
      "disgust",      // ghê tởm, ác cảm
      "embarrassment", // xấu hổ, ngượng ngùng, bối rối
      "surprise",     // ngạc nhiên, tò mò
      "neutral"       // trung tính, bình thường
    ],
    default: "neutral",
  },
});

module.exports = mongoose.model("Message", messageSchema);
