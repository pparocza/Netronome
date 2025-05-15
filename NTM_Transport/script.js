const SERVER_URL = "wss://real-pear-meadow.glitch.me";

// Client Initialization
const socket = io(SERVER_URL);

// RECEIVE

socket.on("connect", () =>
{
     console.log("Connected to server!");
});

socket.on("bang", () =>
{
    document.getElementById("recieveBang").style.background="green";
    setTimeout( () => document.getElementById("recieveBang").style.background="", 100);
});

// SEND

document.querySelector("#sendBang").onclick = () =>
{
    socket.emit("bang");
};

const bpmInput = document.querySelector(".bpm");

bpmInput.onclick = () =>
{
    let bpmValue = bpmInput.value;

    console.log("BPM:", bpmValue);
    socket.emit("bpm", bpmValue);
}