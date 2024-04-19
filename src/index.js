// For more info on components see:
// https://aframe.io/docs/1.5.0/introduction/writing-a-component.html
// Inspired by README examples from:
// https://www.npmjs.com/package/urdf-loader
// Inspired by A-Frame OBJ Loader Component:
// https://github.com/aframevr/aframe/blob/0b7aa6a0575c03963636b02ab24a9fc2658a747c/src/components/obj-model.js

import URDFLoader from 'urdf-loader';


AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'string', default: 'path/to/robot.urdf' },
    obj: { type: 'model' }
  },

  init: function () {
    this.model = null;
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.manager.onLoad = function () {
      console.log('All resources loaded.');
    };
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
    this.resetMesh();
    this.loadURDF(data.url);
    // this.robot.setJointValue( jointName, jointAngle );
  },

  remove: function () {
    this.resetMesh();
  },

  resetMesh: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  },

  loadURDF: function (urdfUrl) {
    var self = this;
    var el = this.el;
    var urdfLoader = this.urdfLoader;

    urdfLoader.load(urdfUrl, function (object) {
      self.model = object;
      el.setObject3D('mesh', object);
      el.emit('model-loaded', { format: 'obj', model: object });
    });
  }
});