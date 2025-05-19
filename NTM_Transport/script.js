const SERVER_URL = "wss://real-pear-meadow.glitch.me";
const CONNECTION_STATUS = "connection_status";

const BPM_INPUT = document.querySelector(".bpm");
const BPM_KEY = "bpm";
let BPM_VALUE = BPM_INPUT.value;

// Client Initialization
const socket = io(SERVER_URL);

window.max.bindInlet("onClientConnected", initializePatch);

function initializePatch()
{
    maxOut(BPM_KEY, BPM_VALUE);
}

// SEND


BPM_INPUT.onclick = () =>
{
    let inputValue = BPM_INPUT.value;
    socket.emit(BPM_KEY, inputValue);
    BPM_VALUE = inputValue;
    maxOut(BPM_KEY, BPM_VALUE);
}

// RECEIVE
socket.on("connect", () =>
{
     console.log("Connected to server!");
     maxOut(CONNECTION_STATUS, 1);
});

socket.on(BPM_KEY, (value) =>
{
    BPM_INPUT.value = value;
    BPM_VALUE = value;
    maxOut(BPM_KEY, BPM_VALUE);
});

function maxOut(key, value)
{
    window.max.outlet(key, value);
}