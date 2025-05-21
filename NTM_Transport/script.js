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

    console.log(transportDictionary);

    updateBeatLength();
});

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
    setBPM(inputValue);
}

function setBPM(value)
{
    BPM_VALUE = value;
    BPM_INPUT.value = BPM_VALUE;

    updateBeatLength();

    socket.emit(BPM_KEY, BPM_VALUE);

    maxOut(BPM_KEY, BPM_VALUE);
}

// BEAT VALUE

BEAT_VALUE_INPUT.oninput = onBeatValueChanged;

function onBeatValueChanged()
{
    let beatValue = getBeatValue();
    setBeatValue(beatValue);
}

function setBeatValue(value)
{
    BEAT_VALUE = value;

    setBeatValueDisplay(BEAT_VALUE);

    updateBeatLength();

    socket.emit(BEAT_VALUE_KEY, BEAT_VALUE);
    maxOut(BEAT_VALUE_KEY, BEAT_VALUE);
}

function getBeatValue()
{
    let beatValueOptions = BEAT_VALUE_INPUT.elements;

    for(let elementIndex = 0; elementIndex < beatValueOptions.length; elementIndex++)
    {
        let element = beatValueOptions[elementIndex];

        if (element.checked)
        {
            return element.value;
        }
    }
}

function setBeatValueDisplay(value)
{
    let beatValueOptions = BEAT_VALUE_INPUT.elements;

    for(let elementIndex = 0; elementIndex < beatValueOptions.length; elementIndex++)
    {
        let element = beatValueOptions[elementIndex];

        if (element.value === value)
        {
            element.checked = true;
        }
    }
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
        BEAT_VALUE = getBeatValue();
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