import URDFLoader from 'urdf-loader';
// import URDFRobot from 'urdf-loader';

AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'string' },
    mtl: { type: 'model' },
  },

  init: function () {
    console.log('URDF Component Initialized');
    var el = this.el;
    var self = this;
    this.robot = null;
    this.object3DMap = new Map();
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.loadMeshCb = function (path, manager, done) {
      console.log('Loading mesh from: ' + path);
      var name = path.split('/').pop().split('.')[0];
      name = "link_" + name.replace(/[^a-zA-Z0-9]/g, '_');
      self.object3DMap.set(name, path);
      done();
    }
  },

  update: function (oldData) {
    var data = this.data;
    var robot = this.robot;
    if (!data.url) {
      console.error('URDF URL is required');
      return;
    }
    this.resetRobot();
    console.log('Loading URDF from: ' + data.url);
    this.urdfLoader.load(data.url, (_robot) => {
      robot = _robot;
      console.log('Number of Links: ' + Object.keys(robot.links).length);
      console.log('Number of Joints: ' + Object.keys(robot.joints).length);
      this.traverseRobot(robot);
      robot.setJointValues();
    });
    // robot.setJointValues();
  },

  remove: function () {
    this.resetRobot();
  },

  resetRobot: function () {
    if (!this.robot) { return; }
    // TODO
  },

  traverseRobot: function (node) {
    console.log('Visiting node: ' + node.name);
    console.log('Node type: ' + node.type);
    if (node.type === 'URDFJoint' || node.type === 'URDFLink') {
      // Create new entity for the link/joint
      var entity = document.createElement('a-entity');
      entity.setAttribute('id', node.name.replace(/[^a-zA-Z0-9]/g, '_'));
      if (node.parent) {
        var parentName = node.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
        var parentEntity = document.querySelector('#' + parentName);
        parentEntity.appendChild(entity);
      }
      else {
        this.el.appendChild(entity);
      }
      // TODO: This is broken!!
      entity.object3D.position.copy(node.position);
      entity.object3D.quaternion.copy(node.quaternion)
    } else if (node.type === 'URDFVisual') {
      parentName = node.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
      var parentEntity = document.querySelector('#' + parentName);
      var path = this.object3DMap.get(parentName)
      parentEntity.setAttribute('obj-model', { obj: path, mtl: this.data.mtl });
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.traverseRobot(child));
    }
  }
});