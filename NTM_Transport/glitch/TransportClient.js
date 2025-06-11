import { TransportServer } from "./TransportServer.js";

export class TransportClient
{
	constructor()
	{
		this._id = Math.round(Math.random() * 1000000);
		this._name = "Transport Client #" + TransportServer.nClients.toString();
	}

	get id() { return this._id; }

	get name() { return this._name; }
	set name(value) { this._name = value; }
}