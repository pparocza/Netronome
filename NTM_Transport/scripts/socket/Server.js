import { createServer } from "http";
import { Server } from "socket.io";
import cron from 'node-cron';

cron.schedule('*/10 * * * *', () => {
    console.log('Keep Render Server Awake');
});

const BPM_KEY = "bpm";
const BEAT_VALUE_KEY = "beatValue";
const REQUEST_START_LATENCY_MEASUREMENT_KEY = "requestStartLatencyMeasurement";
const START_LATENCY_MEASUREMENT_KEY = "startLatencyMeasurement";
const REQUEST_END_LATENCY_MEASUREMENT_KEY = "requestEndLatencyMeasurement";
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

    socket.on(REQUEST_START_LATENCY_MEASUREMENT_KEY, (clientId) =>
    {
        // Don't allow requests if one is in progress
        if(transportData.LatencyMeasurementStatus)
        {
            return;
        }

        transportData.LatencyMeasurementStatus = true;
        transportData.LatencyMeasurementClientId = clientId;

        // TODO: sort out the difference between .emit and broadcast.emit
        socket.broadcast.emit(START_LATENCY_MEASUREMENT_KEY, clientId);
        socket.emit(START_LATENCY_MEASUREMENT_KEY, clientId);
    });

    socket.on(REQUEST_END_LATENCY_MEASUREMENT_KEY, (clientId) =>
    {
        if(clientId === transportData.LatencyMeasurementClientId)
        {
            transportData.LatencyMeasurementStatus = false;
            transportData.LatencyMeasurementClientId = null;

            socket.emit(LATENCY_MEASUREMENT_COMPLETE_KEY);
            socket.broadcast.emit(LATENCY_MEASUREMENT_COMPLETE_KEY);
        }
    });
});


// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () =>
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});

