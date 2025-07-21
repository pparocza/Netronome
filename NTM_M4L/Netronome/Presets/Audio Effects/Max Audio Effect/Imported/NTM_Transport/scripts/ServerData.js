/**
 * Hold data from the server
 */
const SERVER_DATA =
{
	url:
	{
		main: "wss://netronome-1.onrender.com",
		dev: "wss://netronome-dev.onrender.com",
		dev_paul: "https://netronome-transport-dev-paul.onrender.com",
		localhost: "localhost:3000"
	},

	transportServer: null,
	get keys() { return this.transportServer.key; },
	get transportData() { return this.transportServer.transport; }
}