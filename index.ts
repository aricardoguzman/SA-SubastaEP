import { Socket } from "socket.io";
import { routerV1 } from './src/v1/routes/router';
import { Auction as AuctionController, auctionMap } from './src/controller/auctions'
import { fetchQuery, esb_url, token_url, credentials } from './src/middleware/request-handler';

//we create the interface
interface SocketConnection {
    socket?: Socket;
    ioserver?: any;
    rooms?: Map<string, Array<any>>;
    callbacks?: Map<string, any>;
}

//socket data
export const Connection: SocketConnection = {}
Connection.rooms = new Map();
Connection.callbacks = new Map();

//auction controller
export const Auction = new AuctionController();

/**
 * Server data
 */
const
    http = require("http"),
    express = require('express'),
    socketio = require("socket.io");

const SERVER_PORT = 3000;

let nextVisitorNumber = 1;
let onlineClients = new Set();


function onNewWebsocketConnection(socket: Socket) {
    Connection.socket = socket;

    onlineClients.add(socket.id);
    //console.log('socket-id', socket.id)

    socket.on("disconnect", () => {
        onlineClients.delete(socket.id);
    });

    socket.emit("welcome", `Welcome! You are visitor number ${nextVisitorNumber++}`);

    socket.on('join-room', async (name) => {
        //we check if auction id is created

        let cData = JSON.parse(name);
        let room = cData.vehicle_id;
        let data = await Auction.lookupAuction(room);

        if (data) {
            saveIDInRoom(room, socket.id);
            Connection.socket!.join(room, () => {
                Connection.ioserver!.to(room).emit('hola', "You connected room vehicle_2");
            });
            if (data.fin < Date.now()) {
                await Auction.updateAuction(cData.vehicle_id);
                data = { ...data, ini: Date.now(), fin: Date.now() + 60000 * 3 }
            }
        } else {
            data = await Auction.createAuction(cData.vehicle_id, cData.base_price);
            data = data.ops[0]
            auctionMap[data._id] = {
                vehicle_id: data.vehicle_id,
                base_price: data.base_price,
                current: data.base_price
            }
            saveIDInRoom(room, socket.id);
            Connection.socket!.join(room, () => {
                Connection.ioserver!.to(room).emit('hola', "You connected room vehicle_2");
            });
        }

        Connection.ioserver!.to(room).emit('room-data', JSON.stringify({ ...data, current: auctionMap[data._id].current }));

        if (!Connection.callbacks?.has(name)) {
            Connection.callbacks?.set(name, setTimeout(timerLoop, 3 * 60000, room, data._id))
        }
    });
}

function startServer() {
    // create a new express app
    const app = express();
    app.use(express.json())
    app.use('/', routerV1);
    // create http server and wrap the express app
    const server = http.createServer(app);
    // bind socket.io to that server
    const io = socketio(server);

    Connection.ioserver = io;

    // example on how to serve static files from a given folder
    app.use(express.static("public"));

    // will fire for every new websocket connection
    io.on("connection", onNewWebsocketConnection);

    // important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
    server.listen(SERVER_PORT, () => console.info(`Listening on port ${SERVER_PORT}.`));
}

function saveIDInRoom(name: string, id: string) {
    if (!Connection.rooms!.has(name)) {
        Connection.rooms!.set(name, [])
    }

    Connection.rooms!.get(name)!.push(id)
}

async function timerLoop(name: string, auction: string) {

    console.log(auctionMap[auction].client_id, auctionMap[auction].current);

    let token: any = await fetchQuery(token_url, "POST", credentials, undefined);

    console.log(token);

    let response: any = await fetchQuery(esb_url + '/Vehiculo', 'PUT', {
        jwt: token.token,
        id: name,
        estado: 4,
        afiliado_adjudicado: auctionMap[auction].client_id,
        valor_adjudicacion: auctionMap[auction].current
    }, undefined)

    console.log('pasó???');

    if (response.respuesta) {
        await fetchQuery(esb_url + '/Vehiculo', 'PUT', {
            jwt: token.token,
            id: name,
            estado: 5
        }, undefined)
    }

    Connection.ioserver!.to(name).emit('finish', 'se acabo!');
}

startServer();
