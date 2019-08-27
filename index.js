// This accessory surfaces a high electricity switch for Griddy subscribers
//
// The configuration is stored inside the ../config.json
// {
//     "accessory" : "Griddy",
//     "name" : "Griddy",
//     "loadZone" : "LZ_NORTH",
//     "highPriceThreshold" : "10.5",
//     "debug" : "True"      - Optional
// }
//

"use strict";

var Service, Characteristic, HomebridgeAPI;
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

	this._service.getCharacteristic(Characteristic.On)
	.on('set', this._setOn.bind(this));
		this.periodicUpdate();
		var now = new Date();
		var currentMinute = now.getMinutes();
		var currentSecond = now.getSeconds();
		for (var i = 0; i <= 11; i++) {
				if ((currentMinute >= i * 5) && (currentMinute < (i+1) * 5)) {
						var waitTime = (((((i + 1) * 5) - currentMinute - 1) * 60) + (60 - currentSecond) + 30)*1000;
						setTimeout(function (that) {
								that.periodicUpdate();
								setInterval(that.periodicUpdate.bind(that), 300000);
						}, waitTime, this);
						break;
				}
		}
	}

Griddy.prototype = {
}

Griddy.prototype.periodicUpdate = function(t) {
	var t = updateValue(this);
}

function updateValue(that, callback) {
        if (that.debug) {
                that.log("Updating Griddy price for ", that.loadZone , ".");
        }
        var price;
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
                                        if (that.debug) {
                                                that.log("Current price is " + price + " cents per kWh.");
                                        }
                                }
                        }                                                                                                                                                                                                                                    });                                                                                                                                                                                                                                          if (price >= that.highPriceThreshold) {
                        if (!that._service.getCharacteristic(Characteristic.On).value){
                                that._service.setCharacteristic(Characteristic.On, true);
                        }
                } else {
                        if (that._service.getCharacteristic(Characteristic.On).value){
                                that._service.setCharacteristic(Characteristic.On, false);
                        }
                }
        });
}

Griddy.prototype.getServices = function() {
  return [this._service];
}

Griddy.prototype._setOn = function(on, callback) {
  this.log("Setting high electricity switch to " + on);
  callback();
}
