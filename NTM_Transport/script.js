const SERVER_URL = "wss://real-pear-meadow.glitch.me";
const CONNECTION_STATUS = "connection_status";
const CONNECTING_DISPLAY = document.querySelector(".CONNECTING_DISPLAY_CONTENT");
const CONNECTED_DISPLAY = document.querySelector(".CONNECTED_DISPLAY_CONTENT");

const BPM_KEY = "bpm";
const BPM_DISPLAY = document.querySelector(".BPM_DISPLAY");

const BEAT_VALUE_KEY = "beatValue";
const BEAT_VALUE_DISPLAY = document.querySelector(".BEAT_VALUE_DISPLAY");

let BPM_VALUE = 0;
let BEAT_VALUE = 0;

const BEAT_LENGTH_DISPLAY = document.querySelector(".BEAT_LENGTH_DISPLAY");
let BEAT_LENGTH_VALUE = 0;

let BEAT_LENGTH_MS = 0;

const UNIX_BEAT_KEY = "unixBeat";
const UNIX_BEAT_DATA_KEY = "unixBeatData";

// SOCKET
const socket = io(SERVER_URL);

socket.on("connect", () =>
{
    handleClientConnected();
});

socket.on(BPM_KEY, (value) =>
{
    setBPM(value);
});

socket.on(BEAT_VALUE_KEY, (value) =>
{
    setBeatValue(value);
})

socket.on("initialize", (transportDictionary) =>
{
    setBPM(transportDictionary.BPM);
    setBeatValue(transportDictionary.BeatValue);

    updateBeatLength();
});

// BPM
function bpmInput(bpm)
{
    setBPM(bpm)
    socket.emit(BPM_KEY, bpm);
}

function setBPM(value)
{
    BPM_VALUE = value;

    BPM_DISPLAY.innerHTML = BPM_VALUE;

    updateBeatLength();

    toMax(BPM_KEY, BPM_VALUE);
}

// BEAT VALUE
function beatValueInput(beatValue)
{
    setBeatValue(beatValue);
    socket.emit(BEAT_VALUE_KEY, beatValue);
}

function setBeatValue(value)
{
    BEAT_VALUE = value;

    BEAT_VALUE_DISPLAY.innerHTML = value;

    updateBeatLength();

    toMax(BEAT_VALUE_KEY, BEAT_VALUE);
}

// BEAT LENGTH
function updateBeatLength()
{
    if(BPM_VALUE <= 0)
    {
        return;
    }

    if(!BEAT_VALUE)
    {
        return;
    }

    BEAT_LENGTH_MS = (60000 * 4) / (BPM_VALUE * BEAT_VALUE);
    BEAT_LENGTH_VALUE = parseInt(BEAT_LENGTH_MS);
    BEAT_LENGTH_DISPLAY.innerHTML = BEAT_LENGTH_VALUE;

    syncUnixTransport(true);
}

// UNIX TRANSPORT
let ATTEMPTING_TIMER_SYNC;
let TRANSPORT_INTERVAL;
let TRANSPORT_START_TARGET = 0;

function syncUnixTransport(resetInterval = false)
{
    if(!ATTEMPTING_TIMER_SYNC)
    {
        updateUnixTransport();
    }

    if(resetInterval)
    {
        if(ATTEMPTING_TIMER_SYNC)
        {
            clearInterval(ATTEMPTING_TIMER_SYNC);
        }

        if(TRANSPORT_INTERVAL)
        {
            clearInterval(TRANSPORT_INTERVAL);
        }

        TRANSPORT_START_TARGET = BEAT_LENGTH_VALUE - (Date.now() % BEAT_LENGTH_VALUE);
        ATTEMPTING_TIMER_SYNC = setInterval(tryStartUnixTransport, 1);
    }
}

function tryStartUnixTransport()
{
    if(Date.now() > TRANSPORT_START_TARGET)
    {
        syncUnixTransport(true);
    }

    if(Date.now() % BEAT_LENGTH_VALUE === 0)
    {
        clearInterval(ATTEMPTING_TIMER_SYNC);
        TRANSPORT_INTERVAL = setInterval(updateUnixTransport, BEAT_LENGTH_VALUE);
    }
}

function updateUnixTransport()
{
    let currentUnixTime = Date.now();
    let timeUntilNextUnixBeat = BEAT_LENGTH_VALUE - (currentUnixTime % BEAT_LENGTH_VALUE);
    let nextUnixBeatTime = currentUnixTime + timeUntilNextUnixBeat;
    let errorLength = BEAT_LENGTH_VALUE - timeUntilNextUnixBeat;

    unixTransportBeat();
}

function unixTransportBeat()
{
    if(!window.max)
    {
        return;
    }

    toMax(UNIX_BEAT_KEY, "bang");
    toMax(UNIX_BEAT_DATA_KEY, "data!");
}

// UTILITY
function handleClientConnected()
{
    console.log("Connected to server!");

    CONNECTED_DISPLAY.hidden = false;
    CONNECTING_DISPLAY.hidden = true;

    toMax(CONNECTION_STATUS, 1);
}

function toMax(key, args)
{
    if(!window.max)
    {
        return;
    }

    window.max.outlet(key, args);
}

function configureMaxInlets()
{
    if(!window.max)
    {
        return;
    }

    window.max.bindInlet("set_bpm", function(bpm)
    {
        bpmInput(bpm);
    });

    window.max.bindInlet("set_signature_denominator", function(signatureDenominator)
    {
        beatValueInput(signatureDenominator);
    });
}

configureMaxInlets();