/**
 * 并行节点 (Parallel Node)
 * 特点：同时执行多个子任务，根据设定的规则判断整体成功或失败
 * 支持多种策略：全部成功、至少N个成功等
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.totalChildren = parseInt(config.childCount) || 2;
    node.successPolicy = config.successPolicy || 'all'; // 'all', 'any', 'atLeastN'
    node.successThreshold = parseInt(config.successThreshold) || 1;
    node.isExecuting = false;
    node.childResults = [];
    node.receivedCount = 0;
    node.successCount = 0;
    node.pendingMsg = null;

    node.on('input', (msg) => {
      // 如果是触发执行的消息
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('并行节点已在执行中，忽略重复触发');
          return;
        }
        
        node.isExecuting = true;
        node.childResults = [];
        node.receivedCount = 0;
        node.successCount = 0;
        node.pendingMsg = msg;
        
        node.status({ fill: "blue", shape: "dot", text: `并行执行 (0/${node.totalChildren})` });
        
        // 同时发送所有子节点的执行请求
        for (let i = 0; i < node.totalChildren; i++) {
          const childMsg = RED.util.cloneMessage(msg);
          childMsg.btControl = {
            action: 'execute',
            parentType: 'parallel',
            index: i
          };
          node.send(childMsg);
        }
        return;
      }

      // 如果是子节点返回的结果
      if (msg.btResult) {
        if (!node.isExecuting) {
          node.warn('收到结果但并行节点未在执行状态');
          return;
        }

        const result = msg.btResult;
        node.childResults.push(result);
        node.receivedCount++;
        
        if (result.success) {
          node.successCount++;
        }

        node.status({ 
          fill: "blue", 
          shape: "dot", 
          text: `进行中 (${node.receivedCount}/${node.totalChildren}, 成功:${node.successCount})` 
        });

        // 检查是否可以提前判断结果
        const canSucceedEarly = node.checkEarlySuccess();
        const canFailEarly = node.checkEarlyFailure();

        if (canSucceedEarly) {
          node.finishExecution(true);
        } else if (canFailEarly) {
          node.finishExecution(false);
        } else if (node.receivedCount >= node.totalChildren) {
          // 所有子节点都完成了，根据策略判断
          const finalSuccess = node.evaluateSuccess();
          node.finishExecution(finalSuccess);
        }
      }
    });

    // 检查是否可以提前判断成功
    node.checkEarlySuccess = () => {
      if (node.successPolicy === 'any' && node.successCount >= 1) {
        return true;
      }
      if (node.successPolicy === 'atLeastN' && node.successCount >= node.successThreshold) {
        return true;
      }
      if (node.successPolicy === 'all' && node.successCount >= node.totalChildren) {
        return true;
      }
      return false;
    };

    // 检查是否可以提前判断失败
    node.checkEarlyFailure = () => {
      const failedCount = node.receivedCount - node.successCount;
      const remainingCount = node.totalChildren - node.receivedCount;
      const maxPossibleSuccess = node.successCount + remainingCount;

      if (node.successPolicy === 'all' && failedCount >= 1) {
        return true;
      }
      if (node.successPolicy === 'atLeastN' && maxPossibleSuccess < node.successThreshold) {
        return true;
      }
      return false;
    };

    // 评估最终成功状态
    node.evaluateSuccess = () => {
      switch (node.successPolicy) {
        case 'all':
          return node.successCount === node.totalChildren;
        case 'any':
          return node.successCount >= 1;
        case 'atLeastN':
          return node.successCount >= node.successThreshold;
        default:
          return false;
      }
    };

    // 完成执行
    node.finishExecution = (success) => {
      node.isExecuting = false;
      
      if (success) {
        node.status({ fill: "green", shape: "dot", text: `成功 (${node.successCount}/${node.totalChildren})` });
      } else {
        node.status({ fill: "red", shape: "dot", text: `失败 (${node.successCount}/${node.totalChildren})` });
      }

      const resultMsg = RED.util.cloneMessage(node.pendingMsg);
      resultMsg.btResult = {
        success: success,
        message: success ? '并行节点执行成功' : '并行节点执行失败',
        successCount: node.successCount,
        totalCount: node.totalChildren,
        receivedCount: node.receivedCount,
        results: node.childResults,
        policy: node.successPolicy
      };
      node.send([null, resultMsg]);
    };

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
