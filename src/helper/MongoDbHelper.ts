import { Db } from 'mongodb';


export default class MongoDbHelper {
    public static dropAll(db: Db): Promise<ReadonlyArray<boolean>> {
        return db
            .listCollections({ name: { $regex: /^((?!system).)*$/i } })
            .toArray()
            .then((collections) => {
                const promises: Array<Promise<boolean>> = collections.map((collection) => {
                    return new Promise((resolve, reject) => {
                        return db.dropCollection(collection.name)
                            .then(resolve, reject);
                    });
                });
                return Promise.all(promises);
            });
    }
}
