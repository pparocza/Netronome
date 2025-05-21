import { createServer } from "http";
import { Server } from "socket.io";

const BPM_KEY = "bpm";
const BEAT_VALUE_KEY = "beatValue";

let BPM = 120;
let BEAT_VALUE = 4;

let transportDictionary =
{
    set BPM(value) { BPM = value; },
    get BPM() { return BPM; },

    set BeatValue(value) { BEAT_VALUE = value; },
    get BeatValue() { return BEAT_VALUE; }
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
    socket.emit("initialize", transportDictionary);

    socket.on(BPM_KEY, (value) =>
    {
        socket.broadcast.emit(BPM_KEY, value);
        transportDictionary.BPM = value;
    });

    socket.on(BEAT_VALUE_KEY, (value) =>
    {
        socket.broadcast.emit(BEAT_VALUE_KEY, value);
        transportDictionary.BeatValue = value;
    });
});


// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () =>
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});