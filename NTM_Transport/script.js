const SERVER_URL = "wss://real-pear-meadow.glitch.me";
const CONNECTION_STATUS = "connection_status";

const BPM_KEY = "bpm";
const BPM_DISPLAY = document.querySelector(".BPM_DISPLAY");

const BEAT_VALUE_KEY = "beatValue";
const BEAT_VALUE_DISPLAY = document.querySelector(".BEAT_VALUE_DISPLAY");

let BPM_VALUE = 0;
let BEAT_VALUE = 0;

const BEAT_LENGTH_DISPLAY = document.querySelector(".BEAT_LENGTH_DISPLAY");
let BEAT_LENGTH_VALUE = 0;

let BEAT_LENGTH_MS = 0;

const UNIX_TIME_DISPLAY = document.querySelector(".unixTimeDisplay");
const TIME_UNTIL_NEXT_UNIX_BEAT_DISPLAY = document.querySelector(".timeUntilNextUnixBeatDisplay");
const NEXT_UNIX_BEAT_TIME_DISPLAY = document.querySelector(".nextUnixBeatTimeDisplay");
const ERROR_DISPLAY = document.querySelector(".errorDisplay");
const UNIX_BEAT_KEY = "unixBeat";

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

function maxOut(key, value)
{
    if(window.max)
    {
        window.max.outlet(key, value);
    }
}

// TODO: this is what will get BPM value in from Ableton
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

    maxOut(BPM_KEY, BPM_VALUE);
}

// BEAT VALUE
// TODO: this is what will get the BEAT value in from Ableton
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

    maxOut(BEAT_VALUE_KEY, BEAT_VALUE);
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

    UNIX_TIME_DISPLAY.innerHTML = currentUnixTime.toString();
    TIME_UNTIL_NEXT_UNIX_BEAT_DISPLAY.innerHTML = timeUntilNextUnixBeat.toString();
    NEXT_UNIX_BEAT_TIME_DISPLAY.innerHTML = nextUnixBeatTime.toString();
    ERROR_DISPLAY.innerHTML = errorLength.toString();

    unixTransportBeat();
}

function unixTransportBeat()
{
    if(!window.max)
    {
        return;
    }

    maxOut(UNIX_BEAT_KEY, "bang");
}

function maxInlets()
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

maxInlets();