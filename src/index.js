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
    // Moves a random joint every 1 second for testing
    if (time % 1000 < 20) {
      const keys = Array.from(this.jointValueMap.keys());
      const randomIndex = Math.floor(Math.random() * keys.length);
      const randomJointName = keys[randomIndex];
      const joint = this.robot.joints[randomJointName];
      const randomPosition = joint.limit.lower + Math.random() * (joint.limit.upper - joint.limit.lower);
      let jointValues = new Map();
      jointValues.set(randomJointName, randomPosition);
      this.el.emit('setjoints', jointValues);
    }
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
          this.jointValueMap.set(node.name, node.jointValue[0]);
          this.jointEntityMap.set(node.name, entity);
        }
      }
    }
    // Continue to recurse through the children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.buildRobot(child));
    }
  }
});