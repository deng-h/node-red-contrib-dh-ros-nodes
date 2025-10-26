/**
 * 序列节点 (Sequence Node)
 * 特点：按顺序执行子任务，必须全部成功才算成功
 * 只要有一个失败，就立刻停止并返回失败
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // 用于跟踪当前执行状态
    node.currentIndex = 0;
    node.childResults = [];
    node.totalChildren = parseInt(config.childCount) || 2;
    node.isExecuting = false;
    node.pendingMsg = null;

    node.on('input', (msg) => {
      // 如果是触发执行的消息（从上游来的）
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('序列节点已在执行中，忽略重复触发');
          return;
        }
        
        node.isExecuting = true;
        node.currentIndex = 0;
        node.childResults = [];
        node.pendingMsg = msg;
        
        node.status({ fill: "blue", shape: "dot", text: `执行中 (0/${node.totalChildren})` });
        
        // 发送第一个子节点的执行请求
        const childMsg = RED.util.cloneMessage(msg);
        childMsg.btControl = {
          action: 'execute',
          parentType: 'sequence',
          index: 0
        };
        node.send(childMsg);
        return;
      }

      // 如果是子节点返回的结果
      if (msg.btResult) {
        if (!node.isExecuting) {
          node.warn('收到结果但序列节点未在执行状态');
          return;
        }

        const result = msg.btResult;
        node.childResults.push(result);

        if (result.success) {
          // 当前子节点成功，继续下一个
          node.currentIndex++;
          node.status({ fill: "blue", shape: "dot", text: `执行中 (${node.currentIndex}/${node.totalChildren})` });

          if (node.currentIndex >= node.totalChildren) {
            // 所有子节点都成功了
            node.status({ fill: "green", shape: "dot", text: "成功" });
            node.isExecuting = false;
            
            const resultMsg = RED.util.cloneMessage(node.pendingMsg);
            resultMsg.btResult = {
              success: true,
              message: '序列节点所有子任务都成功',
              results: node.childResults
            };
            node.send([null, resultMsg]); // 发送到第二个输出（成功输出）
          } else {
            // 继续执行下一个子节点
            const childMsg = RED.util.cloneMessage(node.pendingMsg);
            childMsg.btControl = {
              action: 'execute',
              parentType: 'sequence',
              index: node.currentIndex
            };
            node.send(childMsg);
          }
        } else {
          // 子节点失败，整个序列失败
          node.status({ fill: "red", shape: "dot", text: "失败" });
          node.isExecuting = false;

          const resultMsg = RED.util.cloneMessage(node.pendingMsg);
          resultMsg.btResult = {
            success: false,
            message: `序列节点在第 ${node.currentIndex + 1} 个子任务失败`,
            failedIndex: node.currentIndex,
            results: node.childResults
          };
          node.send([null, resultMsg]); // 发送到第二个输出（失败也发到成功输出，由上游判断）
        }
      }
    });

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    // 初始状态
    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
