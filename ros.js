module.exports = function (RED) {
	var RosSubscribeNode = require('./ros-subscribe-node')(RED);
	var RosPublishNode = require('./ros-publish-node')(RED);
	var RosServiceCallNode = require('./ros-call-service-node')(RED);
	var RosServiceAdvNode = require('./ros-adv-service-node')(RED);
	var RosServiceRepsNode = require('./ros-resp-service-node')(RED);
	var RosServerNode = require('./ros-server-node')(RED);
	var RosActionClientNode = require('./ros-action-client-node')(RED);
	var rosTypesConfig = require('./ros-types-config');

	RED.nodes.registerType("ros-subscribe", RosSubscribeNode);
	RED.nodes.registerType("ros-publish", RosPublishNode);
	RED.nodes.registerType("ros-call-service", RosServiceCallNode);
	RED.nodes.registerType("ros-adv-service", RosServiceAdvNode);
	RED.nodes.registerType("ros-resp-service", RosServiceRepsNode);
	RED.nodes.registerType("ros-server", RosServerNode);
	RED.nodes.registerType("ros-action-client", RosActionClientNode);

	// API endpoint to provide message types for dropdown
	RED.httpAdmin.get('/ros/message-types', function(req, res) {
		try {
			const types = rosTypesConfig.getAllMessageTypes();
			res.json({ types: types });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	// API endpoint to provide service types for dropdown
	RED.httpAdmin.get('/ros/service-types', function(req, res) {
		try {
			const types = rosTypesConfig.getAllServiceTypes();
			res.json({ types: types });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	// API endpoint to provide action types for dropdown
	RED.httpAdmin.get('/ros/action-types', function(req, res) {
		try {
			const types = rosTypesConfig.getAllActionTypes();
			res.json({ types: types });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});
}
