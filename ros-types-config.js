/**
 * ROS Message Types and Service Types Configuration
 * 
 * This file contains predefined ROS message types and service types
 * that will be available in dropdown selections in the Node-RED UI.
 * 
 * Users can:
 * 1. Select from these predefined types
 * 2. Add custom types to the customMessageTypes and customServiceTypes arrays
 * 3. Still manually input any type if not in the lists
 */

module.exports = {
  // Common ROS Message Types
  messageTypes: {
    // Standard messages
    'std_msgs': [
      'Bool',
      'Byte',
      'ByteMultiArray',
      'Char',
      'ColorRGBA',
      'Duration',
      'Empty',
      'Float32',
      'Float32MultiArray',
      'Float64',
      'Float64MultiArray',
      'Header',
      'Int16',
      'Int16MultiArray',
      'Int32',
      'Int32MultiArray',
      'Int64',
      'Int64MultiArray',
      'Int8',
      'Int8MultiArray',
      'MultiArrayDimension',
      'MultiArrayLayout',
      'String',
      'Time',
      'UInt16',
      'UInt16MultiArray',
      'UInt32',
      'UInt32MultiArray',
      'UInt64',
      'UInt64MultiArray',
      'UInt8',
      'UInt8MultiArray'
    ],
    
    // Geometry messages
    'geometry_msgs': [
      'Accel',
      'AccelStamped',
      'AccelWithCovariance',
      'AccelWithCovarianceStamped',
      'Inertia',
      'InertiaStamped',
      'Point',
      'Point32',
      'PointStamped',
      'Polygon',
      'PolygonStamped',
      'Pose',
      'Pose2D',
      'PoseArray',
      'PoseStamped',
      'PoseWithCovariance',
      'PoseWithCovarianceStamped',
      'Quaternion',
      'QuaternionStamped',
      'Transform',
      'TransformStamped',
      'Twist',
      'TwistStamped',
      'TwistWithCovariance',
      'TwistWithCovarianceStamped',
      'Vector3',
      'Vector3Stamped',
      'Wrench',
      'WrenchStamped'
    ],
    
    // Sensor messages
    'sensor_msgs': [
      'BatteryState',
      'CameraInfo',
      'ChannelFloat32',
      'CompressedImage',
      'FluidPressure',
      'Illuminance',
      'Image',
      'Imu',
      'JointState',
      'Joy',
      'JoyFeedback',
      'JoyFeedbackArray',
      'LaserEcho',
      'LaserScan',
      'MagneticField',
      'MultiDOFJointState',
      'MultiEchoLaserScan',
      'NavSatFix',
      'NavSatStatus',
      'PointCloud',
      'PointCloud2',
      'PointField',
      'Range',
      'RegionOfInterest',
      'RelativeHumidity',
      'Temperature',
      'TimeReference'
    ],
    
    // Navigation messages
    'nav_msgs': [
      'GetMap',
      'GetMapAction',
      'GetMapActionFeedback',
      'GetMapActionGoal',
      'GetMapActionResult',
      'GetMapFeedback',
      'GetMapGoal',
      'GetMapResult',
      'GetPlan',
      'GridCells',
      'MapMetaData',
      'OccupancyGrid',
      'Odometry',
      'Path'
    ],
    
    // Trajectory messages
    'trajectory_msgs': [
      'JointTrajectory',
      'JointTrajectoryPoint',
      'MultiDOFJointTrajectory',
      'MultiDOFJointTrajectoryPoint'
    ],
    
    // Actionlib messages
    'actionlib_msgs': [
      'GoalID',
      'GoalStatus',
      'GoalStatusArray'
    ],
    
    // Diagnostic messages
    'diagnostic_msgs': [
      'DiagnosticArray',
      'DiagnosticStatus',
      'KeyValue'
    ],
    
    // Visualization messages
    'visualization_msgs': [
      'ImageMarker',
      'InteractiveMarker',
      'InteractiveMarkerControl',
      'InteractiveMarkerFeedback',
      'InteractiveMarkerInit',
      'InteractiveMarkerPose',
      'InteractiveMarkerUpdate',
      'Marker',
      'MarkerArray',
      'MenuEntry'
    ],
    
    // Shape messages
    'shape_msgs': [
      'Mesh',
      'MeshTriangle',
      'Plane',
      'SolidPrimitive'
    ],
    
    // Stereo messages
    'stereo_msgs': [
      'DisparityImage'
    ]
  },
  
  // Common ROS Service Types
  serviceTypes: {
    // Standard services
    'std_srvs': [
      'Empty',
      'SetBool',
      'Trigger'
    ],
    
    // Dynamic reconfigure services
    'dynamic_reconfigure': [
      'Reconfigure'
    ],
    
    // Navigation services
    'nav_msgs': [
      'GetMap',
      'GetPlan',
      'LoadMap',
      'SetMap'
    ],
    
    // Map services
    'map_msgs': [
      'GetMapROI',
      'GetPointMap',
      'GetPointMapROI',
      'ProjectedMapsInfo',
      'SaveMap',
      'SetMapProjections'
    ],
    
    // TF services
    'tf2_msgs': [
      'FrameGraph'
    ],
    
    // Sensor services
    'sensor_msgs': [
      'SetCameraInfo'
    ]
  },
  
  // Common ROS Action Types
  actionTypes: {
    // MoveBase actions
    'move_base_msgs': [
      'MoveBase'
    ],
    
    // Trajectory execution
    'control_msgs': [
      'FollowJointTrajectory',
      'GripperCommand',
      'JointTrajectory',
      'PointHead',
      'SingleJointPosition'
    ],
    
    // Navigation actions
    'nav_msgs': [
      'GetMap'
    ]
  },
  
  // User-defined custom types (can be modified by users)
  customMessageTypes: [
    // Add your custom message types here, e.g.:
    // 'my_package/MyCustomMessage'
  ],
  
  customServiceTypes: [
    // Add your custom service types here, e.g.:
    // 'my_package/MyCustomService'
  ],
  
  customActionTypes: [
    // Add your custom action types here, e.g.:
    // 'my_package/MyCustomAction'
  ],
  
  /**
   * Get all message types as a flat array with full package/Type format
   */
  getAllMessageTypes: function() {
    const types = [];
    
    // Add predefined types
    for (const pkg in this.messageTypes) {
      this.messageTypes[pkg].forEach(type => {
        types.push(`${pkg}/${type}`);
      });
    }
    
    // Add custom types
    types.push(...this.customMessageTypes);
    
    return types.sort();
  },
  
  /**
   * Get all service types as a flat array with full package/Type format
   */
  getAllServiceTypes: function() {
    const types = [];
    
    // Add predefined types
    for (const pkg in this.serviceTypes) {
      this.serviceTypes[pkg].forEach(type => {
        types.push(`${pkg}/${type}`);
      });
    }
    
    // Add custom types
    types.push(...this.customServiceTypes);
    
    return types.sort();
  },
  
  /**
   * Get all action types as a flat array with full package/Type format
   */
  getAllActionTypes: function() {
    const types = [];
    
    // Add predefined types
    for (const pkg in this.actionTypes) {
      this.actionTypes[pkg].forEach(type => {
        types.push(`${pkg}/${type}`);
      });
    }
    
    // Add custom types
    types.push(...this.customActionTypes);
    
    return types.sort();
  }
};
