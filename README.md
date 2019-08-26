# homebridge-griddy

[![NPM Downloads](https://img.shields.io/npm/dm/homebridge-dht.svg?style=flat)](https://npmjs.org/package/homebridge-griddy)

This is a plugin for surfacing a switch that is used with ERCOT pricing, specifically for Griddy users.
The switch flips once electricity cost per kWh for a specified hub or load zone crosses a set threshold and turns off once it drops below.
It is a partially-working implementation into HomeKit. This plugin is work in progress. Help is appreciated!

# Installation

1. Install homebridge using: npm install -g homebridge <br>
2. Install this plugin using npm install -g homebridge-griddy
3. Update your configuration file. See sample-config below for a sample.

# Configuration Sample

```
"accessories": [
 {
     "accessory": "Griddy",
     "name":     "Griddy",
     "loadZone" : "LZ_NORTH",
     "highPriceThreshold" : "10.5",
     "debug" : "True",      - Optional
 },
    ]
```

- accessory: Griddy
- name: can be anything you want
- loadZone: must be a hub or loadzone listed on http://www.ercot.com/content/cdr/html/hb_lz
- highPriceThreshold: price in cents to however many decimal places you want to flip the switch at
- debug: optional parameter, will add more data in to the homebridge console, useful for debugging no response errors.

# Roadmap



# Notes



# Credits

