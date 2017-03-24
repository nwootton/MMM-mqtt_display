/* Magic Mirror
 * Module: MMM-mqtt_display
 *
 * Original By Paul Langdon
 * This fork version by Nick Wootton
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var mqtt = require('mqtt');

module.exports = NodeHelper.create({
  start: function() {
    console.log('MMM-mqtt_display started ...');
  },

  getMqtt: function(payload) {
    var self = this;

    var client = mqtt.connect({ host: payload.mqttServer, port: payload.port, username: payload.user, password: payload.passwd });

    client.on('connect', function() {
      client.subscribe(payload.topic);
    });

    client.on('error', function(error) {
      console.log('*** MQTT JS ERROR ***: ' + error);
      self.sendSocketNotification('ERROR', {
        type: 'notification',
        title: 'MQTT Error',
        message: 'The MQTT Client has generated an error: ' + error
      });
    });

    client.on('offline', function() {
      console.log('*** MQTT Client Offline ***');
      self.sendSocketNotification('ERROR', {
        type: 'notification',
        title: 'MQTT Offline',
        message: 'MQTT Server is offline.'
      });
      client.end();
    });

    client.on('message', function(topic, message) {
      //console.log('topic: ' + topic + ', message: ' +message.toString() );
      self.sendSocketNotification('MQTT_DATA', {'topic':topic, 'data':message.toString()});
      // client.end();
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_SERVER') {
      this.getMqtt(payload);
    }
  }
});
