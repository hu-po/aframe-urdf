# aframe-urdf

Use URDF in A-Frame. Based on the popular 

- [urdf-loaders](https://github.com/gkjohnson/urdf-loaders) by @gkjohnson
- [A-Frame](https://aframe.io) by @aframevr

## Usage

Drop in the URDF component:

```html
<head>
  <title>My A-Frame Scene</title>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <!-- Option (A) from NPM package -->
    <script src="https://unpkg.com/aframe-urdf@0.1.0/dist/urdf.min.js"></script>
    <!-- Option (B) from GitHub -->
    <script src="https://raw.githubusercontent.com/hu-popo/aframe-urdf/main/dist/urdf.min.js"></script>
    ...
</head>

<body>
  <a-scene>
    ...
    <a-entity id="robot" urdf="url: path/to/robot.urdf; mtl: #default-mtl"></a-entity>
  </a-scene>
</body>
```

## Setup

install using `npm`

[![npm version](https://img.shields.io/npm/v/aframe-urdf.svg?style=flat-square)](https://www.npmjs.com/package/aframe-urdf)

```sh
npm install aframe-urdf
```

## Local Development

basic loop is

```
npm install
npm run build
npm run dev
```

open `http://localhost:8080` in your browser, use ctrl-alt-i to open the inspector

to test on a VR headset

```
npm run build
npm run start
```

open `https://localhost:8080` in your VR browser, click "Enter VR" in the bottom right corner

## Notes

This currently only supports URDFs that use `.obj` files or primitives like boxes, spheres, and cylinders. The example provided is based on a [3DoF arm](https://spart.readthedocs.io/en/latest/_images/SC_3DoF.png), and has also been debugged with the [Stompy Humanoid](https://kscale.dev/).

## Citation

```
@misc{aframe-urdf-2024,
  title={A-Frame URDF},
  author={Hugo Ponte},
  year={2024},
  url={https://github.com/hu-po/aframe-urdf}
}
```