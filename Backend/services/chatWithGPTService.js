require("dotenv").config(); // Đọc file .env
const { OpenAI } = require("openai");
const cosineSimilarityUtil = require("../utils/cosineSimilarityUtil");
const documentRepository = require("../repository/documentRepository");
const messageRepository = require("../repository/messageRepository");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class ChatGPT {
  async generateTitleAndMoodBefore(messageContent) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Bạn là một trợ lý tạo tiêu đề về tâm lý.
  Tạo một tiêu đề ngắn gọn (dưới 200 ký tự) dựa trên nội dung tin nhắn và đánh giá từ 1 đến 10 miêu tả tâm trạng của người dùng.
  Format trả về chính xác ở dạng JSON như sau:
  { "title": "Câu trả lời của bạn", "mood_before": (Số từ 1 đến 10) }`,
          },
          {
            role: "user",
            content: `Nội dung tin nhắn: "${messageContent}". Tạo tiêu đề cho cuộc trò chuyện.`,
          },
        ],
      });
      const rawContent = response.choices[0].message.content.trim();

      // Cố gắng parse JSON từ chuỗi phản hồi
      const parsed = JSON.parse(rawContent);

      // Trường hợp kiểm soát title quá dài
      if (parsed.title.length > 200) {
        parsed.title = parsed.title.substring(0, 200);
      }

      return {
        title: parsed.title,
        mood_before: parsed.mood_before,
      };
    } catch (error) {
      console.error("Lỗi khi tạo tiêu đề:", error.message);
      return {
        title: "Cuộc trò chuyện không có tiêu đề",
        mood_before: null,
      };
    }
  }

  async chatWithGPT(messageContent, conversationId) {
    try {
      const contextSummary = await this.contextEditing(conversationId);
      console.log("tóm tắt");
      console.log(contextSummary);

      // Kiểm tra có nên trigger assessment không
      const shouldTriggerQuiz = await this.shouldTriggerAssessment(messageContent, conversationId);
      // 1. Tạo embedding cho câu hỏi
      const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: messageContent,
      });
      const queryVec = embedRes.data[0].embedding;
      const documentsResult = await documentRepository.getAllDocuments();

      if (!documentsResult.success || !Array.isArray(documentsResult.data)) {
        throw new Error("Không lấy được dữ liệu từ document repository");
      }

      const docs = documentsResult.data;
      // Log rút gọn embedding
      docs.forEach((doc, index) => {
        let embPreview = doc.embedding;

        // Nếu embedding là chuỗi thì cắt ngắn chuỗi
        if (typeof embPreview === "string") {
          embPreview = embPreview.slice(0, 50) + "...";
        }

        // Nếu embedding đã là mảng thì chỉ lấy vài phần tử đầu
        if (Array.isArray(embPreview)) {
          embPreview = embPreview.slice(0, 5).join(", ") + "...";
        }
      });
      // Lọc và kiểm tra docs có embedding hợp lệ
      const validDocs = docs
        .map((doc) => {
          let emb = doc.embedding;
          if (typeof emb === "string") {
            try {
              emb = JSON.parse(emb);
            } catch (e) {
              console.error("Lỗi parse JSON:", emb);
              emb = [];
            }
          }
          return { ...doc, embedding: emb };
        })
        .filter((doc) => {
          const isValid =
            Array.isArray(doc.embedding) && doc.embedding.length > 0;
          if (!isValid) {
            console.warn("Loại bỏ doc:", doc.id, doc.embedding);
          }
          return isValid;
        });
      if (validDocs.length === 0) {
        console.warn("Không có document nào có embedding hợp lệ");
        // Trả về câu trả lời generic nếu không có document
                const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
        temperature: 0.9,
        presence_penalty: 0.8,
        frequency_penalty: 0.3,
        max_tokens: 1200,
          messages: [
            {
              role: "system",
              content: `Bạn là một trợ lý AI chuyên về tâm lý (psychological support assistant).
                ${
                  contextSummary
                    ? `--- Ngữ cảnh gần đây ---\n${contextSummary}\n`
                    : ""
                }
                Nhiệm vụ chính:
                1. Lắng nghe và trả lời người dùng một cách thấu hiểu, hữu ích, tôn trọng và không phán xét.
                2. Dự đoán tâm trạng của người dùng theo 1 trong 4 loại: "happy", "sad", "angry", "neutral".
                3. Nếu phát hiện dấu hiệu tự làm hại hoặc tình huống nguy cấp, phản hồi an toàn và khuyến khích tìm trợ giúp chuyên môn.

               
                Quy tắc trả lời bổ sung:
                - Giọng văn nhí nhảnh, yêu đời, tươi vui, tích cực như một người bạn thân thiết.
                - Sử dụng teen code, emoji, từ ngữ gần gũi: "mình", "bạn ơi", "hehe", "hihi", "wow", "omg", "yasss", "slay", "vibe", "mood", "chill", "relax", "bestie", "sis", "bro".
                - Thêm teencode emoji ASCII phù hợp: ^^, :D, :3, <3, :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :').
                - Không chẩn đoán y tế hoặc kê đơn thuốc.
                - Luôn trả lời bằng tiếng Việt nếu người dùng dùng tiếng Việt.
                - Trả về đúng JSON, không kèm chữ ngoài JSON.
                - QUAN TRỌNG: Viết phản hồi dài 300-500 từ, nhí nhảnh và tích cực:
                  * Thừa nhận cảm xúc với sự đồng cảm vui vẻ
                  * Đặt 3-4 câu hỏi mở, thân thiện để khám phá vấn đề
                  * Đưa ra 2-3 gợi ý thực tế, vui vẻ, có thể áp dụng ngay
                  * Chia sẻ kiến thức tâm lý một cách nhẹ nhàng, dễ hiểu
                  * Đề xuất các bước hành động cụ thể với tinh thần tích cực
                  * Luôn kết thúc bằng lời động viên, khích lệ
                Định dạng bắt buộc:
                {
-                 "content": "câu trả lời đồng cảm và hữu ích",
+                 "content": "Phản hồi nhí nhảnh, tươi vui, tích cực, độ dài 300-500 từ",
                  "emotion": "happy|sad|angry|neutral"
                }

                Ghi chú về emotion:
                - happy: thể hiện niềm vui, hào hứng, biết ơn.
                - sad: buồn, thất vọng, cô đơn, mệt mỏi.
                - angry: tức giận, khó chịu, bực tức.
                - neutral: không rõ cảm xúc hoặc trung tính.
                Nếu không chắc, chọn "neutral".

                Ví dụ:
                User nhắn: "Mấy hôm nay tôi thấy mệt mỏi."
                Assistant trả về: {
                  "content": "Ôi bạn ơi, mình hiểu cảm giác mệt mỏi này lắm! :( :'( Nhưng đừng lo, chúng ta sẽ tìm cách để bạn cảm thấy tốt hơn nhé! ^^ Mệt mỏi có thể đến từ nhiều nguyên nhân khác nhau - có thể là do stress, thiếu ngủ, hoặc đơn giản là bạn đang cần một chút thời gian để chill thôi! :) Bạn có thể kể cho mình nghe thêm về những gì khiến bạn cảm thấy mệt mỏi không? Có phải do công việc, học tập, hay những mối quan hệ trong cuộc sống? :o Bạn đã ngủ đủ giấc và ăn uống đều đặn chưa? Mình muốn lắng nghe và hiểu rõ hơn về tình huống của bạn! <3 Dựa trên những gì bạn chia sẻ, mình có thể đề xuất một số cách để cải thiện tình trạng này, như thực hành các kỹ thuật thư giãn, điều chỉnh lịch sinh hoạt, hoặc tìm kiếm sự hỗ trợ từ những người xung quanh. Bạn nhớ rằng, mình luôn ở đây để hỗ trợ bạn nhé! ^_^ :D",
                  "emotion": "sad"
                }`,
            },
            { role: "user", content: messageContent },
          ],
        });
        const botResponse = JSON.parse(response.choices[0].message.content);
        
        // Nếu cần trigger quiz, thêm thông tin vào response
        if (shouldTriggerQuiz.trigger) {
          console.log(`[DEBUG] Adding quiz trigger to response: ${shouldTriggerQuiz.scale}`);
          botResponse.trigger_quiz = true;
          botResponse.quiz_type = shouldTriggerQuiz.scale;
          botResponse.quiz_reason = shouldTriggerQuiz.reason;
          botResponse.aiContext = {
            confidence: shouldTriggerQuiz.confidence,
            primaryConcern: shouldTriggerQuiz.primaryConcern,
            severity: shouldTriggerQuiz.severity,
            urgency: shouldTriggerQuiz.urgency,
            keyIndicators: shouldTriggerQuiz.keyIndicators
          };
        }

        return {
          success: true,
          message: JSON.stringify(botResponse),
        };
      }

      const scored = validDocs.map((doc) => {
        try {
          const score = cosineSimilarityUtil.cosineSimilarity(
            queryVec,
            doc.embedding
          );
          return {
            text: doc.text || doc._doc.text || "Không có text",
            score: isNaN(score) ? 0 : score,
          };
        } catch (error) {
          console.error("Error calculating similarity for doc:", error.message);
          return {
            text: doc.text || doc._doc.text || "Không có text",
            score: 0,
          };
        }
      });

      // const topDocs = scored.sort((a, b) => b.score - a.score).slice(0, 3);

      const topDocs = scored
      .filter(d => (typeof d.score === "number" ? d.score : 0) >= 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

      // topDocs.forEach((doc, i) => {
      //   console.log(
      //     `Top ${i + 1} | Score: ${doc.score.toFixed(4)} | Text: ${doc.text}...`
      //   );
      // });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.9,
        presence_penalty: 0.8,
        frequency_penalty: 0.3,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content: `Bạn là một trợ lý AI chuyên về tâm lý (psychological support assistant).
              ${
                contextSummary
                  ? `--- Ngữ cảnh gần đây ---\n${contextSummary}\n`
                  : ""
              }
              Hãy trả lời dựa trên ngữ cảnh trên và câu mới nhất của người dùng.
              Mục tiêu chính: lắng nghe, đồng cảm, hỗ trợ cảm xúc tức thì và an toàn — KHÔNG thay thế chuyên gia y tế/tiền lâm sàng.

              Tài liệu tham khảo:
              ${topDocs}

            
              Giọng điệu: nhí nhảnh, yêu đời, tươi vui, tích cực như một người bạn thân thiết. Sử dụng teen code, emoji, từ ngữ gần gũi. Dùng tiếng Việt. Không chẩn đoán/kê đơn.

              Định dạng trả lời (BẮT BUỘC — chỉ trả về 1 đối tượng JSON, KHÔNG có văn bản hay chú thích thêm):
              {
                "content": "Phản hồi nhí nhảnh, tươi vui, tích cực, độ dài 300-500 từ: thừa nhận cảm xúc với sự đồng cảm vui vẻ, phân tích vấn đề một cách nhẹ nhàng, đặt 3-4 câu hỏi thân thiện, đưa ra 2-3 gợi ý thực tế vui vẻ, chia sẻ kiến thức tâm lý dễ hiểu, đề xuất bước hành động cụ thể với tinh thần tích cực.",
                "emotion": "happy|sad|angry|neutral"
              }

              Ghi chú về emotion:
              - happy: ngôn ngữ thể hiện niềm vui, biết ơn, hài lòng hoặc phấn khích.
              - sad: buồn, cô đơn, tuyệt vọng, mệt mỏi, mất động lực.
              - angry: giận dữ, bực tức, cảm thấy bất công, muốn phản kháng.
              - neutral: câu hỏi thông tin, mô tả trung lập, hoặc không đủ dấu hiệu cảm xúc rõ ràng.
              - Nếu không chắc, chọn "neutral" và trong "content" mời họ mô tả thêm.

              Hướng dẫn sử dụng teen code và emoji:
              - Teen code: "mình", "bạn ơi", "hehe", "hihi", "wow", "omg", "yasss", "slay", "vibe", "mood", "chill", "relax", "bestie", "sis", "bro", "cute", "adorable", "amazing", "fantastic".
              - Teencode emoji ASCII thường dùng: ^^, :D, :3, <3, :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :', :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :', :3, <3, :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :', :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :', :3, <3, :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :', :), :P, :*, ^_^, :>, :v, :o, :x, :/, :|, :(, :'.
              - Luôn kết thúc bằng lời động viên tích cực và emoji phù hợp.

              Hướng dẫn khi dùng ${topDocs}:
              - Nếu trả lời dựa trên nội dung trong ${topDocs}, có thể tóm tắt ngắn (1–2 câu) và ghi rõ "Dựa trên tài liệu..." trong nội dung trả lời — nhưng **vẫn phải** chỉ trả về JSON.
              Kịch bản nguy cấp (bắt buộc tuân thủ khi phát hiện dấu hiệu tự hại / tự tử):
              - "content" phải: (1) thừa nhận cảm xúc, (2) hỏi về an toàn hiện tại, (3) khuyến khích liên hệ hỗ trợ chuyên nghiệp/đường dây nóng, (4) đề nghị ở lại và lắng nghe.
              - Gán "emotion": "sad".

              Ví dụ (user → assistant JSON):
              1) User: "Hôm nay mình được tăng lương, vui lắm!"
              Assistant trả về:
              { 
                "content": "Tuyệt vời quá — nghe bạn hồ hởi thật! Chúc mừng bạn vì sự cố gắng được ghi nhận. Bạn có muốn chia sẻ phần thú vị nhất của ngày hôm nay không?",
                "emotion": "happy"
              }

              2) User: "Mấy tuần nay mình thấy chán, không muốn làm gì."
              Assistant trả về:
              {
                "content": "Mình rất tiếc khi nghe bạn đang cảm thấy như vậy — chuyện kéo dài mệt mỏi thật khó khăn. Bạn có thể kể thêm một chút về những lúc bạn cảm thấy chán nhất trong ngày không? Nếu cảm thấy áp lực quá, tìm gặp ai đó bạn tin hoặc chuyên gia có thể giúp đỡ.",
                "emotion": "sad"
              }

              3) User: "Tôi tức anh ta lắm vì nói dối."
              Assistant trả về:
              {
                "content": "Cảm giác bị phản bội và tức giận là hoàn toàn dễ hiểu. Bạn có muốn nói rõ hơn về chuyện đó — điều gì làm bạn cảm thấy tổn thương nhất? Nếu cần, mình có vài cách để giúp bạn xử lý cơn giận an toàn.",
                "emotion": "angry"
              }

              Lưu ý kỹ thuật/kiểm tra hợp lệ:
              - Luôn trả về **duy nhất** một JSON object hợp lệ (no extra text, no markdown).
              - Các giá trị phải là chuỗi (string) theo schema trên.

              — HẾT —`,
          },
          { role: "user", content: messageContent },
        ],
      });

      // Trả về kết quả
      if (!response.choices || response.choices.length === 0) {
        throw new Error("Không có lựa chọn nào trong phản hồi từ OpenAI");
      }

      const botResponse = JSON.parse(response.choices[0].message.content);
      
      // Nếu cần trigger quiz, thêm thông tin vào response
      if (shouldTriggerQuiz.trigger) {
        console.log(`[DEBUG] Adding quiz trigger to response: ${shouldTriggerQuiz.scale}`);
        botResponse.trigger_quiz = true;
        botResponse.quiz_type = shouldTriggerQuiz.scale;
        botResponse.quiz_reason = shouldTriggerQuiz.reason;
        botResponse.aiContext = {
          confidence: shouldTriggerQuiz.confidence,
          primaryConcern: shouldTriggerQuiz.primaryConcern,
          severity: shouldTriggerQuiz.severity,
          urgency: shouldTriggerQuiz.urgency,
          keyIndicators: shouldTriggerQuiz.keyIndicators
        };
      }

      return {
        success: true,
        message: JSON.stringify(botResponse),
      };
    } catch (error) {
      console.error("Lỗi gọi API:", error.message);
      return {
        success: false,
        message: "Lỗi khi gọi API OpenAI: " + error.message,
      };
    }
  }
  async shouldTriggerAssessment(messageContent, conversationId) {
    try {
      // Đếm số tin nhắn trong cuộc trò chuyện
      const messageCount = await messageRepository.getMessageCount(conversationId);
      console.log(`[DEBUG] Message count: ${messageCount}, Content: "${messageContent}"`);
      
      // Chỉ trigger sau 2 tin nhắn
      if (messageCount < 2) {
        console.log(`[DEBUG] Not enough messages (${messageCount} < 2), skipping trigger`);
        return { trigger: false };
      }

      // Kiểm tra xem có AI Assessment Service không
      let aiAssessmentService;
      try {
        aiAssessmentService = require('./aiAssessmentService');
        console.log(`[DEBUG] AI Assessment Service loaded successfully`);
      } catch (importError) {
        console.log(`[DEBUG] AI Assessment Service not available, using rule-based:`, importError.message);
        return this.fallbackRuleBasedAssessment(messageContent);
      }

      // Kiểm tra API key
      if (!process.env.OPENAI_API_KEY) {
        console.log(`[DEBUG] No OpenAI API key, using rule-based fallback`);
        return this.fallbackRuleBasedAssessment(messageContent);
      }

      // Lấy toàn bộ tin nhắn trong cuộc trò chuyện để AI phân tích
      const messagesResult = await messageRepository.findByConversationId(conversationId);
      console.log(`[DEBUG] Retrieved ${messagesResult.messages?.length || 0} messages for AI analysis`);
      
      if (!messagesResult.success || !messagesResult.messages) {
        console.log(`[DEBUG] Failed to retrieve messages, using fallback`);
        return this.fallbackRuleBasedAssessment(messageContent);
      }
      
      const allMessages = messagesResult.messages;
      
      // Sử dụng AI để phân tích thay vì rule-based
      const aiAnalysis = await aiAssessmentService.analyzeConversationForAssessment(allMessages, conversationId);
      
      console.log(`[DEBUG] AI Analysis result:`, JSON.stringify(aiAnalysis, null, 2));
      
      if (aiAnalysis.shouldTrigger) {
        console.log(`[DEBUG] AI triggered assessment: ${aiAnalysis.recommendedScale}`);
        return {
          trigger: true,
          scale: aiAnalysis.recommendedScale,
          reason: aiAnalysis.reasoning,
          confidence: aiAnalysis.confidence,
          primaryConcern: aiAnalysis.primaryConcern,
          severity: aiAnalysis.severity,
          urgency: aiAnalysis.urgency,
          keyIndicators: aiAnalysis.keyIndicators
        };
      }
      
      console.log(`[DEBUG] No assessment triggered by AI`);
      return { trigger: false };
    } catch (error) {
      console.error("Lỗi khi kiểm tra trigger assessment:", error.message);
      console.error("Stack trace:", error.stack);
      
      // Fallback về rule-based nếu AI lỗi
      console.log(`[DEBUG] Falling back to rule-based detection due to error`);
      return this.fallbackRuleBasedAssessment(messageContent);
    }
  }

  // Fallback method khi AI không hoạt động
  fallbackRuleBasedAssessment(messageContent) {
    try {
      const content = messageContent.toLowerCase();
      
      const anxietyKeywords = ["lo lắng", "bồn chồn", "sợ hãi", "hồi hộp", "tim đập nhanh", "khó thở", "căng thẳng", "lo sợ"];
      const depressionKeywords = ["buồn", "chán nản", "mất hứng thú", "tuyệt vọng", "mệt mỏi", "không muốn làm gì", "chán", "buồn bã"];
      const stressKeywords = ["căng thẳng", "áp lực", "quá tải", "không thể tập trung", "stress", "căng thẳng", "áp lực công việc", "quá nhiều việc"];
      
      const anxietyScore = anxietyKeywords.filter(keyword => 
        content.includes(keyword)).length;
      const depressionScore = depressionKeywords.filter(keyword => 
        content.includes(keyword)).length;
      const stressScore = stressKeywords.filter(keyword => 
        content.includes(keyword)).length;
      
      console.log(`[DEBUG] Fallback Scores - Anxiety: ${anxietyScore}, Depression: ${depressionScore}, Stress: ${stressScore}`);
      
      if (anxietyScore >= 2) {
        return { 
          trigger: true, 
          scale: "GAD-7", 
          reason: "Phát hiện dấu hiệu lo âu (rule-based fallback)" 
        };
      }
      if (depressionScore >= 2) {
        return { 
          trigger: true, 
          scale: "PHQ-9", 
          reason: "Phát hiện dấu hiệu trầm cảm (rule-based fallback)" 
        };
      }
      if (stressScore >= 2) {
        return { 
          trigger: true, 
          scale: "PSS", 
          reason: "Phát hiện dấu hiệu stress (rule-based fallback)" 
        };
      }
      
      return { trigger: false };
    } catch (error) {
      console.error("Lỗi fallback rule-based:", error.message);
      return { trigger: false };
    }
  }

  async contextEditing(conversationId) {
    try {
      const messages = await messageRepository.getfiveMessagesByConversationId(
        conversationId
      );
      if (!messages || messages.length === 0) {
        return null;
      }

      // Đảo ngược để lấy tin mới nhất ở cuối
      const reversed = [...messages].reverse();

      // Lấy tin nhắn cuối cùng của user (câu hỏi hiện tại)
      const lastUserMessage = reversed.find((m) => m.role === "user");

      // Những tin nhắn còn lại để tóm tắt (không tính câu hỏi cuối)
      const historyMessages = messages.filter((m) => m !== lastUserMessage);

      const summaryPrompt = `
      Bạn là một AI tóm tắt hội thoại. 
      Tôi sẽ đưa cho bạn một đoạn hội thoại gần đây giữa người dùng và trợ lý. 
      Hãy tóm tắt **chỉ phần hội thoại trước đó** (không tóm tắt câu hỏi cuối của người dùng),
      để một AI khác có thể tiếp tục trả lời mà không mất ngữ cảnh.

      Quy tắc:
      - Chỉ tóm tắt các ý chính và cảm xúc nếu có.
      - Giữ nguyên tên nhân vật nếu có.
      - Viết bằng tiếng Việt nếu hội thoại gốc là tiếng Việt.
      - Không thêm suy đoán ngoài nội dung.
      - Không dùng dấu \` hoặc markdown.
      - Độ dài mong muốn: 200–400 từ, tập trung vào vấn đề, cảm xúc nổi bật, tiến triển và điểm cần theo dõi.
    `;

      const historyText = historyMessages
        .map(
          (m) => `${m.role === "user" ? "Người dùng" : "Trợ lý"}: ${m.content}`
        )
        .join("\n");

      let contextSummary = "";
      if (historyText.trim().length > 0) {
        const summaryRes = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: summaryPrompt },
            { role: "user", content: historyText },
          ],
        });

        contextSummary = summaryRes.choices[0].message.content;
      }

      return contextSummary;
    } catch (error) {
      console.error("Lỗi khi chỉnh sửa ngữ cảnh:", error.message);
      return null
    }
  }
}

module.exports = new ChatGPT();
