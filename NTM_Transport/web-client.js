// add CDN for socket.io and link to this file in old-index.html header


// Variables
const serverURL = "wss://real-pear-meadow.glitch.me";

// Client Initialization
const socket = io(serverURL);

// RECEIVE

socket.on("connect", () => {            
     console.log("Connected to server!");
  });

socket.on("bang", () => {
    document.getElementById("recieveBang").style.background="green";
    setTimeout( () => document.getElementById("recieveBang").style.background="", 100);
});

// SEND

document.querySelector("#sendBang").onclick = () => {
    socket.emit("bang");
};