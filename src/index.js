// For more info on components see:
// https://aframe.io/docs/1.5.0/introduction/writing-a-component.html
// Inspired by README examples from:
// https://www.npmjs.com/package/urdf-loader
// Inspired by A-Frame OBJ Loader Component:
// https://github.com/aframevr/aframe/blob/0b7aa6a0575c03963636b02ab24a9fc2658a747c/src/components/obj-model.js
// Object3D definition
// https://threejs.org/docs/#api/en/core/Object3D

import URDFLoader from 'urdf-loader';
import { STLLoader } from './STLLoader';

AFRAME.registerComponent('urdf', {
  schema: {
    url: { type: 'asset' }
  },

  init: function () {
    console.log('URDF Component Initialized');
    this.model = null;
    this.urdfLoader = new URDFLoader();
    this.urdfLoader.parseVisual = true;
    this.urdfLoader.parseCollision = true;
    this.urdfLoader.loadMeshCb = function (path, manager, done) {
      console.log('Loading mesh from: ' + path);
      console.log('Manager: ' + manager.type);
      const loader = new STLLoader();
      loader.load(path, geom => {
        const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial());
        el.setObject3D('mesh', model);
        el.emit('model-loaded', { format: 'stl', model: model });
        done(mesh);
      });
    }

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
      // el.sceneEl.add(newObject3D);
      // number of links in the URDF
      console.log('Number of Links: ' + Object.keys(object.links).length);
      console.log('Number of Joints: ' + Object.keys(object.joints).length);
      // iteratively add each link
      Object.keys(object.links).forEach(key => {
        console.log('Adding Object3D for link: ' + key);
        // const originalObject3D = object.links[key];
        // console.log('Object position: ' + originalObject3D.position.x + ', ' + originalObject3D.position.y + ', ' + originalObject3D.position.z);
        // console.log('Object rotation: ' + originalObject3D.rotation.x + ', ' + originalObject3D.rotation.y + ', ' + originalObject3D.rotation.z);
        // console.log('Object scale: ' + originalObject3D.scale.x + ', ' + originalObject3D.scale.y + ', ' + originalObject3D.scale.z);
        // console.log('Object visible: ' + originalObject3D.visible);
        // console.log('Object children: ' + originalObject3D.children.length);

        const newObject3D = new THREE.Object3D().copy(object.links[key]);
        // console.log('Object position: ' + newObject3D.position.x + ', ' + newObject3D.position.y + ', ' + newObject3D.position.z);
        // console.log('Object rotation: ' + newObject3D.rotation.x + ', ' + newObject3D.rotation.y + ', ' + newObject3D.rotation.z);
        // console.log('Object scale: ' + newObject3D.scale.x + ', ' + newObject3D.scale.y + ', ' + newObject3D.scale.z);
        // console.log('Object visible: ' + newObject3D.visible);
        // console.log('Object children: ' + newObject3D.children.length);
        el.setObject3D(key, newObject3D);
      });
      el.emit('model-loaded', { format: 'urdf', model: object });
    });
  }
});