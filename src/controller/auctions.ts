import { mongo } from '../database/mongo-client';


export const auctionMap: any = {};

export class Auction {


  public async lookupAuction(vehicle_id: string) {
    let room = await mongo.coll_auctions!.findOne({ vehicle_id });
    if (room !== null && auctionMap[room._id] === undefined) {
      auctionMap[room._id] = {
        vehicle_id: room.vehicle_id,
        base_price: room.base_price,
        current: room.base_price,
        client_id: -1
      }
    }
    return room;
  }


  public changePrice(type: 1 | 0, auction_id: string, client_id: string) {
    let ref = auctionMap[auction_id];
    ref.current = ref.current + ((type === 1) ? 1000 : 500);
    ref.client_id = client_id;
    return ref.current;
  }


  public async createAuction(vehicle_id: string, base_price: number) {

    return new Promise((resolve, reject) => mongo.coll_auctions!.insertOne({
      vehicle_id,
      base_price,
      current: base_price,
      min_price: base_price,
      ini: Date.now(),
      fin: Date.now() + 60000 * 3,
      winner: -1
    }, (err, data) => {
      if (err)
        reject(err);
      resolve(data);
    })
    );


  }


  public async updateAuction(vehicle_id: string) {

    return await mongo.coll_auctions!.findOneAndUpdate({
      vehicle_id
    }, {
      $set: {
        "ini": Date.now(),
        "fin": Date.now() + 60000 * 3,
      }
    },
      { returnOriginal: false });
  }

  public async findMax(auction_id: string) {

  }

}