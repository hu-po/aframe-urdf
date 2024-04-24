import URDFLoader from 'urdf-loader';

AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'string' },
    mtl: { type: 'model' },
  },

  init: function () {
    var self = this;
    this.robot = null;
    this.objMap = new Map();
    this.jointMap = new Map();
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.loadMeshCb = function (path, _, done) {
      console.log('Loading mesh from: ' + path);
      var name = path.split('/').pop().split('.')[0];
      name = "link_" + name.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize name
      self.objMap.set(name, path);
      done();
    }
    this.el.sceneEl.addEventListener('setjoints', (jointValues) => {
      if (!this.robot) { return; }
      this.robot.setJointValues(jointValues.detail);
      this.updateRobot(this.robot);
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
  },

  tick: function () {
    if (!this.robot) { return; }
    // // Moves random joint to random position for testing
    const keys = Array.from(this.jointMap.keys());
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomJointName = keys[randomIndex];
    const joint = this.robot.joints[randomJointName];
    const randomPosition = joint.limit.lower + Math.random() * (joint.limit.upper - joint.limit.lower);
    let jointValues = {};
    jointValues[randomJointName] = randomPosition;
    this.el.emit('setjoints', jointValues);
  },

  buildRobot: function (node) {
    console.log('Visiting node: ' + node.name);
    console.log('Node type: ' + node.type);
    if (node.parent) {
      var parentName = node.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
      var parentEntity = document.querySelector('#' + parentName);
    }
    if (node.type === 'URDFVisual') {
      var path = this.objMap.get(parentName)
      parentEntity.setAttribute('obj-model', { obj: path, mtl: this.data.mtl });
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
          this.jointMap.set(node.name, node.jointValue[0]);
        }
      }
    }
    // Continue to recurse through the children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.buildRobot(child));
    }
  },

  updateRobot: function (node) {
    if (node.type === 'URDFJoint') {
      var entity = document.querySelector('#' + node.name.replace(/[^a-zA-Z0-9]/g, '_'));
      entity.object3D.position.copy(node.position);
      entity.object3D.quaternion.copy(node.quaternion);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.updateRobot(child));
    }
  }
});