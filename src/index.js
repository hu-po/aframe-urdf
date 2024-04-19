// For more info on components see:
// https://aframe.io/docs/1.5.0/introduction/writing-a-component.html
// Inspired by README examples from:
// https://www.npmjs.com/package/urdf-loader
// Inspired by A-Frame OBJ Loader Component:
// https://github.com/aframevr/aframe/blob/0b7aa6a0575c03963636b02ab24a9fc2658a747c/src/components/obj-model.js

import URDFLoader from 'urdf-loader';


AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'asset' }
  },

  init: function () {
    console.log('URDF Component Initialized');
    this.model = null;
    this.urdfLoader = new URDFLoader();
  },

  update: function (oldData) {
    var data = this.data;
    if (!data.url) { return; }
    this.resetMesh();
    this.loadURDF(data.url);
    // this.model.setJointValue( jointName, jointAngle );
  },

  remove: function () {
    this.resetMesh();
  },

  resetMesh: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  },

  loadURDF: function (urdfUrl) {
    console.log('Loading URDF from: ' + urdfUrl);
    var self = this;
    var el = this.el;
    var urdfLoader = this.urdfLoader;

    urdfLoader.load(urdfUrl, function (object) {
      self.model = object;
      // print out the type of object
      console.log('URDF Object Type: ' + object.type);
      // number of links in the URDF
      console.log('Number of Links: ' + Object.keys(object.links).length);
      console.log('Number of Joints: ' + Object.keys(object.joints).length);
      console.log('Number of Colliders: ' + Object.keys(object.colliders).length);
      console.log('Number of Visuals: ' + Object.keys(object.visual).length);
      // iteratively add each link
      Object.keys(object.links).forEach(key => {
        console.log('Adding Object3D for link: ' + key);
        const linkObject3D = object.links[key];
        console.log('Link Object3D: ' + linkObject3D.isObject3D);
        const newObject3D = new THREE.Object3D();
        console.log('New Object3D: ' + newObject3D.isObject3D);
        console.log('New Object3D: ' + newObject3D.type);
        console.log('Link Object3D: ' + newObject3D.copy(linkObject3D).isObject3D);
        console.log('Link Object3D: ' + newObject3D.copy(linkObject3D).type);
        // linkObject3D.type = 'THREE.Object3D';
        // console.log('Link Object3D: ' + linkObject3D.type);
        // TODO: Typecast to THREE.Object3D
        el.setObject3D('mesh', newObject3D.copy(linkObject3D));
      });
      el.emit('model-loaded', { format: 'urdf', model: object });
    });
  }
});