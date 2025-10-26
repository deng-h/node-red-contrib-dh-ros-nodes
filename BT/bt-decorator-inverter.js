/**
 * 取反装饰器节点 (Inverter Decorator)
 * 特点：反转子节点的结果（成功变失败，失败变成功）
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.isExecuting = false;
    node.pendingMsg = null;

    node.on('input', (msg) => {
      // 触发执行
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('取反装饰器已在执行中');
          return;
        }
        
        node.isExecuting = true;
        node.pendingMsg = msg;
        
        node.status({ fill: "blue", shape: "dot", text: "执行中" });
        
        // 转发给子节点
        const childMsg = RED.util.cloneMessage(msg);
        childMsg.btControl = {
          action: 'execute',
          parentType: 'decorator-inverter'
        };
        node.send(childMsg);
        return;
      }

      // 子节点返回结果
      if (msg.btResult) {
        if (!node.isExecuting) {
          return;
        }

        const result = msg.btResult;
        const invertedSuccess = !result.success;
        
        node.isExecuting = false;
        
        const statusColor = invertedSuccess ? "green" : "red";
        const statusText = invertedSuccess ? "成功 (已取反)" : "失败 (已取反)";
        node.status({ fill: statusColor, shape: "dot", text: statusText });

        const resultMsg = RED.util.cloneMessage(node.pendingMsg);
        resultMsg.btResult = {
          success: invertedSuccess,
          message: `取反装饰器：原结果为${result.success ? '成功' : '失败'}，已反转`,
          originalResult: result,
          inverted: true
        };
        node.send([null, resultMsg]);
      }
    });

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
