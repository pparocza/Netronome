/**
 * Synchronize to Unix transport
 */
const UNIX_TRANSPORT =
{
	// UNIX TRANSPORT
	ATTEMPTING_TIMER_SYNC: null,
	TRANSPORT_INTERVAL: null,
	TRANSPORT_START_TARGET: 0,

	// TODO: eventually get rid of this, and handle all polling and sync from Max and server, only using
	//  using this to get the current value of Date.now() to compare against the [metro] object
	//  in Max
	sync(beatLengthMs, resetInterval = false)
	{
		if(!this.ATTEMPTING_TIMER_SYNC)
		{
			this.timeToNextUnixBeatToMax();
		}

		if(resetInterval)
		{
			if(this.ATTEMPTING_TIMER_SYNC)
			{
				clearInterval(this.ATTEMPTING_TIMER_SYNC);
			}

			if(this.TRANSPORT_INTERVAL)
			{
				clearInterval(this.TRANSPORT_INTERVAL);
			}

			this.TRANSPORT_START_TARGET = beatLengthMs - (Date.now() % beatLengthMs);
			this.ATTEMPTING_TIMER_SYNC = setInterval(this.tryStartUnixTransport, 1);
		}
	},

	tryStartUnixTransport(beatLengthMs)
	{
		if(Date.now() > this.TRANSPORT_START_TARGET)
		{
			this.sync(true);
		}

		if(Date.now() % beatLengthMs === 0)
		{
			clearInterval(this.ATTEMPTING_TIMER_SYNC);
			this.TRANSPORT_INTERVAL = setInterval(this.timeToNextUnixBeatToMax, beatLengthMs);
		}
	},

	timeToNextUnixBeatToMax(beatLengthMs)
	{
		MAX.out(MAX.key.timeToNextUnixBeat, beatLengthMs - (Date.now() % beatLengthMs));
	}
}
