MAX.configureMaxInlets();
SOCKET.initialize(SERVER_DATA.url.main);

// BPM
function setBPM(value)
{
    DISPLAY.bpm = value;
    updateBeatLength();
}

// BEAT VALUE
function setBeatValue(value)
{
    DISPLAY.beatValue = value ? value : 0;
    updateBeatLength();
    MAX.out(MAX.key.beatValue, value);
}

// BEAT LENGTH
function updateBeatLength()
{
    let beatLengthMs = (60000 * 4) / (SERVER_DATA.transport.bpm * SERVER_DATA.transport.beatValue);

    DISPLAY.beatLengthMs = beatLengthMs;
    MAX.out(MAX.key.beatLengthMs, beatLengthMs);

    UNIX_TRANSPORT.sync(beatLengthMs, true);
}

function updateLatencyMeasurementStatus(status)
{
    MAX.out(MAX.key.latencyMeasurementStatus, status);

    DISPLAY.latencyMeasurementStatus = status === 1;
}

