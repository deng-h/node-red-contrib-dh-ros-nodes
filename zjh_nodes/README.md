# ZJ Humanoid ROS Nodes 自动生成工具

## 概述
此文件夹包含了基于 `zj_humanoid_interfaces.json` 自动生成 Node-RED ROS 节点的工具。

## 文件结构
```
my_nodes/
├── zj_humanoid_interfaces.json    # 自定义节点定义文件
├── generator.js                    # 节点生成脚本
├── templates/                      # 模板文件夹
│   ├── service-call.js.template   # 服务调用节点 JS 模板
│   ├── service-call.html.template # 服务调用节点 HTML 模板
│   ├── topic-pub.js.template      # 话题发布节点 JS 模板
│   ├── topic-pub.html.template    # 话题发布节点 HTML 模板
│   ├── topic-sub.js.template      # 话题订阅节点 JS 模板
│   └── topic-sub.html.template    # 话题订阅节点 HTML 模板
├── generated/                      # 生成的节点文件
│   ├── nodes/                     # 生成的 JS 文件
│   ├── ui/                        # 生成的 HTML 文件
│   └── zj-humanoid-nodes.js       # 主入口文件
└── package.json                    # 自定义节点包配置

## 使用方法

### 1. 生成节点
```bash
cd my_nodes
node generator.js
```

### 2. 安装到 Node-RED
生成后的节点包位于 `my_nodes/` 文件夹，可以通过以下方式安装：

方法一：本地安装
```bash
cd ~/.node-red
npm install /path/to/my_nodes
```

方法二：发布到 npm（可选）
```bash
cd my_nodes
npm publish
```

## 节点说明

### 服务节点
- 根据 `services` 数组自动生成服务调用节点
- 节点名称格式：`zj-humanoid-service-[service-name]`
- 服务名称和类型已预设，无需手动填写

### 话题节点
- 根据 `topics` 数组自动生成发布/订阅节点
- 发布节点：`direction: "publish"`
- 订阅节点：`direction: "subscribe"`
- 节点名称格式：`zj-humanoid-topic-[topic-name]-[pub/sub]`
- 话题名称和类型已预设，无需手动填写

## 特性
- ✅ 自动读取 JSON 配置
- ✅ 根据类别分组节点
- ✅ 支持自定义帮助信息（help 字段）
- ✅ 预设话题/服务名称和消息类型
- ✅ 一键生成所有节点
- ✅ 打包成单个 Node-RED 包
