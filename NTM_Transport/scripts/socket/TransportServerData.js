let BPM = 120;
let BEAT_VALUE = 4;
let LATENCY_MEASUREMENT_STATUS = false;
let LATENCY_MEASUREMENT_CLIENT_ID = null;

export const TransportServerData =
{
	transport:
		{
			set bpm(value) { BPM = value; },
			get bpm() { return BPM; },

			set beatValue(value) { BEAT_VALUE = value; },
			get beatValue() { return BEAT_VALUE; },

			get beatLengthMs() { return 240000 / (BPM * BEAT_VALUE); },

			set latencyMeasurementStatus(value) { LATENCY_MEASUREMENT_STATUS = value; },
			get latencyMeasurementStatus() { return LATENCY_MEASUREMENT_STATUS; },

			set latencyMeasurementClientId(value) { LATENCY_MEASUREMENT_CLIENT_ID = value; },
			get latencyMeasurementClientId() { return LATENCY_MEASUREMENT_CLIENT_ID; }
		},

	key:
		{
			bpm: "bpm",
			beatValue: "beatValue",
			beatLengthMs: "beatLengthMs",

			requestCurrentTime: "requestCurrentTime",
			currentTime: "curentTime",

			requestStartLatencyMeasurement: "requestStartLatencyMeasurement",
			startLatencyMeasurement: "startLatencyMeasurement",
			requestEndLatencyMeasurement: "requestEndLatencyMeasurement",
			latencyMeasurementComplete: "latencyMeasurementComplete",

			updateClientList: "updateClientList",
			removeClient: "removeClient"
		},

	clients:{},

	addClient(transportClient)
	{
		this.clients[transportClient.id.toString()] = transportClient;
	},

	removeClient(transportClientId)
	{
		delete this.clients[transportClientId];
	},

	nClients() { return Object.keys(this.clients).length; }
}