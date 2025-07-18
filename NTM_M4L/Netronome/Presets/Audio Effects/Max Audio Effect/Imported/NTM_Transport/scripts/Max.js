/**
 * Handle Max i/0
 */
const MAX =
{
	_socket: null,

	key:
	{
		beatLengthMs: "beatLengthMs",
		connectionStatus: "connection_status",

		// initialized from Transport Server
		bpm: null,
		beatValue: null,
		startLatencyMeasurement: null,

		latestServerTime: "latest_server_time",
		beatValidation: "beat_validation",

		inlet:
		{
			setBpm: "set_bpm",
			setSignatureDenominator: "set_signature_denominator",
			requestCurrentServerTime: "request_current_server_time",
			requestBeatValidation: "request_beat_validation",
			requestStartJackTripLatencyMeasurement: "request_start_jacktrip_latency_measurement",
			requestEndJackTripLatencyMeasurement: "request_end_jacktrip_latency_measurement"
		}
	},

	getServerKeys(transportServer)
	{
		this.key.bpm = transportServer.key.bpm;
		this.key.beatValue = transportServer.key.beatValue;
		this.key.startLatencyMeasurement = transportServer.key.startLatencyMeasurement;
	},

	_connectionStatus: false,
	get connectionStatus() { return this._connectionStatus; },
	set connectionStatus(isConnected)
	{
		let isConnectedInt = isConnected ? 1 : 0;

		this.out(MAX.key.connectionStatus, isConnectedInt);
	},

	// TODO: consolidate all this into a single "MaxValue" class
	_bpm: 0,
	set bpm(value)
	{
		this._bpm = value;
		this.out(this.key.bpm, this._bpm);
	},

	out(key, ...args)
	{
		if(!window.max)
		{
			return;
		}

		window.max.outlet(key, ...args);
	},

	startLatencyMeasurement()
	{
		this.out(this.key.startLatencyMeasurement, 1);
	},

	bpmInput(bpm)
	{
		setBPM(bpm);
		SOCKET.setServerBpm(bpm);
	},

	beatValueInput(beatValue)
	{
		setBeatValue(beatValue);
		SOCKET.setServerBeatValue(beatValue);
	},

	handleReceivedServerTime(latestServerTime)
	{
		let latestServerTimeString = latestServerTime.toString();

		this.out(this.key.latestServerTime, latestServerTimeString);
	},

	handleReceivedBeatValidation(latestServerTime)
	{
		let latestServerTimeString = latestServerTime.toString();

		this.out(this.key.beatValidation, latestServerTimeString, this._previousServerTimePrediction);
	},

	requestCurrentServerTime()
	{
		SOCKET.requestCurrentServerTime();
	},

	requestBeatValidation()
	{
		SOCKET.requestBeatValidation();
	},

	requestStartJackTripLatencyMeasurement()
	{
		SOCKET.requestStartJackTripLatencyMeasurement();
	},

	requestEndJackTripLatencyMeasurement()
	{
		SOCKET.requestEndJackTripLatencyMeasurement();
	},

	configureMaxInlets()
	{
		if(!window.max)
		{
			return;
		}

		window.max.bindInlet(this.key.inlet.setBpm, (bpm) =>
		{
			this.bpmInput(bpm);
		});

		window.max.bindInlet(this.key.inlet.setSignatureDenominator, (signatureDenominator) =>
		{
			this.beatValueInput(signatureDenominator);
		});

		window.max.bindInlet(this.key.inlet.requestCurrentServerTime, () =>
		{
			this.requestCurrentServerTime();
		});

		window.max.bindInlet(this.key.inlet.requestBeatValidation, (serverTimePrediction) =>
		{
			this.requestBeatValidation();
			this._previousServerTimePrediction = serverTimePrediction;
		});

		window.max.bindInlet(this.key.inlet.requestStartJackTripLatencyMeasurement, () =>
		{
			this.requestStartJackTripLatencyMeasurement();
		});

		window.max.bindInlet(this.key.inlet.requestEndJackTripLatencyMeasurement, () =>
		{
			this.requestEndJackTripLatencyMeasurement();
		});
	}
}

// TODO: instead of Max.out(key, args) as above, just use a setter that does that
class MaxValue
{
	constructor()
	{
	}
}