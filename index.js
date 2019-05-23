var Service, Characteristic;
var request = require("request");
var pollingtoevent = require('polling-to-event');


module.exports = function(homebridge)
{
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-security-domoticz", "HttpSecuritySystem", HttpSecuritySystem);
};


//Characteristic.SecuritySystemCurrentState.STAY_ARM = 0;
//Characteristic.SecuritySystemCurrentState.AWAY_ARM = 1;
//Characteristic.SecuritySystemCurrentState.NIGHT_ARM = 2;
//Characteristic.SecuritySystemCurrentState.DISARMED = 3;
//Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED = 4;


function HttpSecuritySystem(log, config)
{
	this.log = log;

	// Get config info
	this.name		= config["name"]		|| "HTTP Security System";

	this.disarmUrl          = config["disarmUrl"];
	this.awayUrl            = config["awayUrl"];
	this.stayUrl            = config["stayUrl"];
  	this.statusUrl          = config["statusUrl"];

  	this.httpMethod         = config["httpMethod"]   	|| "GET";
	this.timeout            = config["timeout"]             || 5000;
	this.pollingInterval    = config["pollingInterval"]   	|| 3000;

	this.disarmValue	= config["offValue"]		|| "0";
	this.awayValue		= config["onValue"]		|| "10";
	this.stayValue		= config["offValue"]		|| "20";


	//realtime polling info
	this.statusOn = false;
	var that = this;

	// Status Polling
	if (this.statusUrl)
	{
		var powerurl = this.statusUrl;
		var statusemitter = pollingtoevent(function (done)
			{
				that.httpRequest(this.statusUrl, "", this.httpMethod, function (error, response, body)
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
			if (that.disarmValue && that.awayValue && that.stayValue)
			{
				var json = JSON.parse(responseBody);
				var status = eval("json.result[0].level");
				
				if (status == that.disarmValue)
				{
					that.log("State is currently: DISARMED");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.setValue(3);
				}
				
				if (status == that.awayValue)
				{
					that.log("State is currently: AWAY");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.setValue(1);
				}
				
				if (status == that.stayValue)
				{
					that.log("State is currently: STAY");
					that.securityService.getCharacteristic(Characteristic.SecuritySystemCurrentState)
					.setValue(0);
				}
		}

	});
	}
}




HttpSecuritySystem.prototype =
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
	
setTargetState: function(state, callback)
{
	this.log("Setting state to %s", state);
	
	var url = null;
	var body;
	
	switch (state) {
		case Characteristic.SecuritySystemTargetState.DISARM:
			url = this.disarmUrl;
			break;
		case Characteristic.SecuritySystemTargetState.STAY_ARM:
			url = this.stayUrl;
			break;
		case Characteristic.SecuritySystemTargetState.NIGHT_ARM:
			url = this.stayUrl;
			break;
		case Characteristic.SecuritySystemTargetState.AWAY_ARM :
			url = this.awayUrl;
			break;
	}
	
	this.httpRequest(url, "", "GET", function (error, response, body)
		{
			if (error)
			{
				that.log("HTTP setTargetState function failed %s", error.message);
			}
		}.bind(this))
	
	this.log("HTTP setTargetState function succeeded!");
},

	
getServices: function ()
{
	var that = this;
	
    this.securityService = new Service.SecuritySystem(this.name);

	  this.securityService
			.getCharacteristic(Characteristic.SecuritySystemCurrentState)
			.on("get", function (callback) { callback(null, that.statusOn) })

	  this.securityService
			.getCharacteristic(Characteristic.SecuritySystemTargetState)
			//.on("get", this.getTargetState.bind(this))
			.on("set", this.setTargetState.bind(this));

	  return [this.securityService];
}
};
