# Node-RED 行为树节点包

这是一个为 Node-RED 开发的行为树（Behavior Tree）控制流节点包，提供了完整的行为树实现，包括序列、回退、并行和装饰器节点。

## 功能特性

### 四类控制流节点

#### 1. 序列节点 (Sequence Node)
- **特点**：按顺序执行子任务，必须全部成功才算成功
- **行为**：只要有一个失败，就立刻停止并返回失败
- **用途**：需要按步骤完成的任务序列，如"打开门 → 进入房间 → 关门"

#### 2. 回退节点 (Fallback/Selector Node)
- **特点**：按顺序尝试子任务，只要有一个成功就算成功
- **行为**：前面失败了就试下一个，全部失败才算失败
- **用途**：多种备选方案，如"尝试方案A → 失败则尝试方案B → 失败则尝试方案C"

#### 3. 并行节点 (Parallel Node)
- **特点**：同时执行多个子任务，根据设定的规则判断整体成功或失败
- **策略**：
  - **全部成功**：所有子任务都必须成功
  - **任意成功**：至少一个子任务成功即可
  - **至少N个成功**：自定义成功阈值
- **用途**：需要同时进行的任务，如同时监控多个传感器

#### 4. 装饰器节点 (Decorator Node)
- **特点**：只连一个子节点，但可以修改子节点的行为
- **类型**：
  - **重复装饰器**：重复执行子节点（固定次数、直到失败、直到成功、无限循环）
  - **取反装饰器**：反转子节点结果（成功变失败，失败变成功）
  - **条件装饰器**：只有满足条件时才执行子节点

### 辅助节点

#### BT 触发器 (bt-trigger)
用于启动行为树的执行，接收任何输入消息并转换为行为树控制消息。

#### BT 动作 (bt-action)
行为树的叶子节点，执行实际任务。支持多种模式：
- **转发处理**：将任务转发到外部处理（连接 function 节点）
- **直接成功/失败**：用于测试
- **延迟成功**：模拟耗时操作

## 安装方法

### 方式一：从 BT 目录安装（开发/测试）

在 Node-RED 用户目录中执行：

```bash
cd ~/.node-red
npm install /path/to/BT
```

然后重启 Node-RED。

### 方式二：发布到 npm（生产环境）

1. 在 BT 目录下发布包：
```bash
cd BT
npm publish
```

2. 在 Node-RED 中安装：
```bash
cd ~/.node-red
npm install node-red-contrib-behavior-tree
```

## 使用示例

### 示例 1：简单序列 - 按步骤执行任务

```
[inject] → [bt-trigger] → [bt-sequence (子节点数:3)] → [bt-action] → 回到序列
                                    ↓
                              [debug (查看结果)]
```

**流程说明**：
1. inject 节点触发
2. bt-trigger 转换为行为树控制消息
3. bt-sequence 依次执行3个子任务
4. 每个 bt-action 执行完返回结果
5. 所有成功后，序列节点输出最终结果

### 示例 2：回退策略 - 尝试多个备选方案

```
[inject] → [bt-trigger] → [bt-fallback (子节点数:3)]
                                ↓
                          [bt-action (可能失败)]
                          [bt-action (备选方案)]
                          [bt-action (最后方案)]
                                ↓
                            [debug]
```

**流程说明**：
- 依次尝试3个动作
- 任何一个成功即停止并返回成功
- 全部失败才返回失败

### 示例 3：并行执行 - 同时监控多个状态

```
[inject] → [bt-trigger] → [bt-parallel (策略:至少2个成功)]
                                ↓
                    同时执行3个子任务
                          ↓
                      [debug]
```

**配置**：
- 子节点数量：3
- 成功策略：至少N个成功
- 成功阈值：2

### 示例 4：重复执行 - 循环任务

```
[inject] → [bt-trigger] → [bt-decorator-repeat (重复3次)]
                                ↓
                          [bt-action (任务)]
                                ↓
                            [debug]
```

### 示例 5：条件执行 - 满足条件才执行

```
[inject] → [bt-trigger] → [bt-decorator-condition]
                                ↓
                          [bt-action (任务)]
                                ↓
                            [debug]
```

**配置**：
- 条件属性：`payload.temperature`
- 比较运算符：大于 (>)
- 比较值：30

只有当 `msg.payload.temperature > 30` 时才执行子任务。

### 示例 6：复杂行为树 - 组合使用

```
[inject] → [bt-trigger] → [bt-sequence]
                              ↓
                    ┌─────────┼─────────┐
                    ↓         ↓         ↓
            [bt-fallback] [bt-action] [bt-parallel]
                    ↓                     ↓
            尝试多个方案          同时执行多个任务
```

## 消息协议

### 控制消息 (btControl)

行为树节点通过 `msg.btControl` 传递控制信息：

```javascript
msg.btControl = {
    action: 'start',      // 'start' 或 'execute'
    parentType: 'sequence', // 父节点类型
    index: 0              // 子节点索引
}
```

### 结果消息 (btResult)

节点执行完成后返回 `msg.btResult`：

```javascript
msg.btResult = {
    success: true,        // 成功或失败
    message: '执行成功',  // 结果描述
    // ... 其他详细信息
}
```

### 动作消息 (btAction/btActionResult)

动作节点使用：

```javascript
// 输出（passthrough 模式）
msg.btAction = {
    name: '动作名称',
    needsResponse: true
}

// 输入（外部处理后返回）
msg.btActionResult = {
    success: true,
    message: '处理完成'
}
```

## 节点连接规则

### 1. 控制流节点（序列、回退、并行）
- **输入**：接收触发消息或上级节点消息
- **输出1**：连接子节点（可能连接多个）
- **输出2**：连接上级节点或调试节点（结果输出）

### 2. 装饰器节点
- **输入**：接收触发消息或上级节点消息
- **输出1**：连接唯一的子节点
- **输出2**：连接上级节点或调试节点（结果输出）

### 3. 动作节点
- **输入**：接收执行请求
- **输出1**：passthrough 模式下连接 function 节点处理
- **输出2**：连接上级节点（结果输出）

### 连接示例

**序列节点连接多个子节点**：
```
[bt-sequence] 的输出1 → [bt-action-1]
                      → [bt-action-2]
                      → [bt-action-3]

[bt-action-1] 的输出2 → 回到 [bt-sequence] 的输入
[bt-action-2] 的输出2 → 回到 [bt-sequence] 的输入
[bt-action-3] 的输出2 → 回到 [bt-sequence] 的输入

[bt-sequence] 的输出2 → [debug] 或上级节点
```

**装饰器连接单个子节点**：
```
[bt-decorator-repeat] 的输出1 → [bt-action]
[bt-action] 的输出2 → 回到 [bt-decorator-repeat] 的输入
[bt-decorator-repeat] 的输出2 → [debug] 或上级节点
```

## 状态指示

节点使用不同颜色指示当前状态：

- 🔵 **蓝色**：执行中
- 🟢 **绿色**：成功
- 🔴 **红色**：失败
- 🟡 **黄色**：尝试中/条件不满足
- ⚪ **灰色**：就绪

## 注意事项

1. **子节点数量配置**：序列、回退、并行节点需要正确配置子节点数量，否则会一直等待
2. **循环连接**：确保子节点的结果输出连接回父节点的输入
3. **消息流**：不要手动修改 `btControl` 和 `btResult` 属性，除非你清楚它们的作用
4. **无限循环**：谨慎使用重复装饰器的"无限循环"模式，确保有退出机制
5. **并行节点**：子节点是"并发"触发的，不是真正的并行执行（Node-RED 是单线程）
6. **调试**：使用 debug 节点查看 `msg.btResult` 来追踪执行结果

## 完整流程示例（JSON格式）

以下是一个完整的示例流程，可以直接导入 Node-RED：

```json
[
    {
        "id": "trigger1",
        "type": "inject",
        "name": "启动",
        "props": [{"p":"payload"}],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "{\"test\":true}",
        "payloadType": "json",
        "x": 110,
        "y": 100
    },
    {
        "id": "bt-trigger1",
        "type": "bt-trigger",
        "name": "BT触发器",
        "x": 250,
        "y": 100
    },
    {
        "id": "bt-seq1",
        "type": "bt-sequence",
        "name": "序列节点",
        "childCount": 2,
        "x": 390,
        "y": 100
    },
    {
        "id": "bt-action1",
        "type": "bt-action",
        "name": "任务1",
        "actionName": "任务1",
        "actionMode": "success",
        "delayTime": 1000,
        "x": 550,
        "y": 80
    },
    {
        "id": "bt-action2",
        "type": "bt-action",
        "name": "任务2",
        "actionName": "任务2",
        "actionMode": "success",
        "delayTime": 1000,
        "x": 550,
        "y": 120
    },
    {
        "id": "debug1",
        "type": "debug",
        "name": "结果",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "btResult",
        "targetType": "msg",
        "x": 710,
        "y": 100
    }
]
```

**连接方式**：
- trigger1 → bt-trigger1 → bt-seq1
- bt-seq1[输出1] → bt-action1
- bt-seq1[输出1] → bt-action2
- bt-action1[输出2] → bt-seq1[输入]
- bt-action2[输出2] → bt-seq1[输入]
- bt-seq1[输出2] → debug1

## 许可证

MIT License

## 作者

Behavior Tree Nodes

## 版本历史

- **v1.0.0** (2025-10-26)
  - 初始版本
  - 实现序列、回退、并行、装饰器节点
  - 提供触发器和动作节点
