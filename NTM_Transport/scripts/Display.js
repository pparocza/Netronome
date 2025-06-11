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