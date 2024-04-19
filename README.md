# aframe-urdf

Use URDF in A-Frame. Based on the popular 

- [urdf-loaders](https://github.com/gkjohnson/urdf-loaders) by @gkjohnson
- [A-Frame](https://aframe.io) by @aframevr

## Usage

Drop in the URDF component and plug into your HTML:

```html
<head>
  <title>My A-Frame Scene</title>
    <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
    <!-- Option (A) from NPM package -->
    <script src="https://unpkg.com/aframe-urdf@1.0.0/dist/urdf.min.js"></script>
    <!-- Option (B) from GitHub -->
    <script src="https://raw.githubusercontent.com/hu-popo/aframe-urdf/main/dist/urdf.min.js"></script>
    ...
</head>

<body>
  <a-scene>
    ...
    <a-urdf material="shader: gradient; topColor: 255 0 0; bottomColor: 0 121 255;"></a-urdf>
  </a-scene>
</body>
```

## Setup

Install using `npm`

[![npm version](https://img.shields.io/npm/v/aframe-urdf.svg?style=flat-square)](https://www.npmjs.com/package/aframe-urdf)

```sh
npm install aframe-urdf
```

## Local Development

```
npm install
npm run build
```
