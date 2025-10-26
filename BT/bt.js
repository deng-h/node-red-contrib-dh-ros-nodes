/**
 * 行为树节点包主入口文件
 * Behavior Tree Nodes for Node-RED
 */
module.exports = function (RED) {
  // 加载所有节点
  var BtTriggerNode = require('./bt-trigger-node')(RED);
  var BtSequenceNode = require('./bt-sequence-node')(RED);
  var BtFallbackNode = require('./bt-fallback-node')(RED);
  var BtParallelNode = require('./bt-parallel-node')(RED);
  var BtDecoratorRepeat = require('./bt-decorator-repeat')(RED);
  var BtDecoratorInverter = require('./bt-decorator-inverter')(RED);
  var BtDecoratorCondition = require('./bt-decorator-condition')(RED);
  var BtActionNode = require('./bt-action-node')(RED);

  // 注册所有节点类型
  RED.nodes.registerType("bt-trigger", BtTriggerNode);
  RED.nodes.registerType("bt-sequence", BtSequenceNode);
  RED.nodes.registerType("bt-fallback", BtFallbackNode);
  RED.nodes.registerType("bt-parallel", BtParallelNode);
  RED.nodes.registerType("bt-decorator-repeat", BtDecoratorRepeat);
  RED.nodes.registerType("bt-decorator-inverter", BtDecoratorInverter);
  RED.nodes.registerType("bt-decorator-condition", BtDecoratorCondition);
  RED.nodes.registerType("bt-action", BtActionNode);
};
