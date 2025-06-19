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
	_predictedServerTime: null,
	_previousPredictedServerTime: null,
	_previousPredictedUpTime: null,

	_realTimeErrorThreshold: 15,
	_calibrationErrorThreshold: 1,
	_calibrationNudgeThreshold: 25,
	_calibrationComplete: false,

	_checkPredictionIntervalDivision: 1,
	_checkCount: this._checkPredictionIntervalDivision,

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
			this.emit(SERVER_DATA.key.removeClient, this._id);
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

		setBPM(SERVER_DATA.transport.bpm);
		setBeatValue(SERVER_DATA.transport.beatValue);
		setBeatLength(SERVER_DATA.transport.beatLengthMs);

		this.requestCurrentTime();
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

		this._socket.on(SERVER_DATA.key.beatLengthMs, (value) =>
		{
			setBeatLength(value);
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

		this._socket.on(SERVER_DATA.key.currentTime, (clientId, serverTime) =>
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
		this.emit(SERVER_DATA.key.requestStartLatencyMeasurement, this._id);
	},

	requestEndJackTripLatencyMeasurement()
	{
		this.emit(SERVER_DATA.key.requestEndLatencyMeasurement, this._id);
	},

	requestCurrentTime()
	{
		this._serverRoundTripStart = performance.now();
		this.emit(SERVER_DATA.key.requestCurrentTime, this._id);
	},

	finishServerRoundTrip(serverTime)
	{
		let roundTripTime = performance.now() - this._serverRoundTripStart;

		this.predictServerTime(serverTime, roundTripTime);
	},

	predictServerTime(latestServerTime, latestRoundTripTime)
	{
		let predictionError = this._predictedServerTime - latestServerTime;
		let errorThreshold = this._calibrationComplete
			? this._realTimeErrorThreshold : this._calibrationErrorThreshold;

		if(Math.abs(predictionError) < errorThreshold)
		{
			this.handleAcceptablePrediction(latestServerTime, latestRoundTripTime, predictionError);
		}
		else
		{
			this._calibrationComplete = false;
			this._checkCount = this._checkPredictionIntervalDivision;

			this.attemptNewPrediction(latestRoundTripTime, predictionError, latestServerTime);
		}
	},

	handleAcceptablePrediction(latestServerTime, latestRoundTripTime, predictionError)
	{
		let checkInterval = SERVER_DATA.transport.beatLengthMs / this._checkPredictionIntervalDivision;
		// TODO: Should this be an average latest round trip, since it's possible that the next roundtrip
		//  will be longer?
		let timeToNextCheck = checkInterval - latestRoundTripTime;

		let upTimePrediction = this._previousPredictedUpTime - predictionError;

		this._previousPredictedServerTime = this._predictedServerTime;
		this._predictedServerTime = latestServerTime + timeToNextCheck + upTimePrediction;

		this._calibrationComplete = true;

		setTimeout(() =>
		{
			this.requestCurrentTime();
		}, timeToNextCheck);

		if(this._checkCount % this._checkPredictionIntervalDivision === 0)
		{
			this.updateTimeDisplays(latestServerTime, predictionError, latestRoundTripTime);
			this.updateUpDownDisplay(latestRoundTripTime, upTimePrediction);
			this._checkCount = 0;
		}

		this._previousPredictedUpTime = upTimePrediction;

		this._checkCount++;
	},

	attemptNewPrediction(latestRoundTripTime, predictionError, latestServerTime)
	{
		let upTimePrediction = 0;

		if(!this._previousPredictedUpTime)
		{
			// start by guessing the upTime is half of the round trip time
			upTimePrediction = latestRoundTripTime * 0.5;
		}
		else
		{
			if(Math.abs(predictionError) > this._calibrationNudgeThreshold)
			{
				upTimePrediction = this._previousPredictedUpTime - predictionError;
			}
			else
			{
				upTimePrediction = predictionError < 0 ?
					++this._previousPredictedUpTime : -- this._previousPredictedUpTime;
			}
		}

		this._previousPredictedServerTime = this._predictedServerTime;
		this._predictedServerTime = latestServerTime + upTimePrediction;

		this._previousPredictedUpTime = upTimePrediction;
		this._previousServerTime = latestServerTime;

		this.requestCurrentTime();
		this.updateTimeDisplays(latestServerTime, predictionError, latestRoundTripTime);
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