/**
 * 条件装饰器节点 (Condition Decorator)
 * 特点：只有满足条件时才执行子节点
 */
module.exports = function (RED) {
  return function (config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.conditionType = config.conditionType || 'property'; // 'property', 'function'
    node.conditionProperty = config.conditionProperty || 'payload.condition';
    node.conditionValue = config.conditionValue || true;
    node.conditionOperator = config.conditionOperator || 'eq'; // 'eq', 'ne', 'gt', 'lt', 'gte', 'lte'
    node.isExecuting = false;
    node.pendingMsg = null;

    node.on('input', (msg) => {
      // 触发执行
      if (msg.btControl && msg.btControl.action === 'start') {
        if (node.isExecuting) {
          node.warn('条件装饰器已在执行中');
          return;
        }
        
        // 检查条件
        const conditionMet = node.evaluateCondition(msg);
        
        if (conditionMet) {
          node.isExecuting = true;
          node.pendingMsg = msg;
          
          node.status({ fill: "blue", shape: "dot", text: "条件满足，执行中" });
          
          // 条件满足，执行子节点
          const childMsg = RED.util.cloneMessage(msg);
          childMsg.btControl = {
            action: 'execute',
            parentType: 'decorator-condition'
          };
          node.send(childMsg);
        } else {
          // 条件不满足，直接返回失败
          node.status({ fill: "yellow", shape: "ring", text: "条件不满足" });
          
          const resultMsg = RED.util.cloneMessage(msg);
          resultMsg.btResult = {
            success: false,
            message: '条件装饰器：条件不满足，未执行子节点',
            conditionMet: false
          };
          node.send([null, resultMsg]);
        }
        return;
      }

      // 子节点返回结果
      if (msg.btResult) {
        if (!node.isExecuting) {
          return;
        }

        const result = msg.btResult;
        node.isExecuting = false;
        
        const statusColor = result.success ? "green" : "red";
        const statusText = result.success ? "成功" : "失败";
        node.status({ fill: statusColor, shape: "dot", text: statusText });

        const resultMsg = RED.util.cloneMessage(node.pendingMsg);
        resultMsg.btResult = {
          success: result.success,
          message: `条件装饰器：条件满足，子节点${result.success ? '成功' : '失败'}`,
          conditionMet: true,
          childResult: result
        };
        node.send([null, resultMsg]);
      }
    });

    // 评估条件
    node.evaluateCondition = (msg) => {
      try {
        // 获取属性值
        const parts = node.conditionProperty.split('.');
        let value = msg;
        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }

        // 比较
        const targetValue = node.conditionValue;
        
        switch (node.conditionOperator) {
          case 'eq':
            return value == targetValue;
          case 'ne':
            return value != targetValue;
          case 'gt':
            return value > targetValue;
          case 'lt':
            return value < targetValue;
          case 'gte':
            return value >= targetValue;
          case 'lte':
            return value <= targetValue;
          case 'exists':
            return value !== undefined && value !== null;
          default:
            return false;
        }
      } catch (err) {
        node.error('条件评估出错: ' + err.message);
        return false;
      }
    };

    node.on('close', () => {
      node.isExecuting = false;
      node.status({});
    });

    node.status({ fill: "grey", shape: "ring", text: "就绪" });
  };
};
