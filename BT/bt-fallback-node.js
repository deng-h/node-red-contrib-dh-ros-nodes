/**
 * 回退节点 (Fallback/Selector Node)
 * 特点：按顺序尝试子任务，只要有一个成功就算成功
 * 前面失败了就试下一个，全部失败才算失败
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.currentIndex = 0;
    node.childResults = [];
    node.totalChildren = parseInt(config.childCount) || 2;
    node.isExecuting = false;
    node.pendingMsg = null;

    node.on('input', (msg) => {
      // 如果是触发执行的消息
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('回退节点已在执行中，忽略重复触发');
          return;
        }
        
        node.isExecuting = true;
        node.currentIndex = 0;
        node.childResults = [];
        node.pendingMsg = msg;
        
        node.status({ fill: "blue", shape: "dot", text: `尝试中 (0/${node.totalChildren})` });
        
        // 发送第一个子节点的执行请求
        const childMsg = RED.util.cloneMessage(msg);
        childMsg.btControl = {
          action: 'execute',
          parentType: 'fallback',
          index: 0
        };
        node.send(childMsg);
        return;
      }

      // 如果是子节点返回的结果
      if (msg.btResult) {
        if (!node.isExecuting) {
          node.warn('收到结果但回退节点未在执行状态');
          return;
        }

        const result = msg.btResult;
        node.childResults.push(result);

        if (result.success) {
          // 某个子节点成功了，整个回退节点成功
          node.status({ fill: "green", shape: "dot", text: "成功" });
          node.isExecuting = false;
          
          const resultMsg = RED.util.cloneMessage(node.pendingMsg);
          resultMsg.btResult = {
            success: true,
            message: `回退节点在第 ${node.currentIndex + 1} 个子任务成功`,
            successIndex: node.currentIndex,
            results: node.childResults
          };
          node.send([null, resultMsg]);
        } else {
          // 当前子节点失败，尝试下一个
          node.currentIndex++;
          node.status({ fill: "yellow", shape: "dot", text: `尝试中 (${node.currentIndex}/${node.totalChildren})` });

          if (node.currentIndex >= node.totalChildren) {
            // 所有子节点都失败了
            node.status({ fill: "red", shape: "dot", text: "失败" });
            node.isExecuting = false;
            
            const resultMsg = RED.util.cloneMessage(node.pendingMsg);
            resultMsg.btResult = {
              success: false,
              message: '回退节点所有子任务都失败',
              results: node.childResults
            };
            node.send([null, resultMsg]);
          } else {
            // 继续尝试下一个子节点
            const childMsg = RED.util.cloneMessage(node.pendingMsg);
            childMsg.btControl = {
              action: 'execute',
              parentType: 'fallback',
              index: node.currentIndex
            };
            node.send(childMsg);
          }
        }
      }
    });

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
