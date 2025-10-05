// Load environment variables
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const path = require("path");
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const conversationRouter = require("./routes/conversationRoutes");
const chatRouter = require("./routes/chatRoutes");
const musicRoute = require("./routes/musicRoute");
const podcastRoute = require("./routes/podcastRoutes");
const documentRoutes = require("./routes/documentRoutes");
const surveysAndFeedbackRoutes = require("./routes/surveysAndFeedbackRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const emailRoutes = require("./routes/emailRoutes");
const quotesRoutes = require("./routes/quotesRoutes");
const schedulerService = require("./services/schedulerService");
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
// Kết nối database

db();
const baseUrl = process.env.BASE_URL || "http://localhost:5000";

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes); // Sửa từ /api/message thành /api/messages
app.use("/api/conversations", conversationRouter); // Sửa từ /api/conversation thành /api/conversations
app.use("/api/chat", chatRouter);
app.use("/api/documents", documentRoutes);
app.use("/api/musics", musicRoute); // => /api/musics
app.use("/api/podcasts", podcastRoute);
app.use("/api/surveysAndFeedback", surveysAndFeedbackRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/quotes", quotesRoutes);
app.use("/music", express.static(path.join(__dirname, "../uploadMusic")));
app.use("/podcast", express.static(path.join(__dirname, "../uploadPodcast")));

// Trong backend
app.use((req, res, next) => {
  next();
});
app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(5000, () => {
    console.log(`Example app listening at ` + baseUrl);
    
    // Khởi động scheduler sau khi server đã chạy
    setTimeout(() => {
        schedulerService.start();
    }, 2000); // Chờ 2 giây để đảm bảo database đã kết nối
});
