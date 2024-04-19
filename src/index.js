import { LoaderUtils } from 'three';
import { XacroLoader } from 'xacro-parser';
import URDFLoader from 'urdf-loader';

// For more info on components see:
// https://aframe.io/docs/1.5.0/introduction/writing-a-component.html
AFRAME.registerComponent('urdf', {
  init: function () {
    console.log('Hello, World!');
  },

  update: function (oldData) {
    // Loading the URDF from .xlm file
    // https://www.npmjs.com/package/urdf-loader
    const loader = new URDFLoader();
    loader.load(this.data, (robot) => {
      this.el.setObject3D('mesh', robot);
    });
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  }
});