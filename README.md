# homebridge-domoticz-selector-switch

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based system to Apple's [HomeKit](http://www.apple.com/ios/home/) and allows you to control a selector switch via HTTP requests. The device is displayed as a security service to be able to set if you are at home, away, etcetera.

## Domoticz integration

This plugin only works with Domoticz and a selector switch. This plugin uses a selector switch with 4 states.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)

The plugin is compatible with the Homebridge UI

**Manual installation** 
1. Install this plugin: `npm install -g homebridge-domoticz-selector-switch`
2. Update your `config.json` file

## Configuration

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `DomoticzSelector` | N/A |
| `name` | Name to appear in the Home app | Selector |
| `domoticzURL` | URL to Domoticz (eg. http://192.168.1.114) | N/A |
| `domoticzPort` | port Domoticz is listening on (eg. 8080) | N/A |
| `deviceIDX` | device idx of the selector switch | N/A | 

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `offValue` _(optional)_ | Value for disarm when status is checked | `0` |
| `nightValue` _(optional)_ | Value for armed night when status is checked | `10` |
| `awayValue` _(optional)_ | Value for armed away when status is checked | `20` |
| `stayValue` _(optional)_ | Value for armed home when status is checked | `30` |
| `pollingInterval` _(optional)_ | If `checkStatus` is set to `polling`, this is the time (in ms) betwwen status checks| `3000` |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `5000` |

## Configuration Examples

#### Sample config:

 ```json
    "accessories": [
        {
                "accessory": "DomoticzSelector",
                "name": "Selector",
                "domoticzURL": "http://192.168.1.114",
                "domoticzPort": 8080,
                "deviceIDX": 1000,
                "timeout": 5000,
                "pollingInterval": 5000,
                "offValue": 0,
                "nightValue": 10,
                "awayValue": 20,
                "stayValue": 30
        }
]
```    
