/* global Module */

/* Magic Mirror
 * Module: MMM-mqtt_display
 *
 * Original By Paul Langdon
 * This fork version by Nick Wootton
 * MIT Licensed.
 */

Module.register('MMM-mqtt_display', {

  defaults: {
    mqttServer: 'mqtt://test.mosquitto.org',
    port: 1883,
    loadingText: 'Loading MQTT Data...',
    topic: '',
    user: '',
    passwd: '',
    showTitle: false,
    title: 'MQTT Data',
    interval: 300000,
    postText: ''
  },

	// Define required scripts.
	getStyles: function() {
		return ["mqtt.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.mqttVal = '';
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer, port: self.config.port, user: self.config.user, passwd: self.config.passwd, topic: self.config.topic });
    setTimeout(self.updateMqtt, self.config.interval, self);
  },

  getDom: function() {
    var wrapper = document.createElement('div');

    if (!this.loaded) {
      wrapper.innerHTML = this.config.loadingText;
      return wrapper;
    }

    if (this.config.showTitle) {
      var titleDiv = document.createElement('div');
      titleDiv.innerHTML = this.config.title;
      wrapper.appendChild(titleDiv);
    }

    var mqttDiv = document.createElement('div');

    var table = document.createElement("table");
    table.className = "small";

    for (var m in this.mqttMessages) {
      var message = this.mqttMessages[m];

      var row = document.createElement("tr");
      table.appendChild(row);

      var topicCell = document.createElement("td");
      topicCell.className = "topic";
      topicCell.innerHTML = message.title;
      row.appendChild(topicCell);

      var messageCell = document.createElement("td");
      messageCell.className = "message";
      messageCell.innerHTML = message.message;
      row.appendChild(messageCell);
    }

    mqttDiv.appendChild(table);

    wrapper.appendChild(mqttDiv);

    return wrapper;
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA') {
      this.mqttMessages = [];

      arrTopic = payload.topic.split('/');
      thisShortTitle = arrTopic[arrTopic.length-2] + '\\' + arrTopic[arrTopic.length-1];

      this.mqttMessages.push(
        {
          title: thisShortTitle.toString(),
          message: payload.data.toString()
        }
      );

      this.loaded = true;
      this.updateDom();
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  }

});
