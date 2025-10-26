/**
 * 行为树执行器节点 (BT Action)
 * 特点：实际执行任务的叶子节点
 * 可以配置执行逻辑或者通过function节点处理
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.actionName = config.actionName || '动作';
    node.actionMode = config.actionMode || 'passthrough'; // 'passthrough', 'success', 'fail', 'delay'
    node.delayTime = parseInt(config.delayTime) || 1000;
    node.isExecuting = false;

    node.on('input', (msg) => {
      // 如果收到执行请求
      if (msg.btControl && msg.btControl.action === 'execute') {
        if (node.isExecuting) {
          node.warn('动作节点已在执行中');
          return;
        }

        node.isExecuting = true;
        node.status({ fill: "blue", shape: "dot", text: "执行中" });

        // 根据模式执行
        switch (node.actionMode) {
          case 'success':
            // 直接成功
            setTimeout(() => {
              node.completeAction(msg, true, '动作执行成功');
            }, 100);
            break;

          case 'fail':
            // 直接失败
            setTimeout(() => {
              node.completeAction(msg, false, '动作执行失败');
            }, 100);
            break;

          case 'delay':
            // 延迟后成功
            setTimeout(() => {
              node.completeAction(msg, true, `延迟${node.delayTime}ms后成功`);
            }, node.delayTime);
            break;

          case 'passthrough':
            // 转发到输出口1，等待外部处理后返回
            const actionMsg = RED.util.cloneMessage(msg);
            actionMsg.btAction = {
              name: node.actionName,
              needsResponse: true
            };
            node.send([actionMsg, null]);
            break;

          default:
            node.completeAction(msg, true, '默认成功');
        }
        return;
      }

      // 如果收到外部处理的结果（用于passthrough模式）
      if (msg.btActionResult && node.isExecuting) {
        node.completeAction(
          msg,
          msg.btActionResult.success !== false,
          msg.btActionResult.message || '外部处理完成'
        );
      }
    });

    node.completeAction = (msg, success, message) => {
      node.isExecuting = false;
      
      const statusColor = success ? "green" : "red";
      const statusText = success ? "成功" : "失败";
      node.status({ fill: statusColor, shape: "dot", text: statusText });

      const resultMsg = RED.util.cloneMessage(msg);
      resultMsg.btResult = {
        success: success,
        message: message,
        actionName: node.actionName,
        timestamp: Date.now()
      };
      
      node.send([null, resultMsg]);

      setTimeout(() => {
        node.status({ fill: "grey", shape: "ring", text: "就绪" });
      }, 2000);
    };

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
