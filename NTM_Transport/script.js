const SERVER_URL = "wss://real-pear-meadow.glitch.me";

const BPM_KEY = "bpm";

// Client Initialization
const socket = io(SERVER_URL);

// SEND
const bpmInput = document.querySelector(".bpm");

bpmInput.onclick = () =>
{
    let bpmValue = bpmInput.value;
    socket.emit(BPM_KEY, bpmValue);
    maxOut(BPM_KEY, bpmValue);
}

// RECEIVE
socket.on("connect", () =>
{
     console.log("Connected to server!");
});

socket.on(BPM_KEY, (value) =>
{
    bpmInput.value = value;
    maxOut(BPM_KEY, value);
});

function maxOut(key, value)
{
    window.max.outlet(key, value);
}