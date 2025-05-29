const SERVER_URL = "wss://dust-curved-bearskin.glitch.me";
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
const CURRENT_UNIX_TIME_KEY = "currentUnixTime";
const TIME_TO_NEXT_UNIX_BEAT_KEY = "timeToNextUnixBeat";
const UNIX_BEAT_ERROR_KEY = "unixBeatError";
const TRANSPORT_BEAT_LENGTH_KEY = "ntmTransportBeatLength"

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

// TODO: eventually get rid of this, and handle all polling and sync from Max, only using
//  using this to get the current value of Date.now() to compare against the [metro] object
//  in Max
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
    let errorLength = currentUnixTime % BEAT_LENGTH_VALUE;
    let timeUntilNextUnixBeat = BEAT_LENGTH_VALUE - (currentUnixTime % BEAT_LENGTH_VALUE);
    let nextUnixBeatTime = currentUnixTime + timeUntilNextUnixBeat;

    unixTransportBeat(timeUntilNextUnixBeat, errorLength);
}

function unixTransportBeat(timeUntilNextUnixBeat, errorLength)
{
    if(!window.max)
    {
        return;
    }

    toMax(UNIX_BEAT_KEY, "bang");
    toMax(TIME_TO_NEXT_UNIX_BEAT_KEY, timeUntilNextUnixBeat);
    toMax(TRANSPORT_BEAT_LENGTH_KEY, BEAT_LENGTH_MS);
    toMax(UNIX_BEAT_ERROR_KEY, errorLength);
}

// UTILITY
function handleClientConnected()
{
    console.log("Connected to server!");

    CONNECTED_DISPLAY.hidden = false;
    CONNECTING_DISPLAY.hidden = true;

    toMax(BPM_KEY, BPM_VALUE);
    toMax(BEAT_VALUE_KEY, BEAT_VALUE);

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

    window.max.bindInlet("get_unix_time", function ()
    {
        unixTimeToMax();
        toMax(CURRENT_UNIX_TIME_KEY, "Unix Time!");
        // toMax(CURRENT_UNIX_TIME_KEY, Date.now());
        // toMax(CURRENT_UNIX_TIME_KEY, Date.now() * 0.0001);
        // toMax(CURRENT_UNIX_TIME_KEY, Date.now().toString());
    });
}

function unixTimeToMax()
{
    toMax(CURRENT_UNIX_TIME_KEY, 1);
    toMax(CURRENT_UNIX_TIME_KEY, "Unix Time!");
}

configureMaxInlets();