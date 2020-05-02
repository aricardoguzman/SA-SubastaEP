export interface BidsInterface {
  auction_id: string;
  vehicle_id: number,
  type: 0 | 1;
  client_id: number;
  timestamp: number;
  price: number;
}