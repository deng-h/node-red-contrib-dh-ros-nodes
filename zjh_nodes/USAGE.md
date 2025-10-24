# ZJ Humanoid ROS Nodes - 使用指南

## 📖 项目简介

这是一个为 ZJ Humanoid 机器人自动生成的 Node-RED ROS 节点包。通过读取 `zj_humanoid_interfaces.json` 配置文件,自动生成了 **170 个节点**,包括:

- **88 个服务节点** - 用于调用 ROS 服务
- **55 个话题发布节点** - 用于发布 ROS 消息
- **27 个话题订阅节点** - 用于订阅 ROS 消息

所有节点都预设了服务/话题名称和消息类型,**无需手动填写**,大大提高了开发效率。

---

## 🚀 快速开始

### 1. 生成节点

在 `my_nodes` 目录下运行生成器:

```bash
cd my_nodes
node generator.js
```

生成的文件位于 `my_nodes/generated/` 目录。

### 2. 安装到 Node-RED

#### 方法一: 本地安装 (推荐)

```bash
cd ~/.node-red
npm install /path/to/my_nodes/generated
```

Windows 用户:
```powershell
cd $env:USERPROFILE\.node-red
npm install d:\myCode\node-red-ros-nodes\my_nodes\generated
```

#### 方法二: 创建符号链接

```bash
cd ~/.node-red/node_modules
ln -s /path/to/my_nodes/generated node-red-contrib-zj-humanoid-nodes
```

### 3. 重启 Node-RED

```bash
node-red-stop
node-red-start
```

或者在 Node-RED 界面右上角选择 "重新部署" → "完全部署"。

---

## 📁 项目结构

```
my_nodes/
├── README.md                          # 本文件
├── USAGE.md                           # 使用指南
├── zj_humanoid_interfaces.json        # 节点定义配置
├── generator.js                       # 自动生成器脚本
├── package.json                       # 生成器包配置
│
├── templates/                         # 节点模板
│   ├── service-call.js.template      # 服务调用 JS 模板
│   ├── service-call.html.template    # 服务调用 HTML 模板
│   ├── topic-pub.js.template         # 话题发布 JS 模板
│   ├── topic-pub.html.template       # 话题发布 HTML 模板
│   ├── topic-sub.js.template         # 话题订阅 JS 模板
│   └── topic-sub.html.template       # 话题订阅 HTML 模板
│
└── generated/                         # 生成的节点包
    ├── package.json                  # Node-RED 包配置
    ├── zj-humanoid-nodes.js          # 主入口文件
    ├── zj-humanoid-nodes.html        # 合并的 HTML 文件
    ├── nodes/                        # JS 节点实现
    │   ├── dh-service-test-service.js
    │   ├── zj-humanoid-manipulation-version-service.js
    │   └── ... (共 170 个)
    └── ui/                           # HTML UI 定义
        ├── dh-service-test-service.html
        ├── zj-humanoid-manipulation-version-service.html
        └── ... (共 170 个)
```

---

## 🎯 节点分类

生成的节点按功能模块分类,在 Node-RED 面板中可以在相应类别下找到:

### 服务节点类别
- **测试模块** - 测试相关服务
- **操作模块** - 机器人操作相关服务
- **导航模块** - 定位导航服务
- **传感器模块** - 传感器数据服务
- **机器人状态** - 状态查询与控制服务
- **手部模块** - 灵巧手控制服务
- **语音模块** - 语音交互服务
- **下肢模块** - 下肢运动控制服务
- **上肢模块** - 上肢运动控制服务

### 话题节点类别
同上分类,另有 `pub` 和 `sub` 后缀区分发布/订阅节点。

---

## 💡 使用示例

### 示例 1: 调用服务查询机器人版本

1. 从左侧面板拖拽 **"操作模块"** → **"操作模块版本号"** 节点到画布
2. 拖拽 **inject** 节点作为触发器
3. 拖拽 **debug** 节点查看结果
4. 连接: `inject` → `操作模块版本号` → `debug`
5. 双击 inject 节点,设置 `msg.payload` 为空对象 `{}`
6. 部署并点击 inject 节点触发

### 示例 2: 订阅机器人关节状态

1. 从左侧面板拖拽 **"上肢模块"** → **"上肢关节位置状态 (sub)"** 节点
2. 拖拽 **debug** 节点
3. 连接: `上肢关节位置状态` → `debug`
4. 部署后自动开始订阅,在 debug 窗口查看实时数据

### 示例 3: 发布控制指令

1. 从左侧面板拖拽 **"手部模块"** → **"左手手势切换"** 服务节点
2. 拖拽 **inject** 节点
3. 拖拽 **function** 节点,编写消息:
   ```javascript
   msg.payload = {
       gesture: "yeah"  // 设置手势
   };
   return msg;
   ```
4. 连接: `inject` → `function` → `左手手势切换`
5. 部署并触发

---

## 🔧 自定义节点

### 添加新节点

1. 编辑 `zj_humanoid_interfaces.json`,添加新的服务或话题定义
2. 运行生成器: `node generator.js`
3. 重新安装到 Node-RED

### 修改节点模板

模板文件位于 `templates/` 目录:

- `service-call.*.template` - 服务调用节点
- `topic-pub.*.template` - 话题发布节点  
- `topic-sub.*.template` - 话题订阅节点

修改模板后重新运行生成器即可。

---

## 📝 节点命名规则

### 节点类型命名
- 服务节点: `zj-humanoid-service-[service-name]`
- 发布节点: `zj-humanoid-pub-[topic-name]`
- 订阅节点: `zj-humanoid-sub-[topic-name]`

其中 `[service-name]` 和 `[topic-name]` 由原始名称转换而来:
- 移除开头的 `/`
- 将 `/` 替换为 `-`
- 转换为小写

示例:
- `/zj_humanoid/manipulation/version` → `zj-humanoid-service-zj-humanoid-manipulation-version`

---

## 🛠️ 依赖项

- **Node-RED**: >= 1.0.0
- **roslib**: ^1.1.0 (ROS JavaScript 库)

---

## ❓ 常见问题

### Q1: 节点没有出现在面板中?
**A:** 检查以下几点:
1. 确认已重启 Node-RED
2. 检查终端是否有错误信息
3. 验证 package.json 格式正确
4. 确认 `~/.node-red/node_modules` 中存在该包

### Q2: 连接不上 ROS?
**A:** 
1. 确保 ROS Bridge 已启动: `roslaunch rosbridge_server rosbridge_websocket.launch`
2. 检查 ROS Server 配置节点的 URL (默认 `ws://localhost:9090`)
3. 验证网络连接

### Q3: 如何更新节点?
**A:**
1. 修改 `zj_humanoid_interfaces.json`
2. 重新运行 `node generator.js`
3. 在 Node-RED 目录执行 `npm update node-red-contrib-zj-humanoid-nodes`
4. 重启 Node-RED

### Q4: 节点太多,如何筛选?
**A:**
- 使用 Node-RED 左侧面板的搜索框
- 按类别浏览 (节点已按功能模块分类)
- 可以修改 `zj_humanoid_interfaces.json` 只生成需要的节点

---

## 📄 许可证

MIT License

---

## 🙏 致谢

本项目基于 [node-red-contrib-flowake-ros-nodes](https://gitlab.com/flowake/node-red-ros-nodes) 的设计模式开发。

---

## 📧 支持

如有问题或建议,请提交 Issue 或 Pull Request。

**祝使用愉快!** 🎉
