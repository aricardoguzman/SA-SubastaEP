import * as express from 'express';
import { routerV1 as auctionRouter } from './auctions';
const routerV1 = express.Router();


routerV1.use('/', auctionRouter);


export { routerV1 }