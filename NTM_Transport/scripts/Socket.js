/**
 * Manage Client<->Server exchanges
 */
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

	requestStartJackTripLatencyMeasurement()
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