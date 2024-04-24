import URDFLoader from 'urdf-loader';
// import { URDFRobot, URDFJoint, URDFLink, URDFCollider, URDFVisual, URDFMimicJoint } from 'urdf-loader';

AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'string' },
    mtl: { type: 'model' },
  },

  init: function () {
    console.log('URDF Component Initialized');
    var data = this.data;
    var el = this.el;
    this.robot = null;
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.parseVisual = true;
    this.urdfLoader.parseCollision = true;
    this.urdfLoader.loadMeshCb = function (path, manager, done) {
      console.log('Loading mesh from: ' + path);
      var name = "mesh_link_" + path.split('/').pop().split('.')[0];
      name = name.replace(/[^a-zA-Z0-9]/g, '_');
      var entity = document.createElement('a-entity');
      entity.setAttribute('id', name);
      entity.setAttribute('obj-model', { obj: path, mtl: data.mtl });
      el.appendChild(entity);
      done(entity.object3D);
    }

  },

  update: function (oldData) {
    var data = this.data;
    if (!data.url) {
      console.error('URDF URL is required');
      return;
    }
    this.resetRobot();
    this.loadRobot();
    // this.model.setJointValue( jointName, jointAngle );
  },

  remove: function () {
    this.resetRobot();
  },

  resetRobot: function () {
    // remove all children including root
    if (!this.robot) { return; }
    this.el.removeObject3D('mesh');
  },

  loadRobot: function () {
    const url = this.data.url;
    console.log('Loading URDF from: ' + url);
    this.urdfLoader.load(url, (robot) => {
      console.log('Number of Links: ' + Object.keys(robot.links).length);
      console.log('Number of Joints: ' + Object.keys(robot.joints).length);
      this.traverseRobot(robot);
    });
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
      entity.setAttribute('position', node.position);
      entity.setAttribute('rotation', node.rotation);
    } else if (node.type === 'URDFVisual') {
      // Find the mesh entity and attach it to the parent
      var parentName = node.parent.name.replace(/[^a-zA-Z0-9]/g, '_');
      var parentEntity = document.querySelector('#' + parentName);
      var meshEntity = document.querySelector('#mesh_' + parentName);
      meshEntity.parentNode.removeChild(meshEntity);
      console.log('Re-parenting: ' + meshEntity.name);
      parentEntity.appendChild(meshEntity); // Set the parent of the entity
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => this.traverseRobot(child));
    }
  }
});