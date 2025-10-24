# 节点类别映射说明

## 概述

生成器会自动从节点名称中提取模块名并映射为中文类别,无需在 JSON 配置文件中手动添加 `category` 字段。

## 映射规则

### 1. 名称解析

节点名称格式: `/zj_humanoid/module_name/...`

例如:
- `/zj_humanoid/audio/LLM_chat` → 提取模块名: `audio`
- `/zj_humanoid/hand/versions` → 提取模块名: `hand`
- `/zj_humanoid/upperlimb/movej/left_arm` → 提取模块名: `upperlimb`

### 2. 中英文映射字典

| 英文模块名 | 中文类别 |
|-----------|---------|
| audio | 语音模块 |
| hand | 手部模块 |
| lowerlimb | 下肢模块 |
| manipulation | 操作模块 |
| navigation | 导航模块 |
| robot | 机器人状态 |
| sensor | 传感器模块 |
| upperlimb | 上肢模块 |

### 3. 默认值

如果无法从节点名称中提取模块名,或模块名不在映射字典中,则使用默认类别: `ZJ Humanoid`

## 实现位置

在 `generator.js` 中:

```javascript
// 模块名中英文映射字典
const MODULE_CATEGORY_MAP = {
  'audio': '语音模块',
  'hand': '手部模块',
  'lowerlimb': '下肢模块',
  'manipulation': '操作模块',
  'navigation': '导航模块',
  'robot': '机器人状态',
  'sensor': '传感器模块',
  'upperlimb': '上肢模块'
};

// 从节点名称提取类别
function extractCategory(nodeName) {
  const parts = nodeName.split('/').filter(p => p);
  if (parts.length < 2) {
    return 'ZJ Humanoid';
  }
  const moduleName = parts[1];
  return MODULE_CATEGORY_MAP[moduleName] || 'ZJ Humanoid';
}
```

## 优先级

1. **JSON 中的 category 字段** (如果存在,优先使用)
2. **自动提取的类别** (从节点名称提取)
3. **默认值** (ZJ Humanoid)

这意味着你可以在 JSON 配置文件中手动指定 `category` 字段来覆盖自动提取的类别。

## 示例

### 输入 (JSON)

```json
{
  "name": "/zj_humanoid/audio/tts_service",
  "description": "文字转语音",
  "type": "audio/TTS",
  "note": "请让机器人说'hello world'"
}
```

### 输出 (生成的节点)

Node-RED 面板中显示在 **"语音模块"** 类别下,节点标签为 **"文字转语音"**

## 添加新模块

如果需要支持新的模块类别:

1. 在 `generator.js` 的 `MODULE_CATEGORY_MAP` 中添加映射
2. 重新运行生成器

例如,添加视觉模块:

```javascript
const MODULE_CATEGORY_MAP = {
  'audio': '语音模块',
  'hand': '手部模块',
  'lowerlimb': '下肢模块',
  'manipulation': '操作模块',
  'navigation': '导航模块',
  'robot': '机器人状态',
  'sensor': '传感器模块',
  'upperlimb': '上肢模块',
  'vision': '视觉模块'  // 新增
};
```
