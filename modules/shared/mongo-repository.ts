import { Collection, MongoClient, WithId, Document } from "mongodb";
import { UUID } from "crypto";

const dbName = "auroraMap";

export abstract class MongoRepository<
	TAggregateType,
	TDocumentType extends Document & { id: string }
> {
	abstract collectionName: string;

	abstract toDocument(aggregate: TAggregateType): TDocumentType;
	abstract fromDocument(document: WithId<TDocumentType>): TAggregateType;

	protected constructor(private mongoConnectionStr: string) {}

	protected async connectToDB<TReturn>(
		dbCallback: (collection: Collection<TDocumentType>) => Promise<TReturn>
	): Promise<TReturn> {
		const client = new MongoClient(`${this.mongoConnectionStr}/${dbName}`);
		try {
			await client.connect();
			const database = client.db();
			const collection = database.collection<TDocumentType>(
				this.collectionName
			);
			return await dbCallback(collection);
		} finally {
			// Ensures that the client will close when you finish/error
			await client.close();
		}
	}

	protected async getById(id: UUID): Promise<TAggregateType | null> {
		return this.connectToDB(async (collection) => {
			const document = await collection.findOne({ id: id as any }); // mongodb is strange with filter types
			if (document === null) {
				return null;
			}
			return this.fromDocument(document);
		});
	}

	protected async getLatest(): Promise<TAggregateType | null> {
		return this.connectToDB(async (collection) => {
			const document = await collection.findOne(
				{},
				{
					sort: {
						_id: -1,
					},
				}
			);
			if (document === null) {
				return null;
			}
			return this.fromDocument(document);
		});
	}

	protected async updateDocument(
		id: string,
		aggregate: TAggregateType
	): Promise<void> {
		await this.connectToDB(async (collection) =>
			collection.updateOne(
				{ id: id as any }, // mongodb is strange with filter types
				{ $set: this.toDocument(aggregate) },
				{ upsert: true }
			)
		);
	}
}
