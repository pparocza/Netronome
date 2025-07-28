MAX.configureMaxInlets();
SOCKET.initialize(SERVER_DATA.url.main);

let BPM = null;
let BEAT_VALUE = null;

function calculateBeatLengthMS()
{
    if(BPM && BEAT_VALUE)
    {
        return 240000 / (BPM * BEAT_VALUE);
    }
    else
    {
        return 0;
    }
}

// BPM
function setBPM(bpm)
{
    BPM = bpm;

    DISPLAY.bpm = BPM;
    MAX.out(MAX.key.bpm, bpm);

    setBeatLength(calculateBeatLengthMS());
}

// BEAT VALUE
function setBeatValue(beatValue)
{
    BEAT_VALUE = beatValue;

    DISPLAY.beatValue = beatValue ? beatValue : 0;
    MAX.out(MAX.key.beatValue, beatValue);

    setBeatLength(calculateBeatLengthMS());
}

// BEAT LENGTH
function setBeatLength(beatLengthMs)
{
    SOCKET.beatLengthMs = beatLengthMs;
    DISPLAY.beatLengthMs = beatLengthMs;
    MAX.out(MAX.key.beatLengthMs, beatLengthMs);
}

function updateLatencyMeasurementStatus(status)
{
    MAX.out(MAX.key.latencyMeasurementStatus, status);

    DISPLAY.latencyMeasurementStatus = status === 1;
}

