/**
 * 行为树触发器节点 (BT Trigger)
 * 特点：触发行为树的执行
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', (msg) => {
      node.status({ fill: "blue", shape: "dot", text: "触发" });
      
      // 发送启动消息
      const triggerMsg = RED.util.cloneMessage(msg);
      triggerMsg.btControl = {
        action: 'start',
        timestamp: Date.now()
      };
      
      node.send(triggerMsg);
      
      setTimeout(() => {
        node.status({ fill: "grey", shape: "ring", text: "就绪" });
      }, 1000);
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
