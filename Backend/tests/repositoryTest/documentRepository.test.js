const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Document = require("../../model/document");
const documentRepository = require("../../repository/documentRepository");

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
  await Document.deleteMany(); // dọn dẹp sau mỗi test
});

describe("DocumentRepository", () => {
  test("createDocument - success", async () => {
    const result = await documentRepository.createDocument({
      text: "test text",
      embedding: [0.1, 0.2, 0.3],
    });

    expect(result.success).toEqual(true);
    expect(result.data.text).toEqual("test text");
  });

  test("createDocumentsAdvanced - success", async () => {
    const result = await documentRepository.createDocumentsAdvanced(
      [
        { text: "doc 1", embedding: [1, 2, 3] },
        { text: "doc 2", embedding: [4, 5, 6] },
      ],
      {}
    );

    expect(result.success).toEqual(true);
    expect(result.count).toEqual(2);
  });

  test("getAllDocuments - success", async () => {
    await Document.create({ text: "test", embedding: [1, 2, 3] });
    const result = await documentRepository.getAllDocuments();

    expect(result.success).toEqual(true);
    expect(Array.isArray(result.data)).toEqual(true);
    expect(result.data.length).toEqual(1);
  });
});
