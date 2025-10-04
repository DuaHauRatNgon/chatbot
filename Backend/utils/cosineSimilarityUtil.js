const math = require("mathjs");

class cosineSimilarityUtil {
  cosineSimilarity(a, b) {
    const dot = math.dot(a, b);
    const normA = math.norm(a);
    const normB = math.norm(b);
    return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
  }
}

module.exports = new cosineSimilarityUtil();
