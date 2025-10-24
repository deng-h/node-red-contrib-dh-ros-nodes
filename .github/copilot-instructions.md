# Copilot Instructions: node-red-contrib-ros-nodes

## Project Overview
This is a Node-RED plugin that provides ROS (Robot Operating System) integration via ROS Bridge WebSocket protocol. It wraps `roslib` (roslibjs) to enable visual flow-based programming for ROS communication patterns. The project extends previous ROS Node-RED contributions by adding full service server support.

## Architecture

### Node Registration Pattern
All node types are registered in `ros.js` which acts as the entry point:
```javascript
RED.nodes.registerType("ros-subscribe", RosSubscribeNode);
RED.nodes.registerType("ros-publish", RosPublishNode);
// etc...
```

Each node type has two components:
1. JavaScript module (`ros-*-node.js`) - Backend logic using roslib
2. HTML definition in `ros.html` - Node-RED UI configuration

### Core Components

**ros-server-node.js** - Configuration node (not visible in flow)
- Manages WebSocket connection to ROS Bridge server (default: `ws://localhost:9090`)
- Implements auto-reconnection with exponential backoff (caps at 5 seconds)
- Emits lifecycle events: `'ros connected'`, `'ros error'`, `'ros closed'`
- All other nodes depend on this via `config.server` reference

**Communication Nodes:**
- `ros-publish-node.js` - Advertises topics and publishes messages
- `ros-subscribe-node.js` - Subscribes to topics with auto-retry via `topicQuery()`
- `ros-call-service-node.js` - Service client that calls ROS services
- `ros-adv-service-node.js` - Service server (advertises service)
- `ros-resp-service-node.js` - Service response handler (paired with adv-service)
- `ros-action-client-node.js` - Action client with feedback and result outputs

## Critical Patterns

### Server Connection Pattern
Every node follows this lifecycle:
```javascript
node.server = RED.nodes.getNode(config.server);
if (!node.server || !node.server.ros) return;

node.server.on('ros connected', () => {
  // Initialize ROSLIB objects here
  node.status({ fill: "green", shape: "dot", text: "connected" });
});

node.server.on('ros error', () => {
  node.status({ fill: "red", shape: "dot", text: "error" });
});
```

**Why:** ROS connection is asynchronous. Nodes must wait for connection before creating ROSLIB Topics/Services.

### Service Server Two-Node Pattern
Service servers require TWO nodes in sequence:
1. `ros-adv-service` - Receives incoming service calls → outputs `{payload: {id, args}}`
2. Function node (user processes request)
3. `ros-resp-service` - Sends response back using `payload.id` for call matching

**Example flow:** `ros-adv-service` → `function` (process) → `ros-resp-service`

This split allows Node-RED function nodes to process requests between receive/respond.

### Message Payload Convention
- **Subscribe nodes output:** `{payload: <ROS message object>}` (e.g., `msg.payload.data`)
- **Publish nodes expect:** `msg.payload` should be the ROS message object
- **Service calls expect:** `msg.payload` contains service request arguments
- **Service calls output:** `{payload: <service response>}`

### Topic Query Retry
`ros-subscribe-node.js` uses `topicQuery()` polling because topics may not exist immediately:
```javascript
node.server.ros.getTopicType(node.topic.name, (type) => {
  if (!type) setTimeout(() => { topicQuery() }, 1000);
  // ...
});
```

### Cleanup Pattern
Subscribe nodes must unsubscribe on close to prevent memory leaks:
```javascript
node.on("close", function () {
  if (!node.server.closing) {
    node.topic.unsubscribe();
  }
});
```
Check `node.server.closing` to avoid errors during server shutdown.

## Development Conventions

### File Structure
- One node type per file: `ros-<functionality>-node.js`
- All UI definitions consolidated in single `ros.html`
- Icon reference: `icon: "icon.png"` (stored in `icons/` directory)

### Node Configuration
Nodes use consistent config properties:
- `server`: Reference to ros-server config node
- `topicname`/`servicename`: ROS resource path (e.g., `/my_topic`)
- `msgtype`/`srvtype`: ROS type string (e.g., `std_msgs/String`, `std_srvs/SetBool`)

### Status Indicators
Use Node-RED status API to show connection state:
- Green dot: Connected and operational
- Red dot: ROS connection error
- Blue dot: Active operation (e.g., "Received Call")

### No Testing Infrastructure
The project has no automated tests (`"test": "echo \"Error: no test specified\" && exit 1"`). Test manually with:
1. Running ROS Bridge: `roslaunch rosbridge_server rosbridge_websocket.launch`
2. Importing sample flow from README.md
3. Verifying each node type with ROS tools (`rostopic echo`, `rosservice call`)

## Integration Points

### External Dependencies
- **roslib (roslibjs)**: Only runtime dependency - handles all ROS protocol details
- **Node-RED**: Peer dependency (not in package.json) - provides RED API
- **ROS Bridge**: External system requirement - must be running for any functionality

### Installation Context
This is a Node-RED plugin installed via `npm install node-red-contrib-flowake-ros-nodes`. After installation:
1. Restart Node-RED
2. Nodes appear in "ros" category in palette
3. Configure ros-server node with WebSocket URL first

## Common Pitfalls

1. **Forgetting server connection check:** Always return early if `!node.server || !node.server.ros`
2. **Creating ROSLIB objects too early:** Must wait for `'ros connected'` event
3. **Service server confusion:** Remember it's a two-node pattern (adv + resp)
4. **Message structure:** Users often forget to access `msg.payload.data` for std_msgs types
5. **Reconnection race conditions:** The server auto-reconnects, but nodes must re-initialize on each connection

## VS Code / Development Setup
- No build step required - pure JavaScript
- No TypeScript, no transpilation
- No linting configuration in repository
- Edit and test directly in Node-RED UI
