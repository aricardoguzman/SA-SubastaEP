import * as MongoDB from 'mongodb';

export interface MongoInfo {
    db?: MongoDB.Db,
    coll_auctions?: MongoDB.Collection,
    coll_bids?: MongoDB.Collection,
}

const mongo: MongoInfo = {};

class MongoCnx {
    resolve!: any;
    reject!: any;
    client!: MongoDB.MongoClient;
    // Connect to the db
    async connect() { // add async
        console.log('connecting to mongo');
        try {
            if (!this.client) { // I added this extra check
                this.client = await MongoDB.MongoClient.connect('mongodb://127.0.0.1:27017/', { useNewUrlParser: true, useUnifiedTopology: true })
                mongo.db = this.client.db('auctionsdb');
                //console.log(mongo.db)
                mongo.coll_auctions = mongo.db!.collection('auctions');
                mongo.coll_bids = mongo.db!.collection('bids')
            }
            return this.client;
        } catch (error) {
            console.log('error during connecting to mongo: ');
            console.error(error);
        }
        return undefined;
    }
}

let mongoCnx = new MongoCnx();
mongoCnx.connect();

export { mongo }
