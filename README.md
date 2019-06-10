# homebridge-security-domoticz

[![npm](https://img.shields.io/npm/v/homebridge-security-domoticz.svg)](https://www.npmjs.com/package/homebridge-security-domoticz) [![npm](https://img.shields.io/npm/dt/homebridge-security-domoticz.svg)](https://www.npmjs.com/package/homebridge-security-domoticz)

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based security system to Apple's [HomeKit](http://www.apple.com/ios/home/) and allows you to control it via HTTP requests.

## Domoticz integration

This plugin only works with Domoticz and a selector switch.

This plugin does not use the security panel in Domoticz, but a selector swtich with 3 states (0, 10 and 20), where 0 is Off, 10 is Armed night and 20 is Armed away. Homekit uses 4 states (also Armed home), but I'm not using this. When chosing At home in the Home-app, this is translated to Armed night. With scripting in Domoticz I check if the alarm is armed when certain sensors are triggered and when it is armed a sirene goes off.

## Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-security-domoticz`
3. Update your `config.json` file

## Configuration

### Core
| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Must be `HttpSecuritySystem` | N/A |
| `name` | Name to appear in the Home app | N/A |
| `disarmUrl` | URL to disarm security system | N/A |
| `nightUrl` | URL to set security system to Armed night | N/A |
| `awayUrl` | URL to set security system to Armed away | N/A |
| `statusUrl` | URL to get the status of the security system | N/A |

### Optional fields
| Key | Description | Default |
| --- | --- | --- |
| `disarmValue` _(optional)_ | Value for disarm when status is checked | `0` |
| `nightValue` _(optional)_ | Value for armed night when status is checked | `10` |
| `awayValue` _(optional)_ | Value for armed away when status is checked | `20` |
| `pollingInterval` _(optional)_ | If `checkStatus` is set to `polling`, this is the time (in ms) betwwen status checks| `3000` |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `5000` |
| `model` _(optional)_ | Appears under the _Model_ field for the accessory | `homebridge-http-sprinkler` |
| `serial` _(optional)_ | Appears under the _Serial_ field for the accessory | `homebridge-http-sprinkler` |
| `manufacturer` _(optional)_ | Appears under the _Manufacturer_ field for the accessory | `goedh452` |

## Configuration Examples

#### Sample config:

 ```json
    "accessories": [
        {
                "accessory": "HttpSecuritySystem",
                "name": "Alarm",
                "disarmUrl": "http://192.168.1.114:8080/json.htm?type=command&param=switchlight&idx=1000&switchcmd=Set%20Level&level=0",
                "awayUrl": "http://192.168.1.114:8080/json.htm?type=command&param=switchlight&idx=1000&switchcmd=Set%20Level&level=20",
                "nightUrl": "http://192.168.1.114:8080/json.htm?type=command&param=switchlight&idx=1000&switchcmd=Set%20Level&level=10",
                "statusUrl": "http://192.168.1.114:8080/json.htm?type=devices&rid=1000",
                "timeout": 5000,
                "pollingInterval": 5000,
                "disarmValue": "0",
                "nightValue": "10",
                "awayValue": "20"
        }
]
```    
