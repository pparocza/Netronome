/**
 * Handle display of HTML elements
 */
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

			serverTime: document.querySelector(".SERVER_TIME_DISPLAY"),
			predictedServerTime: document.querySelector(".PREDICTED_SERVER_TIME_DISPLAY"),
			predictionErrorTime: document.querySelector(".PREDICTION_ERROR_DISPLAY"),

			roundTripTime: document.querySelector(".ROUNDTRIP_TIME_DISPLAY"),
			upTime: document.querySelector(".UPTIME_DISPLAY"),
			downTime: document.querySelector(".DOWNTIME_DISPLAY"),

			latencyMeasurementStatus: document.querySelector(".LATENCY_MEASUREMENT_STATUS_DISPLAY"),
		},

	get connecting() { return this._element.connecting; },
	set connecting(value) { this.setInnerHtml(this._element.connecting, value); },

	get connected() { return this._element.connected; },
	set connected(value) { this.setInnerHtml(this._element.connected, value); },

	set latencyMeasurementStatus(value) { this._element.latencyMeasurementStatus.hidden = !value; },

	set bpm(value) { this.setInnerHtml(this._element.bpm, value); },
	set beatValue(value) { this.setInnerHtml(this._element.beatValue, value); },
	set beatLengthMs(value) { this.setInnerHtml(this._element.beatLengthMs, value); },

	set serverTime(value) { this.setInnerHtml(this._element.serverTime, value); },
	set predictedServerTime(value) { this.setInnerHtml(this._element.predictedServerTime, value); },
	set predictionErrorTime(value) { this.setInnerHtml(this._element.predictionErrorTime, value); },

	set roundTripTime(value) { this.setInnerHtml(this._element.roundTripTime, value); },
	set upTime(value) { this.setInnerHtml(this._element.upTime, value); },
	set downTime(value) { this.setInnerHtml(this._element.downTime, value); },

	get nameDiv() { return this._element.nameDiv; },
	set nameDisplay(value) { this.setInnerHtml(this._element.name, value); },

	set userList(value) { this.setInnerHtml(this._element.userList, value); },

	setInnerHtml(element, value)
	{
		element.innerHTML = value.toString();
	}
}