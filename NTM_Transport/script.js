const SERVER_URL = "wss://real-pear-meadow.glitch.me";
const CONNECTION_STATUS = "connection_status";

const BPM_INPUT = document.querySelector(".bpm");
const BPM_KEY = "bpm";
let BPM_VALUE = BPM_INPUT.value;

// Client Initialization
const socket = io(SERVER_URL);

// RECEIVE
socket.on("connect", () =>
{
    console.log("Connected to server!");
    maxOut(CONNECTION_STATUS, 1);
});

socket.on(BPM_KEY, (value) =>
{
    setBPM(value);
});

socket.on("initialize", (transportDictionary) =>
{
    setBPM(transportDictionary.BPM);
});

// SEND
BPM_INPUT.onchange = onBPMInputChanged;

function maxOut(key, value)
{
    if(window.max)
    {
        window.max.outlet(key, value);
    }
}

function onBPMInputChanged()
{
    let inputValue = BPM_INPUT.value;
    setBPM(BPM_INPUT.value)
    socket.emit(BPM_KEY, inputValue);
}

function setBPM(value)
{
    BPM_VALUE = value;
    BPM_INPUT.value = BPM_VALUE;
    maxOut(BPM_KEY, BPM_VALUE);
}