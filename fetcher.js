/* Magic Mirror
 * MQTT Fetcher
 *
 * By Nick Wootton
 * MIT Licensed.
 */

var mqtt = require("mqtt");
var request = require("request");
var iconv = require("iconv-lite");

/* Fetcher
 * Responsible for handling an update and broadcasting the data.
 *
 * attribute url string - URL of the mqtt broker.
 * attribute port integer - port of the mqtt broker.
 * attribute topic string - topic to watch
 * attribute user string - username for mqtt broker access
 * attribute passwd string - password for mqtt broker access
 */

var Fetcher = function(url, port, topic, user, passwd) {
	var self = this;
	var reloadInterval = 1000;

	var reloadTimer = null;
	var items = [];

	var fetchFailedCallback = function() {};
	var itemsReceivedCallback = function() {};

	/* private methods */

    var client = mqtt.connect({ host: url, port: port, username: user, password: passwd });

    client.on('connect', function() {
      client.subscribe(topic);
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

        var topic = topic;
        var message = message.toString();

        arrTopic = topic.split('/');
        var shortTopic = arrTopic[arrTopic.length-2] + '\\' + arrTopic[arrTopic.length-1];

        if (topic && message) {
            items.push({
                topic: topic,
                message: message,
                shortTopic: shortTopic
            })
        }
        else {
            // console.log("Can't parse topic message:");
            // console.log('Topic: ' + topic);
            // console.log('Message: ' + message);
        }
      // client.end();
    });




	/* fetchFeed()
	 * Request the new items.
	 */

	var fetchFeed = function() {
		clearTimeout(reloadTimer);
		reloadTimer = null;
		items = [];

		var parser = new FeedMe();

		parser.on("item", function(item) {

			var title = item.title;
			var description = item.description || item.summary || item.content || "";
			var pubdate = item.pubdate || item.published || item.updated;
			var url = item.url || item.link || "";

			if (title && pubdate) {

				var regex = /(<([^>]+)>)/ig;
				description = description.replace(regex, "");

				items.push({
					title: title,
					description: description,
					pubdate: pubdate,
					url: url,
				});

			} else {

				// console.log("Can't parse feed item:");
				// console.log(item);
				// console.log('Title: ' + title);
				// console.log('Description: ' + description);
				// console.log('Pubdate: ' + pubdate);

			}
		});

		parser.on("end", function() {
			self.broadcastItems();
			scheduleTimer();
		});

		parser.on("error", function(error) {
			fetchFailedCallback(self, error);
			scheduleTimer();
		});


		nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		headers =  {"User-Agent": "Mozilla/5.0 (Node.js "+ nodeVersion + ") MagicMirror/"  + global.version +  " (https://github.com/MichMich/MagicMirror/)"}

		request({uri: url, encoding: null, headers: headers})
			.on("error", function(error) {
				fetchFailedCallback(self, error);
				scheduleTimer();
			})
			.pipe(iconv.decodeStream(encoding)).pipe(parser);

	};

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */

	var scheduleTimer = function() {
		//console.log('Schedule update timer.');
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function() {
			fetchNews();
		}, reloadInterval);
	};

	/* public methods */

	/* setReloadInterval()
	 * Update the reload interval, but only if we need to increase the speed.
	 *
	 * attribute interval number - Interval for the update in milliseconds.
	 */
	this.setReloadInterval = function(interval) {
		if (interval > 1000 && interval < reloadInterval) {
			reloadInterval = interval;
		}
	};

	/* startFetch()
	 * Initiate fetchNews();
	 */
	this.startFetch = function() {
		fetchNews();
	};

	/* broadcastItems()
	 * Broadcast the existing items.
	 */
	this.broadcastItems = function() {
		if (items.length <= 0) {
			//console.log('No items to broadcast yet.');
			return;
		}
		//console.log('Broadcasting ' + items.length + ' items.');
		itemsReceivedCallback(self);
	};

	this.onReceive = function(callback) {
		itemsReceivedCallback = callback;
	};

	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	this.url = function() {
		return url;
	};

	this.items = function() {
		return items;
	};
};

module.exports = Fetcher;
