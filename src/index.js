// For more info on components see:
// https://aframe.io/docs/1.5.0/introduction/writing-a-component.html
// Inspired by README examples from:
// https://www.npmjs.com/package/urdf-loader
// Inspired by A-Frame OBJ Loader Component:
// https://github.com/aframevr/aframe/blob/0b7aa6a0575c03963636b02ab24a9fc2658a747c/src/components/obj-model.js

import URDFLoader from 'urdf-loader';


AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'string', default: 'path/to/robot.urdf' }
  },

  init: function () {
    var self = this;
    this.urdfLoader = new URDFLoader();

    this.urdfLoader.manager.onLoad = function () {
      console.log('All resources loaded.');
    };

    // Set up the loading manager for progress events, etc.
    this.urdfLoader.manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log('Loading file: ' + url + '\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    this.urdfLoader.manager.onError = function (url) {
      console.log('There was an error loading ' + url);
    };

  },

  update: function (oldData) {
    var data = this.data;
    if (!data.obj) { return; }
    if (!data.urdf) { return; }
    this.resetMesh();
    this.loadURDF(data.urdf);
    // this.robot.setJointValue( jointName, jointAngle );
  },

  remove: function () {
    this.resetMesh();
  },

  resetMesh: function () {
    if (this.model) {
      this.el.removeObject3D('mesh');
      this.model = null;
    }
  },

  loadURDF: function (urdfUrl) {
    var self = this;
    var el = this.el;

    this.urdfLoader.load(urdfUrl, function (object) {
      self.model = object;
      self.model.traverse(function (child) {
        if (child.isMesh) {
          var material = new THREE.MeshStandardMaterial();
          material.metalness = 0;
          material.flatShading = true;
          child.material = material;
        }
      });

      el.setObject3D('mesh', object);
      el.emit('model-loaded', { format: 'urdf', model: object });
    });
  }
});