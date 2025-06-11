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
	get key() { return this.transportServer.key; },
	get transport() { return this.transportServer.transport; }
}