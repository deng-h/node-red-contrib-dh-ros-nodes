#!/usr/bin/env node

/**
 * ZJ Humanoid ROS Nodes Generator
 * 自动生成基于 zj_humanoid_interfaces.json 的 Node-RED 节点
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  jsonFile: path.join(__dirname, 'zj_humanoid_interfaces.json'),
  templatesDir: path.join(__dirname, 'templates'),
  outputDir: path.join(__dirname, 'generated'),
  nodesDir: path.join(__dirname, 'generated', 'nodes'),
  uiDir: path.join(__dirname, 'generated', 'ui')
};

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
  // nodeName 格式: /zj_humanoid/module_name/...
  const parts = nodeName.split('/').filter(p => p);
  
  if (parts.length < 2) {
    return 'ZJ Humanoid'; // 默认类别
  }
  
  const moduleName = parts[1]; // 获取第二部分作为模块名
  
  // 查找映射,如果没有找到则返回默认值
  return MODULE_CATEGORY_MAP[moduleName] || 'ZJ Humanoid';
}

// 工具函数：安全的文件名转换
function toSafeFileName(str) {
  return str
    .replace(/\//g, '-')           // 替换 /
    .replace(/^-+/, '')             // 移除开头的 -
    .replace(/-+/g, '-')            // 合并多个 -
    .toLowerCase();
}

// 工具函数:生成节点类型名称
function toNodeType(prefix, name) {
  return `zj-humanoid-${prefix}-${toSafeFileName(name)}`;
}

// 工具函数:生成节点标签
function toNodeLabel(description) {
  return description.length > 20 ? description.substring(0, 20) + '...' : description;
}

// 简单的模板渲染引擎
function renderTemplate(template, data) {
  let result = template;
  
  // 处理 {{#if field}} ... {{/if}} 条件语句
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, field, content) => {
    return data[field] ? content : '';
  });
  
  // 处理 {{field}} 变量替换
  result = result.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    return data[field] !== undefined ? data[field] : '';
  });
  
  // 处理 {{{field}}} 不转义的变量替换 (用于HTML)
  result = result.replace(/\{\{\{(\w+)\}\}\}/g, (match, field) => {
    return data[field] !== undefined ? data[field] : '';
  });
  
  return result;
}

// 创建目录
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ 创建目录: ${dir}`);
  }
}

// 读取模板文件
function readTemplate(templateName) {
  const templatePath = path.join(CONFIG.templatesDir, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`模板文件不存在: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

// 生成服务节点
function generateServiceNode(service, templates) {
  const nodeType = toNodeType('service', service.name);
  const fileName = toSafeFileName(service.name);
  
  const data = {
    name: service.name,
    description: service.description,
    type: service.type,
    category: service.category || extractCategory(service.name),
    nodeType: nodeType,
    label: toNodeLabel(service.description),
    note: service.note || '',
    help: service.help || ''
  };
  
  // 生成 JS 文件
  const jsContent = renderTemplate(templates.serviceJs, data);
  const jsPath = path.join(CONFIG.nodesDir, `${fileName}-service.js`);
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  
  // 生成 HTML 文件
  const htmlContent = renderTemplate(templates.serviceHtml, data);
  const htmlPath = path.join(CONFIG.uiDir, `${fileName}-service.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  return { nodeType, jsFile: `nodes/${fileName}-service.js`, htmlFile: `ui/${fileName}-service.html` };
}

// 生成话题发布节点
function generateTopicPubNode(topic, templates) {
  const nodeType = toNodeType('pub', topic.name);
  const fileName = toSafeFileName(topic.name);
  
  const data = {
    name: topic.name,
    description: topic.description,
    type: topic.type,
    category: topic.category || extractCategory(topic.name),
    nodeType: nodeType,
    label: toNodeLabel(topic.description),
    note: topic.note || '',
    throttle_rate: topic.throttle_rate || ''
  };
  
  // 生成 JS 文件
  const jsContent = renderTemplate(templates.topicPubJs, data);
  const jsPath = path.join(CONFIG.nodesDir, `${fileName}-pub.js`);
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  
  // 生成 HTML 文件
  const htmlContent = renderTemplate(templates.topicPubHtml, data);
  const htmlPath = path.join(CONFIG.uiDir, `${fileName}-pub.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  return { nodeType, jsFile: `nodes/${fileName}-pub.js`, htmlFile: `ui/${fileName}-pub.html` };
}

// 生成话题订阅节点
function generateTopicSubNode(topic, templates) {
  const nodeType = toNodeType('sub', topic.name);
  const fileName = toSafeFileName(topic.name);
  
  const data = {
    name: topic.name,
    description: topic.description,
    type: topic.type,
    category: topic.category || extractCategory(topic.name),
    nodeType: nodeType,
    label: toNodeLabel(topic.description),
    note: topic.note || '',
    throttle_rate: topic.throttle_rate || ''
  };
  
  // 生成 JS 文件
  const jsContent = renderTemplate(templates.topicSubJs, data);
  const jsPath = path.join(CONFIG.nodesDir, `${fileName}-sub.js`);
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  
  // 生成 HTML 文件
  const htmlContent = renderTemplate(templates.topicSubHtml, data);
  const htmlPath = path.join(CONFIG.uiDir, `${fileName}-sub.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  
  return { nodeType, jsFile: `nodes/${fileName}-sub.js`, htmlFile: `ui/${fileName}-sub.html` };
}

// 生成主入口文件
function generateMainEntry(registrations) {
  let content = `// Auto-generated main entry file for ZJ Humanoid ROS Nodes
// Generated at: ${new Date().toISOString()}

module.exports = function (RED) {
`;

  // 导入所有节点模块
  registrations.forEach((reg, index) => {
    const varName = `Node${index}`;
    content += `  var ${varName} = require('./${reg.jsFile}')(RED);\n`;
  });

  content += '\n';

  // 注册所有节点
  registrations.forEach((reg, index) => {
    const varName = `Node${index}`;
    content += `  RED.nodes.registerType("${reg.nodeType}", ${varName});\n`;
  });

  content += '};\n';

  const mainPath = path.join(CONFIG.outputDir, 'zj-humanoid-nodes.js');
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log(`✓ 生成主入口: ${mainPath}`);
}

// 生成 package.json
function generatePackageJson(registrations, metadata) {
  const nodes = {};
  registrations.forEach((reg, index) => {
    nodes[`node${index}`] = 'zj-humanoid-nodes.js';
  });

  const packageData = {
    name: 'node-red-contrib-zj-humanoid-nodes',
    version: metadata.version || '1.0.0',
    description: metadata.description || 'ZJ Humanoid ROS Nodes for Node-RED',
    keywords: ['node-red', 'ros', 'zj-humanoid', 'robotics'],
    author: 'denghang',
    license: 'MIT',
    'node-red': {
      nodes: {
        'zj-humanoid': 'zj-humanoid-nodes.js'
      }
    },
    dependencies: {
      'roslib': '^1.1.0'
    }
  };

  const packagePath = path.join(CONFIG.outputDir, 'package.json');
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2), 'utf8');
  console.log(`✓ 生成 package.json: ${packagePath}`);
}

// 合并所有 HTML 文件到单个文件
function mergeHtmlFiles(registrations) {
  let mergedContent = '<!-- Auto-generated HTML for ZJ Humanoid ROS Nodes -->\n';
  mergedContent += `<!-- Generated at: ${new Date().toISOString()} -->\n\n`;

  registrations.forEach(reg => {
    const htmlPath = path.join(CONFIG.outputDir, reg.htmlFile);
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf8');
      mergedContent += content + '\n\n';
    }
  });

  const mergedPath = path.join(CONFIG.outputDir, 'zj-humanoid-nodes.html');
  fs.writeFileSync(mergedPath, mergedContent, 'utf8');
  console.log(`✓ 合并 HTML 文件: ${mergedPath}`);
}

// 主函数
function main() {
  console.log('='.repeat(60));
  console.log('ZJ Humanoid ROS Nodes Generator');
  console.log('='.repeat(60));

  try {
    // 读取 JSON 配置
    console.log(`\n读取配置文件: ${CONFIG.jsonFile}`);
    const jsonData = JSON.parse(fs.readFileSync(CONFIG.jsonFile, 'utf8'));
    console.log(`✓ 找到 ${jsonData.services.length} 个服务`);
    console.log(`✓ 找到 ${jsonData.topics.length} 个话题`);

    // 创建输出目录
    console.log('\n创建输出目录...');
    ensureDir(CONFIG.outputDir);
    ensureDir(CONFIG.nodesDir);
    ensureDir(CONFIG.uiDir);

    // 读取模板
    console.log('\n读取模板文件...');
    const templates = {
      serviceJs: readTemplate('service-call.js.template'),
      serviceHtml: readTemplate('service-call.html.template'),
      topicPubJs: readTemplate('topic-pub.js.template'),
      topicPubHtml: readTemplate('topic-pub.html.template'),
      topicSubJs: readTemplate('topic-sub.js.template'),
      topicSubHtml: readTemplate('topic-sub.html.template')
    };
    console.log('✓ 模板读取完成');

    // 生成节点
    console.log('\n生成节点文件...');
    const registrations = [];

    // 生成服务节点
    jsonData.services.forEach((service, index) => {
      const reg = generateServiceNode(service, templates);
      registrations.push(reg);
    });
    console.log(`✓ 完成 ${jsonData.services.length} 个服务节点生成`);

    // 生成话题节点
    jsonData.topics.forEach((topic, index) => {
      if (topic.direction === 'publish') {
        const reg = generateTopicPubNode(topic, templates);
        // const reg = generateTopicSubNode(topic, templates);
        registrations.push(reg);
      } else if (topic.direction === 'subscribe') {
        const reg = generateTopicSubNode(topic, templates);
        // const reg = generateTopicPubNode(topic, templates);
        registrations.push(reg);
      }
    });
    console.log(`✓ 完成 ${jsonData.topics.length} 个话题节点生成`);

    // 生成主入口文件
    console.log('\n生成包文件...');
    generateMainEntry(registrations);
    
    // 合并 HTML 文件
    mergeHtmlFiles(registrations);
    
    // 生成 package.json
    generatePackageJson(registrations, jsonData.metadata);

    // 统计信息
    console.log('\n' + '='.repeat(60));
    console.log('生成完成!');
    console.log('='.repeat(60));
    console.log(`总共生成节点数: ${registrations.length}`);
    console.log(`  - 服务节点: ${jsonData.services.length}`);
    console.log(`  - 话题发布节点: ${jsonData.topics.filter(t => t.direction === 'publish').length}`);
    console.log(`  - 话题订阅节点: ${jsonData.topics.filter(t => t.direction === 'subscribe').length}`);
    console.log(`\n输出目录: ${CONFIG.outputDir}`);
    console.log('\n安装说明:');
    console.log('  cd ~/.node-red');
    console.log(`  npm install ${CONFIG.outputDir}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行生成器
if (require.main === module) {
  main();
}

module.exports = { main };
