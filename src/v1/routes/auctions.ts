
import * as express from 'express';

import { wrap } from '../decorators';
import { Connection, Auction } from '../../../index';
import { BidsInterface } from '../../models/bids';
import { mongo } from '../../database/mongo-client';
const routerV1 = express.Router();

class Auctions {

    async bids(req: express.Request, res: express.Response) {
        let bid: any = req.body;
        await mongo.coll_bids?.insertOne(bid).then((data) => {
            Connection.ioserver!.to(bid.vehicle_id + '').emit('price-changed', Auction.changePrice(bid.type, bid.auction_id, bid.client_id));
            res.send({ success: true });
        });
    }
}

let auctions = new Auctions();
routerV1.post('/bids', auctions.bids)

export { routerV1 }
