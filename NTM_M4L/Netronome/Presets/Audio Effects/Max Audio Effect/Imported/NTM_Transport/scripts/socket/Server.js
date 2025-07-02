import { createServer } from "http";
import { Server } from "socket.io";
import { TransportServerData } from "./TransportServerData.js";
import { TransportClientData } from "./TransportClientData.js";

import cron from 'node-cron';

cron.schedule('*/10 * * * *', () => {
    console.log('Keep Render Server Awake');
});

const KEYS = TransportServerData.key;
const TRANSPORT = TransportServerData.transport;

const httpServer = createServer
((req, res) =>
    {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Netronome Transport Server Active!");

        // TODO: Add listeners to the response so that you can update the server display?

        res.end();
    }
);

const io = new Server(httpServer,
{
        cors: { origin: "*" }
});


io.on("connection", (socket) =>
{
    // TODO: figure out disconnection

    let client = new TransportClientData();
    TransportServerData.addClient(client);

    // TODO: make use of the existing socket.id
    let serverData =
    {
        server: TransportServerData,
        clientId: client.id
    };

    socket.emit("initialize", serverData);
    socket.emit("update")

    socket.on(KEYS.bpm, (value) => { handleBPM(socket, value); });
    socket.on(KEYS.beatValue, (value) => { handleBeatValue(socket, value); });
    socket.on(KEYS.requestCurrentTime, (clientId) =>
    {
        handleCurrentTimeRequest(socket, clientId);
    });

    socket.on(KEYS.requestStartLatencyMeasurement, (clientId) =>
    {
        handleLatencyMeasurementRequest(socket, clientId);
    });

    socket.on(KEYS.requestEndLatencyMeasurement, (clientId) =>
    {
        handleEndLatencyMeasurementRequest(socket, clientId);
    });

    socket.on(KEYS.removeClient, (transportClientId) =>
    {
        handleRemoveClient(socket, transportClientId);
    });

    socket.broadcast.emit(KEYS.updateClientList, TransportServerData.clients);
});

function handleBPM(socket, value)
{
    socket.broadcast.emit(KEYS.bpm, value);
    TRANSPORT.bpm = value;
}

function handleBeatValue(socket, value)
{
    socket.broadcast.emit(TRANSPORT.beatValue, value);
    TRANSPORT.beatValue = value;
}

function handleCurrentTimeRequest(socket, clientId)
{
    socket.emit(KEYS.currentTime, clientId, performance.now());
}

function handleLatencyMeasurementRequest(socket, clientId)
{
    // Don't allow requests if one is in progress
    if(TRANSPORT.latencyMeasurementStatus)
    {
        return;
    }

    TRANSPORT.latencyMeasurementStatus = true;
    TRANSPORT.latencyMeasurementClientId = clientId;

    // TODO: sort out the difference between .emit and broadcast.emit
    socket.broadcast.emit(KEYS.startLatencyMeasurement, clientId);
    socket.emit(KEYS.startLatencyMeasurement, clientId);
}

function handleEndLatencyMeasurementRequest(socket, clientId)
{
    if(clientId === TRANSPORT.latencyMeasurementClientId)
    {
        TRANSPORT.latencyMeasurementStatus = false;
        TRANSPORT.latencyMeasurementClientId = null;

        socket.emit(KEYS.latencyMeasurementComplete);
        socket.broadcast.emit(KEYS.latencyMeasurementComplete);
    }
}

function handleRemoveClient(socket, transportClientId)
{
    TransportServerData.removeClient(transportClientId);
    socket.emit(KEYS.currentTime, TransportServerData.clients);
}

// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () =>
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});

