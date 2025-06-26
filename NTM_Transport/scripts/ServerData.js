/**
 * Hold data from the server
 */
const SERVER_DATA =
{
	url:
	{
		main: "wss://dust-curved-bearskin.glitch.me",
		dev: "wss://navy-chiseled-bacon.glitch.me"
	},

	transportServer: null,
	get keys() { return this.transportServer.key; },
	get transportData() { return this.transportServer.transport; }
}