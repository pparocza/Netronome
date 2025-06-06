import { createServer } from "http";
import { Server } from "socket.io";

const BPM_KEY = "bpm";
const BEAT_VALUE_KEY = "beatValue";
const LATENCY_MEASUREMENT_REQUEST_KEY = "latencyMeasurementRequest";
const START_LATENCY_MEASUREMENT_KEY = "startLatencyMeasurement";
const END_LATENCY_MEASUREMENT_KEY = "endLatencyMeasurement";
const LATENCY_MEASUREMENT_COMPLETE_KEY = "latencyMeasurementComplete";

let BPM = 120;
let BEAT_VALUE = 4;
let LATENCY_MEASUREMENT_STATUS = false;
let LATENCY_MEASUREMENT_CLIENT_ID = null;

let transportData =
    {
        set BPM(value) { BPM = value; },
        get BPM() { return BPM; },

        set BeatValue(value) { BEAT_VALUE = value; },
        get BeatValue() { return BEAT_VALUE; },

        set LatencyMeasurementStatus(value) { LATENCY_MEASUREMENT_STATUS = value; },
        get LatencyMeasuremenetStatus() { return LATENCY_MEASUREMENT_STATUS; },

        set LatencyMeasurementClientId(value) { LATENCY_MEASUREMENT_CLIENT_ID = value; },
        get LatencyMeasurementClientId() { return LATENCY_MEASUREMENT_CLIENT_ID; }
    }


const httpServer = createServer((req, res) =>
{
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Netronome Transport Server Active!");
    console.log("Server Starting!");
    res.end();
});

const io = new Server(httpServer,
    {
        cors: { origin: "*" }
    });


io.on("connection", (socket) =>
{
    socket.emit("initialize", transportData);

    socket.on(BPM_KEY, (value) =>
    {
        socket.broadcast.emit(BPM_KEY, value);
        transportData.BPM = value;
    });

    socket.on(BEAT_VALUE_KEY, (value) =>
    {
        socket.broadcast.emit(BEAT_VALUE_KEY, value);
        transportData.BeatValue = value;
    });

    socket.on(LATENCY_MEASUREMENT_REQUEST_KEY, (clientId) =>
    {
        // Don't allow requests if one is in progress
        if(transportData.LatencyMeasurementStatus)
        {
            return;
        }

        transportData.LatencyMeasurementStatus = true;
        transportData.LatencyMeasurementClientId = clientId;
        socket.broadcast.emit(START_LATENCY_MEASUREMENT_KEY, clientId);
    });

    socket.on(END_LATENCY_MEASUREMENT_KEY, (clientId) =>
    {
        if(clientId === transportData.LatencyMeasurementClientId)
        {
            socket.broadcast.emit(LATENCY_MEASUREMENT_COMPLETE_KEY);
            transportData.LatencyMeasurementStatus = false;
            transportData.LatencyMeasurementClientId = null;
        }
    });
});


// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () =>
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});

