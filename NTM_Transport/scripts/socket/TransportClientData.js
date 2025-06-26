import { TransportServerData } from "./TransportServerData.js";

export class TransportClientData
{
	constructor()
	{
		this._id = Math.round(Math.random() * 1000000);
		this._name = "Transport Client #" + TransportServerData.nClients.toString();
	}

	get id() { return this._id; }

	get name() { return this._name; }
	set name(value) { this._name = value; }
}