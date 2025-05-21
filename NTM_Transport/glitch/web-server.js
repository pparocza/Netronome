import { createServer } from "http";                      
import { Server } from "socket.io";      

const BPM_KEY = "bpm";
let BPM = 120;

let transportDictionary = 
{
  set BPM(value) { BPM = value; },
  get BPM() { return BPM; }
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
    
    // Response to client sending BPM_KEY
    socket.on(BPM_KEY, (value) =>
    {
        socket.broadcast.emit(BPM_KEY, value);
        transportDictionary.BPM = value;
    });
});


// Launch server
const myPort = process.env.PORT || 3000;

httpServer.listen(myPort, () => 
{
    console.log(`Netronome Transport Server listening on port: ${myPort}`);
});