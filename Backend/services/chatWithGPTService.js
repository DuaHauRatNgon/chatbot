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
                2. Phân tích cảm xúc chi tiết của người dùng theo 11 loại: happy, excited, love, sad, depression, anxiety, fear, angry, disgust, surprise, neutral.
                3. Nếu phát hiện dấu hiệu tự làm hại hoặc tình huống nguy cấp, phản hồi an toàn và khuyến khích tìm trợ giúp chuyên môn.

                Quy tắc trả lời bổ sung:
                - Giọng văn chuyên nghiệp, đồng cảm nhưng không quá cảm xúc.
                - Sử dụng ngôn ngữ rõ ràng, dễ hiểu, tránh tiếng lóng hoặc từ ngữ quá thân mật.
                - Tập trung vào việc lắng nghe và hỗ trợ thực tế.
                - Không chẩn đoán y tế hoặc kê đơn thuốc.
                - Luôn trả lời bằng tiếng Việt nếu người dùng dùng tiếng Việt.
                - Trả về đúng JSON, không kèm chữ ngoài JSON.
                - QUAN TRỌNG: Viết phản hồi dài 200-400 từ, rõ ràng và hữu ích:
                  * Thể hiện sự thấu hiểu và đồng cảm một cách chuyên nghiệp
                  * Đặt 2-3 câu hỏi mở để hiểu rõ hơn về tình huống
                  * Đề xuất các bước hành động cụ thể và thực tế
                  * Cung cấp thông tin hữu ích một cách khách quan
                  * Kết thúc với lời nhắn hỗ trợ và khuyến khích
                Định dạng bắt buộc:
                {
                  "content": "Phản hồi đồng cảm và hữu ích, độ dài 300-500 từ",
                  "emotion": "happy|excited|love|sad|depression|ennui|anxiety|fear|angry|disgust|embarrassment|surprise|neutral"
                }

                Hướng dẫn phân tích emotion từ nội dung user (QUAN TRỌNG - đọc kỹ từ khóa Tiếng Việt):
                
                POSITIVE EMOTIONS:
                - happy: vui, vui vẻ, hạnh phúc, mừng, hài lòng, thoải mái, ổn
                - excited: phấn khích, hứng thú, háo hức, hào hứng, kích động, nhiệt tình
                - love: yêu, thương, mến, quý, thích, say mê, đam mê, cảm kích
                
                NEGATIVE EMOTIONS:
                - sad: buồn, buồn bã, thất vọng, cô đơn, lạnh lùng, u sầu
                - depression: trầm cảm NGHIÊM TRỌNG, tuyệt vọng, không còn hy vọng, muốn chết, tự tử, vô nghĩa, không muốn sống
                - ennui: chán nản, mệt mỏi, buồn tẻ, bất lực, không có năng lượng, kiệt sức, u ám, không hứng thú
                - anxiety: lo âu, lo lắng, bất an, căng thẳng, stress, áp lực, hoang mang, bối rối
                - fear: sợ, sợ hãi, hoảng sợ, kinh hãi, run sợ, khiếp sợ, lo sợ
                - angry: tức, tức giận, giận, bực, bực bội, khó chịu, cáu, nóng giận, phẫn nộ
                - disgust: ghê tởm, ác cảm, chán ghét, căm ghét, kinh tởm, phản cảm
                - embarrassment: xấu hổ, ngượng, ngượng ngùng, bối rối, lúng túng, e thẹn, mắc cỡ, xấu hổ quá
                
                OTHER:
                - surprise: ngạc nhiên, tò mò, bất ngờ, kinh ngạc, sửng sốt, thắc mắc
                - neutral: bình thường, trung tính, không rõ cảm xúc, bàn luận khách quan
                
                QUY TẮC PHÂN TÍCH (QUAN TRỌNG - ĐỌC KỞ):
                1. Ưu tiên từ khóa trực tiếp: "trầm cảm" → depression, "lo âu" → anxiety, "xấu hổ" → embarrassment
                2. Phân biệt mức độ NGHIÊM TRỌNG:
                   - "buồn/thất vọng" → sad (nhẹ)
                   - "mệt mỏi/chán nản/bất lực" → ennui (trung bình)
                   - "tuyệt vọng/muốn chết/tự tử" → depression (nghiêm trọng)
                3. Context quan trọng: "tôi sợ không làm được" → anxiety (không phải fear)
                4. Phân biệt rõ: "xấu hổ/ngượng" → embarrassment, "ghê tởm/kinh tởm" → disgust
                5. Khi không chắc chắn → neutral

                Ví dụ:
                1) User: "Mấy hôm nay tôi thấy mệt mỏi và bất lực quá."
                Assistant trả về: {
                  "content": "Mình hiểu cảm giác mệt mỏi và bất lực của bạn. Đây là dấu hiệu cơ thể và tâm trí đang cần được nghỉ ngơi. Bạn có thể chia sẻ thêm về những gì khiến bạn cảm thấy như vậy không?",
                  "emotion": "ennui"
                }
                
                2) User: "Tôi cảm thấy tuyệt vọng, không còn hy vọng nữa."
                Assistant trả về: {
                  "content": "Mình rất lo lắng khi nghe bạn nói vậy. Trầm cảm là tình trạng nghiêm trọng và bạn rất dũng cảm khi chia sẻ. Bạn có đang được ai hỗ trợ chuyên môn không? Mình muốn lắng nghe và giúp bạn tìm nguồn hỗ trợ phù hợp.",
                  "emotion": "depression"
                }`,
            },
            { role: "user", content: messageContent },
          ],
        });
        
        // Debug: Log AI response để kiểm tra emotion detection
        console.log(`[DEBUG] AI Raw Response: ${response.choices[0].message.content}`);
        
        const botResponse = JSON.parse(response.choices[0].message.content);
        
        // Debug: Log parsed emotion
        console.log(`[DEBUG] Detected Emotion: ${botResponse.emotion}`);
        
        // Lưu user message với emotion đã phân tích vào database
        try {
          const userMessageData = {
            conversation_id: conversationId,
            content: messageContent,
            sender: "user",
            emotion: botResponse.emotion || "neutral" // Sử dụng emotion từ AI
          };
          
          console.log(`[DEBUG ChatGPT] About to save user message with emotion: ${userMessageData.emotion}`);
          console.log(`[DEBUG ChatGPT] Full userMessageData:`, userMessageData);
          const userMessageResult = await messageRepository.createMessage(userMessageData);
          
          if (!userMessageResult.success) {
            console.error(`[ERROR] Failed to save user message: ${userMessageResult.message}`);
          }
          
          // Lưu bot response vào database
          const botMessageData = {
            conversation_id: conversationId,
            content: botResponse.content,
            sender: "bot",
            emotion: "neutral" // Bot luôn neutral
          };
          
          const botMessageResult = await messageRepository.createMessage(botMessageData);
          
          if (!botMessageResult.success) {
            console.error(`[ERROR] Failed to save bot message: ${botMessageResult.message}`);
          }
          
        } catch (saveError) {
          console.error(`[ERROR] Error saving messages to database: ${saveError.message}`);
        }
        
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
                "emotion": "happy|excited|love|sad|depression|ennui|anxiety|fear|angry|disgust|embarrassment|surprise|neutral"
              }

              Hướng dẫn phân tích emotion từ nội dung user (QUAN TRỌNG - đọc kỹ từ khóa Tiếng Việt):
              
              POSITIVE EMOTIONS:
              - happy: vui, vui vẻ, hạnh phúc, mừng, hài lòng, thoải mái, ổn
              - excited: phấn khích, hứng thú, háo hức, hào hứng, kích động, nhiệt tình
              - love: yêu, thương, mến, quý, thích, say mê, đam mê, cảm kích
              
              NEGATIVE EMOTIONS:
              - sad: buồn, buồn bã, thất vọng, cô đơn, lạnh lùng, u sầu
              - depression: trầm cảm NGHIÊM TRỌNG, tuyệt vọng, không còn hy vọng, muốn chết, tự tử, vô nghĩa, không muốn sống
              - ennui: chán nản, mệt mỏi, buồn tẻ, bất lực, không có năng lượng, kiệt sức, u ám, không hứng thú
              - anxiety: lo âu, lo lắng, bất an, căng thẳng, stress, áp lực, hoang mang, bối rối
              - fear: sợ, sợ hãi, hoảng sợ, kinh hãi, run sợ, khiếp sợ, lo sợ
              - angry: tức, tức giận, giận, bực, bực bội, khó chịu, cáu, nóng giận, phẫn nộ
              - disgust: ghê tởm, ác cảm, chán ghét, căm ghét, kinh tởm, phản cảm
              - embarrassment: xấu hổ, ngượng, ngượng ngùng, bối rối, lúng túng, e thẹn, mắc cỡ, xấu hổ quá
              
              OTHER:
              - surprise: ngạc nhiên, tò mò, bất ngờ, kinh ngạc, sửng sốt, thắc mắc
              - neutral: bình thường, trung tính, không rõ cảm xúc, bàn luận khách quan
              
              QUY TẮC PHÂN TÍCH (QUAN TRỌNG - ĐỌC KỞ):
              1. Ưu tiên từ khóa trực tiếp: "trầm cảm" → depression, "lo âu" → anxiety, "xấu hổ" → embarrassment
              2. Phân biệt mức độ NGHIÊM TRỌNG:
                 - "buồn/thất vọng" → sad (nhẹ)
                 - "mệt mỏi/chán nản/bất lực" → ennui (trung bình)
                 - "tuyệt vọng/muốn chết/tự tử" → depression (nghiêm trọng)
              3. Context quan trọng: "tôi sợ không làm được" → anxiety (không phải fear)
              4. Phân biệt rõ: "xấu hổ/ngượng" → embarrassment, "ghê tởm/kinh tởm" → disgust
              5. Khi không chắc chắn → neutral

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

              4) User: "Tôi đang gặp trầm cảm, cảm thấy vô nghĩa."
              Assistant trả về:
              {
                "content": "Mình rất hiểu cảm giác khó khăn mà bạn đang trải qua. Trầm cảm là một tình trạng thật sự và bạn rất dũng cảm khi chia sẻ điều này. Bạn có đang được ai hỗ trợ chuyên môn không? Mình muốn lắng nghe thêm về những gì bạn đang cảm thấy.",
                "emotion": "depression"
              }

              5) User: "Lo âu quá, không biết làm sao với kỳ thi sắp tới."
              Assistant trả về:
              {
                "content": "Mình hiểu cảm giác lo lắng trước kỳ thi của bạn! Đây là phản ứng bình thường mà nhiều người gặp phải. Bạn đã chuẩn bị như thế nào rồi? Mình có thể chia sẻ vài kỹ thuật giảm căng thẳng hiệu quả nhé!",
                "emotion": "anxiety"
              }

              6) User: "Tôi thấy xấu hổ quá."
              Assistant trả về:
              {
                "content": "Mình hiểu cảm giác xấu hổ của bạn! Cảm giác này rất bình thường và ai cũng từng trải qua. Bạn có thể chia sẻ thêm về tình huống khiến bạn cảm thấy như vậy không? Mình sẵn sàng lắng nghe và hỗ trợ bạn nhé! <3",
                "emotion": "embarrassment"
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
      
      // Debug: Log detected emotion
      console.log(`[DEBUG] Detected Emotion (with docs): ${botResponse.emotion}`);
      
      // Lưu user message với emotion đã phân tích vào database
      try {
        const userMessageData = {
          conversation_id: conversationId,
          content: messageContent,
          sender: "user",
          emotion: botResponse.emotion || "neutral" // Sử dụng emotion từ AI
        };
        
        console.log(`[DEBUG] Saving user message with emotion: ${userMessageData.emotion}`);
        const userMessageResult = await messageRepository.createMessage(userMessageData);
        
        if (!userMessageResult.success) {
          console.error(`[ERROR] Failed to save user message: ${userMessageResult.message}`);
        }
        
        // Lưu bot response vào database
        const botMessageData = {
          conversation_id: conversationId,
          content: botResponse.content,
          sender: "bot",
          emotion: "neutral" // Bot luôn neutral
        };
        
        const botMessageResult = await messageRepository.createMessage(botMessageData);
        
        if (!botMessageResult.success) {
          console.error(`[ERROR] Failed to save bot message: ${botMessageResult.message}`);
        }
        
      } catch (saveError) {
        console.error(`[ERROR] Error saving messages to database: ${saveError.message}`);
      }
      
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

  async generateChatSuggestions(conversationId, lastMessagesCount = 3) {
    try {
      // Lấy tin nhắn gần đây từ cuộc trò chuyện
      const messagesResult = await messageRepository.getLastMessagesByConversationId(
        conversationId, 
        lastMessagesCount
      );
      
      if (!messagesResult || messagesResult.length === 0) {
        // Trả về gợi ý mặc định nếu không có tin nhắn
        return {
          success: true,
          suggestions: [
            "Hôm nay thế nào?",
            "Có gì lo lắng không?",
            "Cảm giác ra sao?"
          ]
        };
      }

      // Tạo context từ tin nhắn gần đây
      const conversationContext = messagesResult
        .map(msg => `${msg.sender === 'user' ? 'Người dùng' : 'Bot'}: ${msg.content}`)
        .join('\n');

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `Bạn là một trợ lý AI chuyên tâm lý. Dựa trên đoạn hội thoại gần đây, hãy tạo ra 3-4 gợi ý câu hỏi NGẮN GỌN và LIÊN QUAN TRỰC TIẾP đến tình huống của người dùng.

Quy tắc QUAN TRỌNG:
- Mỗi gợi ý phải CỰC KỲ NGẮN GỌN (dưới 30 ký tự)
- Phải LIÊN QUAN TRỰC TIẾP đến vấn đề cụ thể người dùng đang gặp
- Sử dụng ngôn ngữ đơn giản, thân thiện
- Tập trung vào tình huống cụ thể, không chung chung
- Trả về định dạng JSON: {"suggestions": ["gợi ý 1", "gợi ý 2", "gợi ý 3"]}

Ví dụ theo tình huống:
- Nếu user nói về điểm thi kém → "Điểm kém có sao không?", "Cách thi được điểm cao?", "Bố mẹ có biết không?"
- Nếu user nói về cãi nhau với bạn → "Ai sai trước?", "Muốn làm hòa không?", "Bạn ấy nghĩ gì?"
- Nếu user nói về stress → "Nguyên nhân là gì?", "Có cách giải tỏa không?", "Ai có thể giúp?"
- Nếu user nói về buồn → "Vì điều gì vậy?", "Từ khi nào thế?", "Có muốn kể không?"

Lưu ý: Gợi ý phải NGẮN, TRỰC TIẾP và LIÊN QUAN đến chủ đề cụ thể người dùng vừa nói.`
          },
          {
            role: "user",
            content: `Đoạn hội thoại gần đây:\n${conversationContext}\n\nHãy tạo 3-4 gợi ý tiếp tục cuộc trò chuyện.`
          }
        ]
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        success: true,
        suggestions: result.suggestions || []
      };

    } catch (error) {
      console.error("Lỗi khi tạo gợi ý chat:", error.message);
      
      // Fallback với gợi ý mặc định
      return {
        success: true,
        suggestions: [
          "Cảm thấy thế nào?",
          "Có gì lo lắng không?",
          "Cần giúp gì thêm?",
          "Muốn chia sẻ thêm?"
        ]
      };
    }
  }
}

module.exports = new ChatGPT();
