/**
 * Manage Client<->Server exchanges
 */
const SOCKET =
{
	_socket: null,
	_id: null,
	_serverKey: null,

	_beatLengthMs: 0,
	get beatLengthMs() { return this._beatLengthMs; },
	set beatLengthMs(value) { this._beatLengthMs = value; },

	// TODO: underscores to all private methods
	initialize(serverUrl)
	{
		this._socket = io(serverUrl);
		this.createConnectionListener();
		MAX.initializeJweb(serverUrl);
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

		MAX.connectionStatus = true;

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

		this.requestCurrentServerTime();
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

			this.handleReceivedServerTime(serverTime);
		});


		this._socket.on(SERVER_DATA.keys.beatValidation, (clientId, serverTime) =>
		{
			if(clientId !== this._id)
			{
				return;
			}

			this.handleReceivedBeatValidation(serverTime);
		});
	},

	setServerBpm(bpm)
	{
		this.emit(SERVER_DATA.keys.bpm, bpm);
	},

	setServerBeatValue(beatValue)
	{
		this.emit(SERVER_DATA.keys.beatValue, beatValue);
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

	requestCurrentServerTime()
	{
		this.emit(SERVER_DATA.keys.requestCurrentTime, this._id);
	},

	handleReceivedServerTime(latestServerTime)
	{
		MAX.handleReceivedServerTime(latestServerTime);
	},

	requestBeatValidation()
	{
		this.emit(SERVER_DATA.keys.requestBeatValidation, this._id);
	},

	handleReceivedBeatValidation(latestServerTime)
	{
		MAX.handleReceivedBeatValidation(latestServerTime);
	},

	emit(key, ...values)
	{
		this._socket.emit(key, ...values)
	}
}