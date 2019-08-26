// This accessory surfaces a high electricity switch for Griddy subscribers
//
// The configuration is stored inside the ../config.json
// {
//     "accessory": "Griddy",
//     "name":     "Griddy",
//     ";oadZone" : "LZ_NORTH",
//     "highPriceThreshold" : "10.5",
//     "debug" : "True",      - Optional
// }
//

"use strict";

var Service, Characteristic, HomebridgeAPI, price;
const cheerio = require('cheerio');
const request = require('request');

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-griddy", "Griddy", Griddy);
}

function Griddy(log, config) {
  this.log = log;
  this.name = config.name;
  this.loadZone = config.loadZone;
  this.highPriceThreshold = parseFloat(config.highPriceThreshold);
  this.debug = config.debug || false;
  
  this.url = 'http://www.ercot.com/content/cdr/html/hb_lz';
  this._service = new Service.Switch(this.name);
  this.cacheDirectory = HomebridgeAPI.user.persistPath();
  this.storage = require('node-persist');
  this.storage.initSync({dir:this.cacheDirectory, forgiveParseErrors: true});
  
  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));
}

Griddy.prototype = {
	accessories: function(callback) {
		var that = this;
		Promise.all(requests).then(() +> {
			that.periodicUpdate();
			setInterval(that.periodicUpdate.bind(that), 300000);
		};
	};
};

Griddy.prototype.periodicUpdate = function(t) {
	var t = updateValue(this);
}

function updateValue(that) {
	if (that.debug) {
		that.log("Updating Griddy price for ", that.loadZone , ".");
	}
	request({uri: that.url,
        headers: {'user-agent': 'Validator.nu/LV http://validator.w3.org/services'}
	}, function(error, response, html) {
	        if(error) {
	                that.log("Error: " + error);
	        }
	        if (that.debug) {
	        	that.log("Status code: " + response.statusCode);
	        }
	        var $ = cheerio.load(html);

	        $('body div table.tableStyle tbody tr td.tdLeft').each(function(i, elem) {
	                if(i > 2){
	                        if($(this).text() === that.loadZone) {
	                                price = parseFloat((parseFloat($(this).next().text()) * 0.1).toFixed(3));
	                        }
	                }
	        });
	});

	if (price >= that.highPriceThreshold) {
		if (!that._service.getCharacteristic(Characteristic.On)){
			that._service.setCharacteristic(Characteristic.On, true);
		}
	} else {
		if (that._service.getCharacteristic(Characteristic.On)){
			that._service.setCharacteristic(Characteristic.On, false);
		}
	}
}

Griddy.prototype.getServices = function() {
  return [this._service];
}

Griddy.prototype._setOn = function(on, callback) {
  this.log("Turning high electricity switch " + on);
  callback();
}
