/**
 * 重复装饰器节点 (Repeat Decorator)
 * 特点：重复执行子节点指定次数或直到失败
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.repeatCount = parseInt(config.repeatCount) || 3;
    node.repeatMode = config.repeatMode || 'fixed'; // 'fixed', 'untilFail', 'untilSuccess', 'infinite'
    node.currentIteration = 0;
    node.isExecuting = false;
    node.pendingMsg = null;
    node.iterationResults = [];

    node.on('input', (msg) => {
      // 触发执行
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('重复装饰器已在执行中');
          return;
        }
        
        node.isExecuting = true;
        node.currentIteration = 0;
        node.iterationResults = [];
        node.pendingMsg = msg;
        
        node.status({ fill: "blue", shape: "dot", text: `第 1 次执行` });
        
        // 执行第一次
        const childMsg = RED.util.cloneMessage(msg);
        childMsg.btControl = {
          action: 'execute',
          parentType: 'decorator-repeat',
          iteration: node.currentIteration
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
        node.iterationResults.push(result);
        node.currentIteration++;

        // 根据不同模式判断是否继续
        let shouldContinue = false;
        let finalSuccess = result.success;

        switch (node.repeatMode) {
          case 'fixed':
            shouldContinue = node.currentIteration < node.repeatCount;
            finalSuccess = result.success;
            break;
          
          case 'untilFail':
            shouldContinue = result.success;
            finalSuccess = !result.success; // 失败了才算完成目标
            break;
          
          case 'untilSuccess':
            shouldContinue = !result.success;
            finalSuccess = result.success;
            break;
          
          case 'infinite':
            shouldContinue = true;
            finalSuccess = true;
            break;
        }

        if (shouldContinue && node.repeatMode !== 'infinite') {
          // 继续下一次迭代
          node.status({ fill: "blue", shape: "dot", text: `第 ${node.currentIteration + 1} 次执行` });
          
          const childMsg = RED.util.cloneMessage(node.pendingMsg);
          childMsg.btControl = {
            action: 'execute',
            parentType: 'decorator-repeat',
            iteration: node.currentIteration
          };
          node.send(childMsg);
        } else {
          // 完成
          node.isExecuting = false;
          
          const statusText = node.repeatMode === 'infinite' ? '无限循环中' : 
                            `完成 (${node.currentIteration}次)`;
          const statusColor = finalSuccess ? "green" : "red";
          
          node.status({ fill: statusColor, shape: "dot", text: statusText });

          const resultMsg = RED.util.cloneMessage(node.pendingMsg);
          resultMsg.btResult = {
            success: finalSuccess,
            message: `重复装饰器完成 ${node.currentIteration} 次执行`,
            iterations: node.currentIteration,
            mode: node.repeatMode,
            results: node.iterationResults
          };
          node.send([null, resultMsg]);
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
