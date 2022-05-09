var Service, Characteristic;
var request = require("request");
var pollingtoevent = require('polling-to-event');


module.exports = function(homebridge)
{
	Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-domoticz-selector-switch", "DomoticzSelector", DomoticzSelector);
};


function DomoticzSelector(log, config)
{
	this.log = log;

	// Get config info
	this.name						 = config.name            || "Selector switch";
	this.domoticzURL     = config.domoticzURL;
	this.domoticzPort    = config.domoticzPort;
	this.deviceIDX       = config.deviceIDX;
	this.offValue			   = config.offValue        || 0;
	this.nightValue		   = config.nightValue      || 10;
	this.awayValue		   = config.awayValue       || 20;
	this.stayValue		   = config.stayValue       || 30;
	this.timeout         = config.timeout         || 2000;
	this.pollingInterval = config.pollingInterval || 5000;

  // Custom variables
  this.statusUrl      = this.domoticzURL + ":" + this.domoticzPort + "/json.htm?type=devices&rid=" + this.deviceIDX;
	this.baseCommandUrl = this.domoticzURL + ":" + this.domoticzPort + "/json.htm?type=command&param=switchlight&idx=" + this.deviceIDX + "&switchcmd=Set%20Level&level=";
	this.offUrl         = this.baseCommandUrl + this.offValue;
  this.nightUrl       = this.baseCommandUrl + this.nightValue;
	this.awayUrl        = this.baseCommandUrl + this.awayValue;
	this.stayUrl        = this.baseCommandUrl + this.stayValue;
	this.newStatus;

	var that = this;

	// Status Polling
	if (this.statusUrl)
	{
		var stateUrl = this.statusUrl;
		var statusemitter = pollingtoevent(function (done)
			{
				that.httpRequest(stateUrl, "", "GET", function (error, response, body)
				{
					if (error)
					{
						that.log('HTTP get status function failed: %s', error.message);
						try
						{
							done(new Error("Network failure that must not stop homebridge!"));
						} catch (err)
						{
							that.log(err.message);
						}
					}
					else
					{
						done(null, body);
					}
			})
		}, { interval: that.pollingInterval, eventName: "statuspoll" });


		statusemitter.on("statuspoll", function (responseBody)
		{
			var json = JSON.parse(responseBody);
			var status = eval("json.result[0].Level");

			if (status == that.stayValue)	{ that.newStatus = 0; }
			if (status == that.awayValue)	{ that.newStatus = 1; }
			if (status == that.nightValue)	{ that.newStatus = 2; }
			if (status == that.offValue)	{ that.newStatus = 3; }

			that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState).updateValue(that.newStatus);
			that.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState).updateValue(that.newStatus);

				/*if (status == that.offValue)
				{
					//that.log("State is currently: DISARMED");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.updateValue(3);
					that.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState)
					.updateValue(3);
				}

				if (status == that.nightValue)
				{
					//that.log("State is currently: NIGHT");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.updateValue(2);
					that.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState)
					.updateValue(2);
				}

				if (status == that.awayValue)
				{
					//that.log("State is currently: AWAY");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.updateValue(1);
					that.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState)
					.updateValue(1);
				}

				if (status == that.stayValue)
				{
					//that.log("State is currently: STAY");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.updateValue(0);
					that.securityService.getCharacteristic(Characteristic.SecuritySystemTargetState)
					.updateValue(0);
				}*/
		});
	}
}


DomoticzSelector.prototype =
{

httpRequest: function (url, body, method, callback)
{
	var callbackMethod = callback;

	request({
		url: url,
		body: body,
		method: method,
		timeout: this.timeout,
		rejectUnauthorized: false
		},

		function (error, response, responseBody)
		{
			if (callbackMethod)
			{
				callbackMethod(error, response, responseBody)
			}
			else
			{
				//this.log("callbackMethod not defined!");
			}
		})
},

getCurrentState: function(callback)
{
	var state;

	this.httpRequest(this.statusUrl, "", "GET", function (error, response, body)
	{
		if (error)
		{
			that.log("HTTP setTargetState function failed %s", error.message);
		}
		else
		{
			var json = JSON.parse(body);
			var status = eval("json.result[0].Level");

			if (status == this.stayValue)   { state = 0; }
			if (status == this.awayValue)   { state = 1; }
			if (status == this.nightValue)  { state = 2; }
			if (status == this.offValue) 		{ state = 3; }

			callback(error, state);
		}
	}.bind(this));
},


getTargetState: function(callback)
{
	var state;

	this.httpRequest(this.statusUrl, "", "GET", function (error, response, body)
	{
		if (error)
		{
			that.log("HTTP setTargetState function failed %s", error.message);
		}
		else
		{
			var json = JSON.parse(body);
			var status = eval("json.result[0].Level");

			if (status == this.stayValue)   { state = 0; }
			if (status == this.awayValue)   { state = 1; }
			if (status == this.nightValue)  { state = 2; }
			if (status == this.offValue) 		{ state = 3; }

			callback(error, state);
		}
	}.bind(this));
},


setTargetState: function(state, callback)
{
	var url = null;

	switch (state) {
		case Characteristic.SecuritySystemTargetState.DISARM:
			url = this.offUrl;
			break;
		case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
			url = this.nightUrl;
			break;
		case Characteristic.SecuritySystemTargetState.STAY_ARM:
				url = this.stayUrl;
				break;
		case Characteristic.SecuritySystemTargetState.AWAY_ARM:
			url = this.awayUrl;
			break;
	}

	this.httpRequest(url, "", "GET", function (error, response, body)
		{
			if (error)
			{
				this.log("HTTP setTargetState function failed %s", error.message);
			}
			else
			{
				callback(error, state);
				this.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
				.setValue(state);
			}
		}.bind(this))
},


getServices: function ()
{
	var that = this;

	this.informationService = new Service.AccessoryInformation();

  this.informationService
    .setCharacteristic(Characteristic.Manufacturer, 'Selector Switch')
    .setCharacteristic(Characteristic.Model, 'Security device')
    .setCharacteristic(Characteristic.SerialNumber, 'Domoticz IDX ' + this.deviceIDX)
		.setCharacteristic(Characteristic.FirmwareRevision, '1.0');

  this.securityService = new Service.SecuritySystem(this.name);

	this.securityService
		.getCharacteristic(Characteristic.SecuritySystemCurrentState)
		.on("get", this.getCurrentState.bind(this));

	this.securityService
		.getCharacteristic(Characteristic.SecuritySystemTargetState)
		.on("get", this.getTargetState.bind(this))
		.on("set", this.setTargetState.bind(this));

	 return [this.securityService, this.informationService];
}
};
