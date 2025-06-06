const SERVER_URL = "wss://dust-curved-bearskin.glitch.me";
const CONNECTION_STATUS_KEY = "connection_status";
const CONNECTING_DISPLAY = document.querySelector(".CONNECTING_DISPLAY_CONTENT");
const CONNECTED_DISPLAY = document.querySelector(".CONNECTED_DISPLAY_CONTENT");
const LATENCY_MEASUREMENT_STATUS_DISPLAY = document.querySelector
(
    ".LATENCY_MEASUREMENT_STATUS_DISPLAY"
);

let BPM_VALUE = 0;
const BPM_KEY = "bpm";
const BPM_DISPLAY = document.querySelector(".BPM_DISPLAY");

let BEAT_VALUE = 0;
const BEAT_VALUE_KEY = "beatValue";
const BEAT_VALUE_DISPLAY = document.querySelector(".BEAT_VALUE_DISPLAY");

let BEAT_LENGTH_MS = 0;
const BEAT_LENGTH_MS_KEY = "ntmTransportBeatLength";
const BEAT_LENGTH_MS_DISPLAY = document.querySelector(".BEAT_LENGTH_MS_DISPLAY");

const CURRENT_UNIX_TIME_KEY = "currentUnixTime";
const TIME_TO_NEXT_UNIX_BEAT_KEY = "timeToNextUnixBeat";

const REQUEST_START_LATENCY_MEASUREMENT_KEY = "requestStartLatencyMeasurement";
const START_LATENCY_MEASUREMENT_KEY = "startLatencyMeasurement";
const REQUEST_END_LATENCY_MEASUREMENT_KEY = "requestEndLatencyMeasurement";
const LATENCY_MEASUREMENT_STATUS_KEY = "latencyMeasurementStatus";
const LATENCY_MEASUREMENT_COMPLETE_KEY = "latencyMeasurementComplete";

const IS_MAX_WINDOW = window.max;

const CLIENT_ID = Math.round(Math.random() * 1000000);

// SOCKET
const socket = io(SERVER_URL);

socket.on("connect", () =>
{
    handleClientConnected();
});

socket.on("initialize", (transportDictionary) =>
{
    setBPM(transportDictionary.BPM);
    setBeatValue(transportDictionary.BeatValue);

    updateBeatLength();
});

socket.on(BPM_KEY, (value) =>
{
    setBPM(value);
});

socket.on(BEAT_VALUE_KEY, (value) =>
{
    setBeatValue(value);
});

socket.on(START_LATENCY_MEASUREMENT_KEY, (clientId) =>
{
    updateLatencyMeasurementStatus(1);

    if(clientId === CLIENT_ID)
    {
        startLatencyMeasurement();
    }
});

socket.on(LATENCY_MEASUREMENT_COMPLETE_KEY, () =>
{
   updateLatencyMeasurementStatus(0);
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
    BEAT_LENGTH_MS = parseInt(BEAT_LENGTH_MS);
    BEAT_LENGTH_MS_DISPLAY.innerHTML = BEAT_LENGTH_MS;

    toMax(BEAT_LENGTH_MS_KEY, BEAT_LENGTH_MS);
    
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
        timeToNextUnixBeatToMax();
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

        TRANSPORT_START_TARGET = BEAT_LENGTH_MS - (Date.now() % BEAT_LENGTH_MS);
        ATTEMPTING_TIMER_SYNC = setInterval(tryStartUnixTransport, 1);
    }
}

function tryStartUnixTransport()
{
    if(Date.now() > TRANSPORT_START_TARGET)
    {
        syncUnixTransport(true);
    }

    if(Date.now() % BEAT_LENGTH_MS === 0)
    {
        clearInterval(ATTEMPTING_TIMER_SYNC);
        TRANSPORT_INTERVAL = setInterval(timeToNextUnixBeatToMax, BEAT_LENGTH_MS);
    }
}

function timeToNextUnixBeatToMax()
{
    if(!IS_MAX_WINDOW)
    {
        return;
    }

    toMax(TIME_TO_NEXT_UNIX_BEAT_KEY, BEAT_LENGTH_MS - (Date.now() % BEAT_LENGTH_MS));
}

// UTILITY
function handleClientConnected()
{
    CONNECTED_DISPLAY.hidden = false;
    CONNECTING_DISPLAY.hidden = true;

    toMax(BPM_KEY, BPM_VALUE);
    toMax(BEAT_VALUE_KEY, BEAT_VALUE);

    toMax(CONNECTION_STATUS_KEY, 1);
}

// MAX
function toMax(key, args)
{
    if(!IS_MAX_WINDOW)
    {
        return;
    }

    window.max.outlet(key, args);
}

function configureMaxInlets()
{
    if(!IS_MAX_WINDOW)
    {
        return;
    }

    window.max.bindInlet("set_bpm", (bpm) =>
    {
        bpmInput(bpm);
    });

    window.max.bindInlet("set_signature_denominator", (signatureDenominator) =>
    {
        beatValueInput(signatureDenominator);
    });

    window.max.bindInlet("get_unix_time", () =>
    {
        toMax(CURRENT_UNIX_TIME_KEY, Date.now().toString());
    });

    window.max.bindInlet("request_start_jacktrip_latency_measurement", () =>
    {
        requestStartJackTripLatencyMeasurement();
    });

    window.max.bindInlet("request_end_jacktrip_latency_measurement", () =>
    {
        requestEndJackTripLatencyMeasurement();
    });
}

function requestStartJackTripLatencyMeasurement()
{
    socket.emit(REQUEST_START_LATENCY_MEASUREMENT_KEY, CLIENT_ID);
};

function startLatencyMeasurement()
{
    toMax(START_LATENCY_MEASUREMENT_KEY, 1);
};

function requestEndJackTripLatencyMeasurement()
{
    socket.emit(REQUEST_END_LATENCY_MEASUREMENT_KEY, CLIENT_ID);
};

function updateLatencyMeasurementStatus(status)
{
    LATENCY_MEASUREMENT_STATUS_DISPLAY.hidden = status !== 1;

    toMax(LATENCY_MEASUREMENT_STATUS_KEY, status);
};

configureMaxInlets();