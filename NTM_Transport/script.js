// TODO: Figure out how to get modules going in M4L because this megascript is absurd

const DISPLAY =
{
    _element:
    {
        connecting: document.querySelector(".CONNECTING_DISPLAY_CONTENT"),
        connected: document.querySelector(".CONNECTED_DISPLAY_CONTENT"),

        name: document.querySelector(".NAME_DISPLAY"),
        nameDiv: document.querySelector(".NAME_DIV"),

        userList: document.querySelector(".USER_LIST_DISPLAY"),
        userListDiv: document.querySelector(".USER_LIST_DIV"),

        bpm: document.querySelector(".BPM_DISPLAY"),
        beatValue: document.querySelector(".BEAT_VALUE_DISPLAY"),
        beatLengthMs: document.querySelector(".BEAT_LENGTH_MS_DISPLAY"),

        unixTime: document.querySelector(".UNIX_TIME_DISPLAY"),
        serverRoundTrip: document.querySelector(".SERVER_ROUNDTRIP_DISPLAY"),

        latencyMeasurementStatus: document.querySelector(".LATENCY_MEASUREMENT_STATUS_DISPLAY"),
    },

    get connecting() { return this._element.connecting; },
    set connecting(value) { this.setInnerHtml(this._element.connecting, value); },

    get connected() { return this._element.connected; },
    set connected(value) { this.setInnerHtml(this._element.connected, value); },

    set latencyMeasurementStatus(value) { this._element.latencyMeasurementStatus.hidden = value; },

    set bpm(value) { this.setInnerHtml(this._element.bpm, value); },
    set beatValue(value) { this.setInnerHtml(this._element.beatValue, value); },
    set beatLengthMs(value) { this.setInnerHtml(this._element.beatLengthMs, value); },

    set unixTime(value) { this.setInnerHtml(this._element.unixTime, value); },
    set serverRoundTrip(value) { this.setInnerHtml(this._element.serverRoundTrip, value); },

    get nameDiv() { return this._element.nameDiv; },
    set nameDisplay(value) { this.setInnerHtml(this._element.name, value); },

    set userList(value) { this.setInnerHtml(this._element.userList, value); },

    setInnerHtml(element, value)
    {
        element.innerHTML = value.toString();
    }
}

const MAX =
{
    _socket: null,

    key:
        {
            beatLengthMs: "ntmTransportBeatLength",
            connectionStatus: "connection_status",
            currentUnixTime: "currentUnixTime",
            timeToNextUnixBeat: "timeToNextUnixBeat",

            // initialized from Transport Server
            bpm: null,
            beatValue: null,
            startLatencyMeasurement: null,

            inlet:
            {
                setBpm: "set_bpm",
                setSignatureDenominator: "set_signature_denominator",
                getUnixTime: "get_unix_time",
                requestJackTripLatencyMeasurement: "request_jacktrip_latency_measurement",
                requestEndJackTripLatencyMeasurement: "request_end_jacktrip_latency_measurement"
            }
        },

    getServerKeys(transportServer)
    {
        this.key.bpm = transportServer.key.bpm;
        this.key.beatValue = transportServer.key.beatValue;
        this.key.startLatencyMeasurement = transportServer.key.startLatencyMeasurement;
    },

    // TODO: consolidate all this into a single "MaxValue" class
    _bpm: 0,
    set bpm(value)
    {
        this._bpm = value;
        this.out(this.key.bpm, this._bpm);
    },

    out(key, args)
    {
        if(!window.max)
        {
            return;
        }

        window.max.outlet(key, args);
    },

    startLatencyMeasurement()
    {
        this.out(this.key.startLatencyMeasurement, 1);
    },

    configureMaxInlets()
    {
        if(!window.max)
        {
            return;
        }

        window.max.bindInlet(this.key.inlet.setBpm, (bpm) =>
        {
            bpmInput(bpm);
        });

        window.max.bindInlet(this.key.inlet.setSignatureDenominator, (signatureDenominator) =>
        {
            beatValueInput(signatureDenominator);
        });

        window.max.bindInlet(this.key.inlet.getUnixTime, () =>
        {
            this.out(this.key.currentUnixTime, Date.now().toString());
        });

        window.max.bindInlet(this.key.inlet.requestJackTripLatencyMeasurement, () =>
        {
            SOCKET.requestJackTripLatencyMeasurement();
        });

        window.max.bindInlet(this.key.inlet.requestEndJackTripLatencyMeasurement, () =>
        {
            SOCKET.requestEndJackTripLatencyMeasurement();
        });
    }
}

MAX.configureMaxInlets();

const UNIX_TRANSPORT =
{
    // UNIX TRANSPORT
    ATTEMPTING_TIMER_SYNC: null,
    TRANSPORT_INTERVAL: null,
    TRANSPORT_START_TARGET: 0,

    // TODO: eventually get rid of this, and handle all polling and sync from Max and server, only using
    //  using this to get the current value of Date.now() to compare against the [metro] object
    //  in Max
    sync(beatLengthMs, resetInterval = false)
    {
        if(!this.ATTEMPTING_TIMER_SYNC)
        {
            this.timeToNextUnixBeatToMax();
        }

        if(resetInterval)
        {
            if(this.ATTEMPTING_TIMER_SYNC)
            {
                clearInterval(this.ATTEMPTING_TIMER_SYNC);
            }

            if(this.TRANSPORT_INTERVAL)
            {
                clearInterval(this.TRANSPORT_INTERVAL);
            }

            this.TRANSPORT_START_TARGET = beatLengthMs - (Date.now() % beatLengthMs);
            this.ATTEMPTING_TIMER_SYNC = setInterval(this.tryStartUnixTransport, 1);
        }
    },

    tryStartUnixTransport(beatLengthMs)
    {
        if(Date.now() > this.TRANSPORT_START_TARGET)
        {
            this.sync(true);
        }

        if(Date.now() % beatLengthMs === 0)
        {
            clearInterval(this.ATTEMPTING_TIMER_SYNC);
            this.TRANSPORT_INTERVAL = setInterval(this.timeToNextUnixBeatToMax, beatLengthMs);
        }
    },

    timeToNextUnixBeatToMax(beatLengthMs)
    {
        MAX.out(MAX.key.timeToNextUnixBeat, beatLengthMs - (Date.now() % beatLengthMs));
    }
}

// SERVER
const SERVER_DATA =
{
    url:
    {
        main: "wss://dust-curved-bearskin.glitch.me",
        dev: "wss://navy-chiseled-bacon.glitch.me"
    },

    transportServer: null,
    get key() { return this.transportServer.key; },
    get transport() { return this.transportServer.transport; }
}

const SOCKET =
{
    _socket: null,
    _id: null,
    _serverRoundTripStart: 0,

    initialize(serverUrl)
    {
        this._socket = io(serverUrl);
        this.createConnectionListener();
        this.createServerDataListener();
        this.createDisconnectionListener();
    },

    createConnectionListener()
    {
        this._socket.on("connect", () =>
        {
            this.handleClientConnected();
        });
    },

    createDisconnectionListener()
    {
        this._socket.on("disconnect", () =>
        {
            this.emit(SERVER_DATA.key.removeClient, this._id);
        })
    },

    handleClientConnected()
    {
        DISPLAY.connected.hidden = false;
        DISPLAY.connecting.hidden = true;

        MAX.out(MAX.key.connectionStatus, 1);
    },

    createServerDataListener()
    {
        this._socket.on("initialize", serverData =>
        {
            this.getServerData(serverData);
            updateBeatLength();
            this.createListeners();
        });
    },

    getServerData(serverData)
    {
        this._id = serverData.clientId;

        let server = serverData.server;
        SERVER_DATA.transportServer = server;

        MAX.getServerKeys(server);

        this.setDisplays(server.clients);

        setBPM(SERVER_DATA.transport.bpm);
        setBeatValue(SERVER_DATA.transport.beatValue);
    },

    createListeners()
    {
        this._socket.on(SERVER_DATA.key.bpm, (value) =>
        {
            setBPM(value);
        });

        this._socket.on(SERVER_DATA.key.beatValue, (value) =>
        {
            setBeatValue(value);
        });

        this._socket.on(SERVER_DATA.key.startLatencyMeasurement, (clientId) =>
        {
            this.startLatencyMeasurement(clientId);
        });

        this._socket.on(SERVER_DATA.key.latencyMeasurementComplete, () =>
        {
            updateLatencyMeasurementStatus(0);
        });

        this._socket.on(SERVER_DATA.key.updateClientList, (clientList) =>
        {
            this.displayUserList(clientList);
        });

        this._socket.on(SERVER_DATA.key.currentUnixTime, (time) =>
        {
            this.handleCurrentServerUnixTime(time);
        });

        this._socket.on(SERVER_DATA.key.serverRoundTrip, (clientId) =>
        {
           this.finishServerRoundTrip(clientId);
        });
    },

    startLatencyMeasurement(clientId)
    {
        updateLatencyMeasurementStatus(1);

        if(clientId === this._id)
        {
            MAX.startLatencyMeasurement();
        }
    },

    setDisplays(clientList)
    {
        DISPLAY.nameDisplay = this._id;
        DISPLAY.nameDiv.hidden = false;

        this.displayUserList(clientList);
    },

    displayUserList(clientList)
    {
        let userListString = "";

        for(const [key, value] of Object.entries(clientList))
        {
            userListString += `${key} // `;
        }

        DISPLAY.userList = userListString;
    },

    requestJackTripLatencyMeasurement()
    {
        this.emit(SERVER_DATA.key.requestStartLatencyMeasurement, this._id);
    },

    requestEndJackTripLatencyMeasurement()
    {
        this.emit(SERVER_DATA.key.requestEndLatencyMeasurement, this._id);
    },

    requestServerRoundTrip()
    {
        this._serverRoundTripStart = performance.now();
        this.emit(SERVER_DATA.key.requestServerRoundTrip, this._id);
    },

    // TODO: what data to store on the server regarding roundtrips?
    //  Maybe the server should be sending out pings, measuring roundtrips,
    //  and sending times accordingly? (probably not)
    finishServerRoundTrip(clientId)
    {
        if(clientId !== this._id)
        {
            return;
        }

        let roundTripTime = performance.now() - this._serverRoundTripStart;

        DISPLAY.serverRoundTrip = roundTripTime.toString();
    },

    handleCurrentServerUnixTime(time)
    {
        DISPLAY.unixTime = time;

        // TODO: figure out the correct flow for this
        //  client send unix time requests, and handle the difference between
        //  the current Unix value and their measured roundtrip
        this.requestServerRoundTrip();
    },

    emit(key, value)
    {
        this._socket.emit(key, value)
    }
}

SOCKET.initialize(SERVER_DATA.url.dev);

// BPM
function bpmInput(bpm)
{
    setBPM(bpm);
    SOCKET.emit(SERVER_DATA.key.bpm, bpm);
}

function setBPM(value)
{
    DISPLAY.bpm = value;
    updateBeatLength();
}

// BEAT VALUE
function beatValueInput(beatValue)
{
    setBeatValue(beatValue);
    SOCKET.emit(SERVER_DATA.key.beatValue, beatValue);
}

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

// TODO: instead of Max.out(key, args) as above, just use a setter that does that
class MaxValue
{
    constructor()
    {
    }
}

