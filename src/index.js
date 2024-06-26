import URDFLoader from 'urdf-loader';
import rgbHex from 'rgb-hex';
import { randomNormal } from 'd3-random';

AFRAME.registerComponent('urdf', {
  schema: {url: { type: 'string' }},

  init: function () {
    var self = this;
    this.robot = null;
    this.jitter = true;
    this.jitter_ms = 1000;
    this.jitter_stddev = 0.1;
    this.matMap = new Map();
    this.objMap = new Map();
    this.jointValueMap = new Map();
    this.jointEntityMap = new Map();
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.loadMeshCb = function (path, _, done) {
      console.log('Loading mesh from: ' + path);
      var name = path.split('/').pop().split('.')[0];
      name = "link_" + name.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize name
      self.objMap.set(name, path);
      done();
    }
    this.el.sceneEl.addEventListener('setjoints', (evt) => {
      if (!this.robot) { return; }
      evt.detail.forEach((value, key) => {
        this.robot.setJointValue(key, value);
        var node = this.robot.joints[key];
        var entity = this.jointEntityMap.get(key);
        entity.object3D.position.copy(node.position);
        entity.object3D.quaternion.copy(node.quaternion);
      });
    });
  },

  update: function () {
    if (!this.data.url) {
      console.error('No URDF URL');
      return;
    }
    console.log('Loading URDF from: ' + this.data.url);
    this.urdfLoader.load(this.data.url, (_robot) => {
      this.robot = _robot;
      console.log('Number of Links: ' + Object.keys(this.robot.links).length);
      console.log('Number of Joints: ' + Object.keys(this.robot.joints).length);
      this.buildRobot(this.robot);
    });
  },

  remove: function () {
    if (!this.robot) { return; }
    this.el.sceneEl.removeEventListener('setjoints', this.handleSetJoints);
  },

  tick: function (time, timeDelta) {
    if (!this.robot) { return; }
    if (this.jitter && time % this.jitter_ms < timeDelta) {
      this.defaultPoseFunc();
      this.jitterFunc();
    }
  },

  buildRobot: function (node) {
    console.log('Visiting node: ' + node.name);
    console.log('Node type: ' + node.type);
    // Primitive meshes like boxes, cylinders, and spheres
    if (node.type === 'Mesh') {
      // For Meshes you need the parent (URDFLink) of the parent (URDFVisual)
      parentName = node.parent.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
      parentEntity = document.querySelector('#' + parentName);
      var entity = document.createElement('a-entity');
      entity.setAttribute('id', node.name.replace(/[^a-zA-Z0-9]/g, '_'));
      var scale = node.scale;
      var params = node.geometry.parameters;
      entity.setAttribute('scale', { x: scale.x, y: scale.y, z: scale.z });
      if (node.geometry.type === 'BoxGeometry') {
        entity.setAttribute('geometry', { primitive: 'box', width: params.width, height: params.height, depth: params.depth });
      }
      else if (node.geometry.type === 'CylinderGeometry') {
        // URDF cylinders are oriented along the y-axis and centered, hence the rotation and position
        entity.setAttribute('rotation', { x: 90, y: 0, z: 0 })
        entity.setAttribute('position', { x: 0, y: 0, z: 0.5 * scale.y });
        entity.setAttribute('geometry', { primitive: 'cylinder', radius: params.radiusTop, height: params.height });
      }
      else if (node.geometry.type === 'SphereGeometry') {
        entity.setAttribute('geometry', { primitive: 'sphere', radius: params.radius });
      }
      else {
        console.error('Unsupported geometry type: ' + node.geometry.type);
      }
      parentEntity.appendChild(entity);
    } else {
      if (node.parent) {
        var parentName = node.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
        var parentEntity = document.querySelector('#' + parentName);
      }
      if (node.type === 'URDFVisual') {
        var path = this.objMap.get(parentName)
        parentEntity.setAttribute('obj-model', { obj: path});
        try {
          var rgba = node.urdfNode.children[2].children[0].attributes["rgba"].nodeValue;
          rgba = rgba.split(' ').map(parseFloat);
          parentEntity.setAttribute('material', {color: '#' + rgbHex(rgba[0], rgba[1], rgba[2]), opacity: rgba[3]});
      } catch (error) {
          console.warn('Could not find rgba attribute for ' + node.name + ' setting to default color');
          parentEntity.setAttribute('material', {color: '#ffffff'});
      }
      
      } else {
        var entity = document.createElement('a-entity');
        entity.setAttribute('id', node.name.replace(/[^a-zA-Z0-9]/g, '_'));
        if (node.parent) {
          parentEntity.appendChild(entity);
        }
        else {
          this.el.appendChild(entity);
        }
        entity.object3D.position.copy(node.position);
        entity.object3D.quaternion.copy(node.quaternion);
        if (node.type === 'URDFJoint') {
          if (!(node.jointType === 'fixed')) {
            this.jointValueMap.set(node.name, node.jointValue[0]);
            this.jointEntityMap.set(node.name, entity);
          }
        }
      }
    }
    // Continue to recurse through the children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.buildRobot(child));
    }
  },

  // Jitters the joints randomly within their limits
  jitterFunc: function () {
    this.jointValueMap.forEach((currentPosition, jointName) => {
      const joint = this.robot.joints[jointName];
      const random = randomNormal(0, (joint.limit.upper - joint.limit.lower) * this.jitter_stddev);
      let newPosition = currentPosition + random();
      newPosition = Math.max(joint.limit.lower, Math.min(joint.limit.upper, newPosition));
      this.jointValueMap.set(jointName, newPosition);
    });
    this.el.emit('setjoints', this.jointValueMap);
  },

  // Set the joints to halfway between their limits
  defaultPoseFunc: function () {
    this.jointValueMap.forEach((_, jointName) => {
      const joint = this.robot.joints[jointName];
      const newPosition = (joint.limit.upper + joint.limit.lower) / 2;
      this.jointValueMap.set(jointName, newPosition);
    });
    this.el.emit('setjoints', this.jointValueMap);
  }
});