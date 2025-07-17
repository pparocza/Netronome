MAX.configureMaxInlets();
SOCKET.initialize(SERVER_DATA.url.dev);

// BPM
function setBPM(bpm)
{
    DISPLAY.bpm = bpm;
}

// BEAT VALUE
function setBeatValue(beatValue)
{
    DISPLAY.beatValue = beatValue ? beatValue : 0;
    MAX.out(MAX.key.beatValue, beatValue);
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

