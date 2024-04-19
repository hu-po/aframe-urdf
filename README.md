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
    <a-urdf url="path/to/robot.urdf"></a-urdf>
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

click the link to open a browser with the example page, use ctrl-alt-i to open the inspector

[Publish to npm](https://aframe.io/docs/1.5.0/introduction/writing-a-component.html#publishing-a-component)
https://www.npmjs.com/package/angle

```
npm install -g angle
npm run dev
npm publish
```