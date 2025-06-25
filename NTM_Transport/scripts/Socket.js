/**
 * Manage Client<->Server exchanges
 */
const SOCKET =
{
	_socket: null,
	_id: null,
	_serverKey: null,
	_serverRoundTripStart: 0,

	_previousServerTime: null,
	// What time it will be on the server when a time request reaches the server
	_serverTimePrediction: null,
	_previousServerTimePrediction: null,
	_previousUpTimePrediction: null,

	// TODO: Target time is a factor of the beat length (you can be running predictions in the background,
	// 	and then have the target time be it's own layer, so that it can be independent of error checking,
	//  though you can still display a target error so there's a sense of how close the your clients transport
	//  "predictions" are to the actual target

	// TODO: predictions happen in the background, with a separate system handling beat synchronization by outputting
	//  pulses based on predictions -> since multiple predictions can happen within a single beat, the most accurate
	//  prediction before a given beat will be prioritized
	//
	//  TODO: based on this though, you actually do always know how wrong the prediction was, so the beat can just
	//  	output based on the most recent prediction before the given beat factor?
	_targetTime: 0,

	_realTimeErrorThreshold: 15,
	_errorAdjustmentThreshold: 10,
	_calibrationErrorThreshold: 1,
	_calibrationNudgeThreshold: 25,
	_calibrationComplete: false,

	_checkPredictionIntervalDivision: 1,
	_checkCount: this._checkPredictionIntervalDivision,

	_beatLengthMs: 0,
	get beatLengthMs() { return this._beatLengthMs; },
	set beatLengthMs(value) { this._beatLengthMs = value; },

	// TODO: underscores to all private methods
	initialize(serverUrl)
	{
		this._socket = io(serverUrl);
		this.createConnectionListener();
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
			this.emit(SERVER_DATA.keys.removeClient, this._id);
		})
	},

	handleClientConnected()
	{
		DISPLAY.connected.hidden = false;
		DISPLAY.connecting.hidden = true;

		MAX.out(MAX.key.connectionStatus, 1);

		this.createServerDataListener();
		this.createDisconnectionListener();
	},

	createServerDataListener()
	{
		this._socket.on("initialize", serverData =>
		{
			this.getServerData(serverData);
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

		setBPM(SERVER_DATA.transportData.bpm);
		setBeatValue(SERVER_DATA.transportData.beatValue);
		setBeatLength(SERVER_DATA.transportData.beatLengthMs);

		this.requestCurrentTime();
	},

	createListeners()
	{
		this._socket.on(SERVER_DATA.keys.bpm, (value) =>
		{
			setBPM(value);
		});

		this._socket.on(SERVER_DATA.keys.beatValue, (value) =>
		{
			setBeatValue(value);
		});

		this._socket.on(SERVER_DATA.keys.beatLengthMs, (value) =>
		{
			setBeatLength(value);
		});

		this._socket.on(SERVER_DATA.keys.startLatencyMeasurement, (clientId) =>
		{
			this.startLatencyMeasurement(clientId);
		});

		this._socket.on(SERVER_DATA.keys.latencyMeasurementComplete, () =>
		{
			updateLatencyMeasurementStatus(0);
		});

		this._socket.on(SERVER_DATA.keys.updateClientList, (clientList) =>
		{
			this.displayUserList(clientList);
		});

		this._socket.on(SERVER_DATA.keys.currentTime, (clientId, serverTime) =>
		{
			if(clientId !== this._id)
			{
				return;
			}

			this.finishServerRoundTrip(serverTime);
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

	requestStartJackTripLatencyMeasurement()
	{
		this.emit(SERVER_DATA.keys.requestStartLatencyMeasurement, this._id);
	},

	requestEndJackTripLatencyMeasurement()
	{
		this.emit(SERVER_DATA.keys.requestEndLatencyMeasurement, this._id);
	},

	requestCurrentTime()
	{
		this._serverRoundTripStart = performance.now();
		this.emit(SERVER_DATA.keys.requestCurrentTime, this._id);
	},

	finishServerRoundTrip(latestServerTime)
	{
		// latestServerTime = most recent time received from the server
		// latestRoundTripTime = time since last .requestCurrentTime()
		this.predictServerTime
		(
			latestServerTime,
			performance.now() - this._serverRoundTripStart
		);
	},

	predictServerTime(latestServerTime, latestRoundTripTime)
	{
		// error of the *previous* upTime prediction
		let predictionError = this._serverTimePrediction - latestServerTime;

		let errorThreshold = this._calibrationComplete
			? this._realTimeErrorThreshold : this._calibrationErrorThreshold;

		if(Math.abs(predictionError) < errorThreshold)
		{
			this._calibrationComplete = true;
			this.handleAcceptablePrediction(latestServerTime, latestRoundTripTime, predictionError);
		}
		else
		{
			this._calibrationComplete = false;
			this._checkCount = this._checkPredictionIntervalDivision;

			this.attemptNewPrediction(latestServerTime, latestRoundTripTime, predictionError);
		}
	},

	handleAcceptablePrediction(latestServerTime, latestRoundTripTime, predictionError)
	{
		MAX.handleBeat(latestServerTime, this._serverTimePrediction, predictionError);

		let checkInterval = this._beatLengthMs / this._checkPredictionIntervalDivision;
		// TODO: Should this be an average latest round trip, since it's possible that the next roundtrip
		//  will be longer?
		let timeToNextCheck = checkInterval - latestRoundTripTime;
		TIME_AT_LAST_ACCEPTABLE_COMPLETION = null;
		TIME_TO_NEXT_CHECK = timeToNextCheck;

		// TODO: This is a bit better, but you're still getting ups that are greater than round trips
		requestAnimationFrame(COUNTDOWN_TO_NEXT_TIME_REQUEST);

		// new upTimePrediction compensates for the previous prediction error only if greater than a threshold
		let predictionAdjustment = Math.abs(predictionError) > this._errorAdjustmentThreshold ?
			predictionError : 0;

		let upTimePrediction = this._previousUpTimePrediction - predictionAdjustment;

		this._previousServerTimePrediction = this._serverTimePrediction;
		this._serverTimePrediction = latestServerTime + timeToNextCheck + upTimePrediction;

		if(this._checkCount % this._checkPredictionIntervalDivision === 0)
		{
			this.updateTimeDisplays(latestServerTime, latestRoundTripTime, this._previousServerTimePrediction);
			this.updateUpDownDisplay(this._previousUpTimePrediction, predictionError);
			this._checkCount = 0;
		}

		this._previousUpTimePrediction = upTimePrediction;

		this._checkCount++;
	},

	/**
	 * Guess what time it is on the server until you get close enough
	 * @param latestServerTime most recently received performance.now() value from the server
	 * @param latestRoundTripTime difference between local performance.now() values before and after time request
	 * @param predictionError (this._serverTimePrediction - latestServerTime)
	 */
	attemptNewPrediction(latestServerTime, latestRoundTripTime, predictionError)
	{
		let upTimePrediction = 0;

		if(!this._previousUpTimePrediction)
		{
			// start by guessing the upTime is the round trip time
			upTimePrediction = latestRoundTripTime;
		}
		else
		{
			if(Math.abs(predictionError) > this._calibrationNudgeThreshold)
			{
				upTimePrediction = this._previousUpTimePrediction - predictionError;
			}
			else
			{
				upTimePrediction = predictionError < 0 ?
					++this._previousUpTimePrediction : -- this._previousUpTimePrediction;
			}
		}

		this._previousServerTimePrediction = this._serverTimePrediction;
		// TODO: This is not quite right considering that at this point the latest server time is now in the past?
		//  this should actually be the latestServerTime + previousDownTimePrediction + upTimePrediction
		this._serverTimePrediction = latestServerTime + upTimePrediction;

		this._previousUpTimePrediction = upTimePrediction;
		this._previousServerTime = latestServerTime;

		this.requestCurrentTime();

		this.updateTimeDisplays(latestServerTime, latestRoundTripTime, this._previousServerTimePrediction);
	},

	updateTimeDisplays(latestServerTime, latestRoundTripTime, previousPredictedServerTime)
	{
		DISPLAY.updateTimeDisplays(latestServerTime, previousPredictedServerTime, latestRoundTripTime);
	},

	updateUpDownDisplay(previousUpTimePrediction, predictionError)
	{
		let measuredUpTime = previousUpTimePrediction - predictionError;
		DISPLAY.updateUpDownDisplay(measuredUpTime);
	},

	emit(key, value)
	{
		this._socket.emit(key, value)
	}
}

// TODO: Can you do this with a webworker, or are you gonna get screwed by M4L?
let TIME_AT_LAST_ACCEPTABLE_COMPLETION = null;
let TIME_TO_NEXT_CHECK = null;

const COUNTDOWN_TO_NEXT_TIME_REQUEST = (timestamp) =>
{
	if(!TIME_AT_LAST_ACCEPTABLE_COMPLETION)
	{
		TIME_AT_LAST_ACCEPTABLE_COMPLETION = timestamp;
	}

	const elapsed = timestamp - TIME_AT_LAST_ACCEPTABLE_COMPLETION;

	if(elapsed >= TIME_TO_NEXT_CHECK)
	{
		SOCKET.requestCurrentTime();
	}
	else
	{
		requestAnimationFrame(COUNTDOWN_TO_NEXT_TIME_REQUEST);
	}
}