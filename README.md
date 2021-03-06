## Work In Progress - YMMV ##

# MMM-mqtt_display
[MagicMirror²](https://github.com/MichMich/MagicMirror) Module that displays contents of a MQTT message

Please note - I no longer run a MagicMirror, so this module is no-longer in progress. Feel free to fork the original and update as necessary.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/nwootton/MMM-mqtt_display`. A new folder will appear, likely called `MMM-mqtt_display`.  Navigate into it.
2. Execute `npm install` to install the node dependencies.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-mqtt_display',
		position: 'top_right',	// This can be any of the regions. Best results in left or right regions.
		header: 'MQTT Feed', // This is optional
		config: {
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuration options

The following options can be configured:

| Option  | Description  |
|---|---|
| `mqttServer`  | Connection string for the server to connect to (`mqtt://localhost`)  |
| `port`  | Port to use to connect to the MQTT Server. Defaults to 1883.  |
| `loadingText`  | Text to display while waiting for data to load  |
| `topic`  | MQTT Topic to subscribe to on the server (`this/topic/to/display`)  |
| `user`  | If required the username of the secured MQTT server  |
| `passwd`  | If required the password of the secured MQTT server  |
| `showTitle`  | Boolean to show/hide a title (default: `false`)  |
| `title`  | Title to show if `showTitle` is `true`  |
| `interval`  | Refresh interval, not including MQTT subscription deliveries. (default: `300000`)  |
| `postText`  | Text to append after the data received from MQTT (default: `''`)  |


## Dependencies
- [mqtt](https://www.npmjs.com/package/mqtt) (installed via `npm install`)
