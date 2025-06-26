/**
 * Hold data from the server
 */
const SERVER_DATA =
{
	url:
	{
		main: "wss://netronome.onrender.com",
		dev: "wss://netronome.onrender.com"
	},

	transportServer: null,
	get keys() { return this.transportServer.key; },
	get transportData() { return this.transportServer.transport; }
}