"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRepository = void 0;
const mongodb_1 = require("mongodb");
const clientConnectionStr = "mongodb://127.0.0.1:27017/auroraMap";
class MongoRepository {
    connectToDB(dbCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new mongodb_1.MongoClient(clientConnectionStr);
            try {
                yield client.connect();
                const database = client.db();
                const collection = database.collection(this.collectionName);
                return yield dbCallback(collection);
            }
            finally {
                // Ensures that the client will close when you finish/error
                yield client.close();
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connectToDB((collection) => __awaiter(this, void 0, void 0, function* () {
                const document = yield collection.findOne({ id: id }); // mongodb is strange with filter types
                if (document === null) {
                    return null;
                }
                return this.fromDocument(document);
            }));
        });
    }
    getLatest() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connectToDB((collection) => __awaiter(this, void 0, void 0, function* () {
                const document = yield collection.findOne({
                    $orderby: { $natural: -1 },
                });
                if (document === null) {
                    return null;
                }
                return this.fromDocument(document);
            }));
        });
    }
    updateDocument(id, aggregate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectToDB((collection) => __awaiter(this, void 0, void 0, function* () {
                return collection.updateOne({ id: id }, // mongodb is strange with filter types
                { $set: this.toDocument(aggregate) }, { upsert: true });
            }));
        });
    }
}
exports.MongoRepository = MongoRepository;
