import { createServer } from "http";
import { Server } from "socket.io";
import { TransportServer } from "./TransportServer.js";
import { TransportClient } from "./TransportClient.js";

const KEYS = TransportServer.key;
const TRANSPORT = TransportServer.transport;

const httpServer = createServer((req, res) =>
{
    TransportServer.clients = null;
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Netronome Transport Server Active!");

    // TODO: Add listeners to the response so that you can update the server display?

    res.end();
});

const io = new Server(httpServer,
    {
        cors: { origin: "*" }
    });


io.on("connection", (socket) =>
{
    // TODO: figure out disconnection

    let client = new TransportClient();
    TransportServer.addClient(client);

    // TODO: make use of the existing socket.id
    let serverData =
        {
            server: TransportServer,
            clientId: client.id
        };

    socket.emit("initialize", serverData);
    socket.emit("update")

    socket.on(KEYS.bpm, (value) =>
    {
        socket.broadcast.emit(KEYS.bpm, value);
        TRANSPORT.bpm = value;
    });

    socket.on(TRANSPORT.beatValue, (value) =>
    {
        socket.broadcast.emit(TRANSPORT.beatValue, value);
        TRANSPORT.beatValue = value;
    });

    socket.on(KEYS.requestStartLatencyMeasurement, (clientId) =>
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
    });

    socket.on(KEYS.requestEndLatencyMeasurement, (clientId) =>
    {
        if(clientId === TRANSPORT.latencyMeasurementClientId)
        {
            TRANSPORT.latencyMeasurementStatus = false;
            TRANSPORT.latencyMeasurementClientId = null;

            socket.emit(KEYS.latencyMeasurementComplete);
            socket.broadcast.emit(KEYS.latencyMeasurementComplete);
        }
    });

    socket.on(KEYS.removeClient, (transportClientId) =>
    {
        TransportServer.removeClient(transportClientId);
        socket.emit(KEYS.updateClientLists, TransportServer.clients);
    });

    socket.on(KEYS.requestServerRoundTrip, (clientId) =>
    {
        socket.emit(KEYS.serverRoundTrip, clientId);
    });

    socket.broadcast.emit(KEYS.updateClientList, TransportServer.clients);

    // TODO: How to have this send the same value to every client?
    //  currently starts a separate interval for each one
    setInterval(() =>
    {
        socket.emit(KEYS.currentUnixTime, Date.now());
    }, 1000);

});


// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () =>
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});

