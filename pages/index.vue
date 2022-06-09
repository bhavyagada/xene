<template>
  <v-layout column align-center>
    <div class="fakeMenu">
      <div class="fakeButtons fakeClose"></div>
      <div class="fakeButtons fakeMinimize"></div>
      <div class="fakeButtons fakeZoom"></div>
    </div>
    <div class="fakeScreen">
      <p class="line1">
        $ Hello, friend. Are you ready?
        <span class="cursor1">_</span>
      </p>
      <p class="line2">
        [?] Level up your logical abilities?
        <span class="cursor2">_</span>
      </p>
      <p class="line3">
        Buckle up to start.
        <span class="cursor3">_</span>
      </p>
      <p class="line4">
        > Boot up a radical programming platform
        <span class="cursor4">_</span>
      </p>
    </div>
    <canvas></canvas>
    <br />
    <div class="btn" @click="beginAction">
      <span>Let's Begin</span>
      <div class="dot"></div>
    </div>
    
    <overlay-loader />

  </v-layout>
</template>

<script>
import * as THREE from 'three'
import { noise } from 'perlin'
import OverlayLoader from '~/components/OverlayLoader.vue'

export default {
  head() {
    return {
      title: process.env.PROJECT_NAME + ' - Home'
    }
  },
  components: {
    OverlayLoader,
  },
  methods: {
    beginAction() {
      if (this.$auth.loggedIn) {
        this.$router.push('/challenges')
      } else {
        this.$auth.loginWith('auth0')
      }
    }
  },
  beforeCreate() {
    this.$store.dispatch('setLoading', true)
  },
  mounted() {
    var renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('canvas'),
      antialias: true,
      alpha: true
    })
    renderer.setClearColor(0xffffff, 0)
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1 : 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    var scene = new THREE.Scene()
    var camera = new THREE.PerspectiveCamera(
      15,
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
    camera.position.z = 60
    var length = 30
    var mouseJump = {
      x: 0,
      y: 0
    }
    var offset = 0
    function Spline() {
      this.geometry = new THREE.Geometry()
      this.color = Math.floor(Math.random() * 80 + 180)
      for (var j = 0; j < 180; j++) {
        this.geometry.vertices.push(
          new THREE.Vector3((j / 180) * length * 2 - length, 0, 0)
        )
        this.geometry.colors[j] = new THREE.Color(
          'hsl(' + (j * 0.6 + this.color) + ',70%,70%)'
        )
      }
      this.material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
      })
      this.mesh = new THREE.Line(this.geometry, this.material)
      this.speed = (Math.random() + 0.1) * 0.0002
      scene.add(this.mesh)
    }
    var isMouseDown = false
    var prevA = 0
    function render(a) {
      requestAnimationFrame(render)
      for (var i = 0; i < splines.length; i++) {
        for (var j = 0; j < splines[i].geometry.vertices.length; j++) {
          var vector = splines[i].geometry.vertices[j]
          vector.y =
            noise.simplex2(j * 0.05 + i - offset, a * splines[i].speed) * 8
          vector.z =
            noise.simplex2(vector.x * 0.05 + i, a * splines[i].speed) * 8

          vector.y *= 1 - Math.abs(vector.x / length)
          vector.z *= 1 - Math.abs(vector.x / length)
        }
        splines[i].geometry.verticesNeedUpdate = true
      }
      scene.rotation.x = a * 0.0003
      if (isMouseDown) {
        mouseJump.x += 0.001
        if (a - prevA > 100) {
          updateColor()
          prevA = a
        }
      } else {
        mouseJump.x -= 0.001
      }
      mouseJump.x = Math.max(0, Math.min(0.07, mouseJump.x))
      offset += mouseJump.x
      renderer.render(scene, camera)
    }
    var splines = []
    for (var i = 0; i < 12; i++) splines.push(new Spline())
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    function updateColor() {
      for (var i = 0; i < splines.length; i++) {
        var color = Math.abs((splines[i].color - offset * 10) % 360)
        for (var j = 0; j < splines[i].geometry.vertices.length; j++) {
          splines[i].mesh.geometry.colors[j] = new THREE.Color(
            'hsl(' + (j * 0.6 + color) + ',70%,70%)'
          )
        }
        splines[i].mesh.geometry.colorsNeedUpdate = true
      }
    }
    function onMouseDown(e) {
      isMouseDown = true
      return false
    }
    function onMouseUp() {
      isMouseDown = false
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onMouseDown)
    document.body.addEventListener('mousedown', onMouseDown)
    document.body.addEventListener('mouseup', onMouseUp)
    document.body.addEventListener('touchstart', onMouseDown)
    document.body.addEventListener('touchend', onMouseUp)
    requestAnimationFrame(render)
    setTimeout(() => this.$store.dispatch('setLoading', false), 1500)
  }
}
</script>

<style>
canvas {
  position: relative;
  top: 0;
  left: 0;
  cursor: pointer;
  width: 100% !important;
  height: 35vh !important;
}
:root {
  --bg: #3c465c;
  --primary: #1de9b6;
  --solid: #fff;
  --btn-w: 10em;
  --dot-w: calc(var(--btn-w) * 0.2);
  --tr-X: calc(var(--btn-w) - var(--dot-w));
  --hover-color-font: #1de9b6;
  background-color: black;
}
* {
  box-sizing: border-box;
}
*:before,
*:after {
  box-sizing: border-box;
}

.btn {
  position: relative;
  margin: 0 auto;
  cursor: pointer;
  width: var(--btn-w);
  color: var(--primary);
  border: 0.15em solid var(--primary);
  border-radius: 5em;
  text-align: center;
  font-size: 1.3em;
  line-height: 2em;
  font-family: Consolas, monospace;
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}

.btn:hover,
.btn:focus,
.btn:active {
  background-color: var(--hover-color-font);
  color: white;
  transition: all 0.5s ease;
  border-color: var(--hover-color-font);
}
.btn span {
  color: var(--primary);
}
.btn:hover span {
  color: #121212;
}
.dot {
  content: '';
  position: absolute;
  top: 0;
  width: var(--dot-w);
  height: 100%;
  border-radius: 100%;
  -webkit-transition: all 300ms ease;
  transition: all 300ms ease;
  display: none;
}
.dot:after {
  content: '';
  position: absolute;
  left: calc(50% - 0.4em);
  top: -0.4em;
  height: 0.8em;
  width: 0.8em;
  background: var(--primary);
  border-radius: 1em;
  border: 0.25em solid var(--solid);
  box-shadow: 0 0 0.7em var(--solid), 0 0 2em var(--primary);
}

.btn .dot {
  -webkit-animation: atom 2s infinite linear;
  animation: atom 2s infinite linear;
  display: block;
}
@-webkit-keyframes atom {
  0% {
    -webkit-transform: translateX(0) rotate(0);
    transform: translateX(0) rotate(0);
  }
  30% {
    -webkit-transform: translateX(var(--tr-X)) rotate(0);
    transform: translateX(var(--tr-X)) rotate(0);
  }
  50% {
    -webkit-transform: translateX(var(--tr-X)) rotate(180deg);
    transform: translateX(var(--tr-X)) rotate(180deg);
  }
  80% {
    -webkit-transform: translateX(0) rotate(180deg);
    transform: translateX(0) rotate(180deg);
  }
  100% {
    -webkit-transform: translateX(0) rotate(360deg);
    transform: translateX(0) rotate(360deg);
  }
}
@keyframes atom {
  0% {
    -webkit-transform: translateX(0) rotate(0);
    transform: translateX(0) rotate(0);
  }
  30% {
    -webkit-transform: translateX(var(--tr-X)) rotate(0);
    transform: translateX(var(--tr-X)) rotate(0);
  }
  50% {
    -webkit-transform: translateX(var(--tr-X)) rotate(180deg);
    transform: translateX(var(--tr-X)) rotate(180deg);
  }
  80% {
    -webkit-transform: translateX(0) rotate(180deg);
    transform: translateX(0) rotate(180deg);
  }
  100% {
    -webkit-transform: translateX(0) rotate(360deg);
    transform: translateX(0) rotate(360deg);
  }
}

/* Console */

.fakeButtons {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  border: 1px solid #000;
  position: relative;
  /* top: 2px; */
  left: 6px;
  background-color: #ff3b47;
  border-color: #9d252b;
  display: inline-block;
}

.fakeMinimize {
  left: 11px;
  background-color: #ffc100;
  border-color: #9d802c;
}

.fakeZoom {
  left: 16px;
  background-color: #00d742;
  border-color: #049931;
}

.fakeMenu {
  width: 100%;
  box-sizing: border-box;
  height: 20px;
  background-color: #bbb;
  margin: 0 auto;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
}

.fakeScreen {
  background-color: #151515;
  box-sizing: border-box;
  width: 100%;
  height: 25vh;
  margin: 0 auto;
  padding: 10px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
p {
  position: relative;
  text-align: left;
  font-family: Consolas, monospace;
  overflow: hidden;
  width: 0;
  font-size: 0.8em;
  white-space: nowrap;
}

span {
  color: #fff;
  font-weight: bold;
}

.line1 {
  color: #6cd0c6;
  -webkit-animation: type 2s 2s steps(50, end) forwards;
  -moz-animation: type 2s 2s steps(50, end) forwards;
  -o-animation: type 2s 2s steps(50, end) forwards;
  animation: type 2s 2s steps(50, end) forwards;
}

.cursor1 {
  -webkit-animation: blink 1s 2s 2 forwards;
  -moz-animation: blink 1s 2s 2 forwards;
  -o-animation: blink 1s 2s 2 forwards;
  animation: blink 1s 2s 2 forwards;
}

.line2 {
  color: yellow;
  -webkit-animation: type 2s 4s steps(50, end) forwards;
  -moz-animation: type 2s 4s steps(50, end) forwards;
  -o-animation: type 2s 4s steps(50, end) forwards;
  animation: type 2s 4s steps(50, end) forwards;
}

.cursor2 {
  -webkit-animation: blink 1s 4s 2 2 forwards;
  -moz-animation: blink 1s 4s 2 2 forwards;
  -o-animation: blink 1s 4s 2 2 forwards;
  animation: blink 1s 4s 2 forwards;
}

.line3 {
  color: red;
  -webkit-animation: type 2s 6s steps(50, end) forwards;
  -moz-animation: type 2s 6s steps(50, end) forwards;
  -o-animation: type 2s 6s steps(50, end) forwards;
  animation: type 2s 6s steps(50, end) forwards;
}

.cursor3 {
  -webkit-animation: blink 1s 6s 2 forwards;
  -moz-animation: blink 1s 6s 2 forwards;
  -o-animation: blink 1s 6s 2 forwards;
  animation: blink 1s 6s 2 forwards;
}

.line4 {
  color: #9cd9f0;
  -webkit-animation: type 2s 8s steps(50, end) forwards;
  -moz-animation: type 2s 8s steps(50, end) forwards;
  -o-animation: type 2s 8s steps(50, end) forwards;
  animation: type 2s 8s steps(50, end) forwards;
}

.cursor4 {
  -webkit-animation: blink 1s 8s infinite;
  -moz-animation: blink 1s 8s infinite;
  -o-animation: blink 1s 8s infinite;
  animation: blink 1s 8s infinite;
}

@-webkit-keyframes blink {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes blink {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-o-keyframes blink {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes blink {
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes type {
  to {
    width: 100%;
  }
}

@-moz-keyframes type {
  to {
    width: 100%;
  }
}

@-o-keyframes type {
  to {
    width: 100%;
  }
}

@keyframes type {
  to {
    width: 100%;
  }
}

/* 
  ##Device = Desktops
  ##Screen = 1281px to higher resolution desktops
*/

@media (min-width: 1281px) {
  canvas {
    height: 35vh !important;
  }
  p {
    font-size: 1.3em !important;
  }
  .fakeScreen {
    height: 30vh !important;
  }
}

/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) and (max-width: 1280px) {
   canvas {
    height: 35vh !important;
  }
  p {
    font-size: 1.3em !important;
  }
  .fakeScreen {
    height: 30vh !important;
  }
}

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (max-width: 1024px) {
  canvas {
    height: 40vh !important;
  }
  p {
    font-size: 1.8em !important;
  }
  .fakeScreen {
    height: 25vh !important;
  }
}

</style>