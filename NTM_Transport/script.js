const SERVER_URL = "wss://real-pear-meadow.glitch.me";
const CONNECTION_STATUS = "connection_status";

const BPM_INPUT = document.querySelector(".bpm");
const BPM_KEY = "bpm";
let BPM_VALUE = BPM_INPUT.value;

const BEAT_VALUE_INPUT = document.querySelector(".beatValue");
const BEAT_VALUE_KEY = "beatValue";
let BEAT_VALUE = BEAT_VALUE_INPUT.value;

const BEAT_LENGTH_DISPLAY = document.querySelector(".beatLength");
let BEAT_LENGTH_VALUE = 0;

let BEAT_LENGTH_MS = 0;

const UNIX_TIME_DISPLAY = document.querySelector(".unixTimeDisplay");
const TIME_UNTIL_NEXT_UNIX_BEAT_DISPLAY = document.querySelector(".timeUntilNextUnixBeatDisplay");
const NEXT_UNIX_BEAT_TIME_DISPLAY = document.querySelector(".nextUnixBeatTimeDisplay");
const ERROR_DISPLAY = document.querySelector(".errorDisplay");
const UNIX_BEAT_KEY = "unixBeat";

/*
based on the bpm and beat value, get the length in milliseconds of a beat:
    - get timeUntilNextUnixBeat = (current Date.now() % (beatInMilliseconds)
    - start Unix transport on next Unix beat
    - count Unix transport based on beat value

    - display Unix transport in page to compare to local Unix transport values
 */

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

// BPM
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

    updateBeatLength();

    maxOut(BPM_KEY, BPM_VALUE);
}

// BEAT LENGTH

BEAT_VALUE_INPUT.oninput = onBeatLengthChanged;

function onBeatLengthChanged()
{
    BEAT_VALUE = BEAT_VALUE_INPUT.value;
    updateBeatLength();
}

function updateBeatLength()
{
    if(BPM_VALUE <= 0)
    {
        return;
    }

    BEAT_LENGTH_MS = (60000 * 4) / (BPM_VALUE * BEAT_VALUE);
    BEAT_LENGTH_VALUE = parseInt(BEAT_LENGTH_MS);
    BEAT_LENGTH_DISPLAY.innerHTML = BEAT_LENGTH_VALUE;

    syncUnixTransport(true);
}

let ATTEMPTING_TIMER_SYNC;
let TRANSPORT_INTERVAL;
let TRANSPORT_START_TARGET = 0;

// UNIX TRANSPORT
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