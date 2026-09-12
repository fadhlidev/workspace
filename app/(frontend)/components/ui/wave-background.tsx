"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

interface WaveConfig {
  fov: number;
  cameraZ: number;
  tubeRadius: number;
  resY: number;
  resX: number;
  noiseCoef: number;
  timeCoef: number;
  heightCoef: number;
  ambientColor: number;
  lightIntensity: number;
  light1Color: number;
  light2Color: number;
  light3Color: number;
  light4Color: number;
}

interface NoiseConfig {
  coef: number;
  height: number;
  time: number;
  mouseX: number;
  mouseY: number;
  mouse: number;
}

interface FrenetFrames {
  tangents: THREE.Vector3[];
  normals: THREE.Vector3[];
  binormals: THREE.Vector3[];
}

class CustomCurve extends THREE.Curve<THREE.Vector3> {
  x: number;
  y: number;
  l: number;
  noise: NoiseConfig;
  yn: number;
  noise2D: (x: number, y: number) => number;

  constructor(
    x: number,
    y: number,
    l: number,
    noise: NoiseConfig,
    noise2D: (x: number, y: number) => number,
  ) {
    super();
    this.x = x;
    this.y = y;
    this.l = l;
    this.noise = noise;
    this.noise2D = noise2D;
    this.yn = this.y * this.noise.coef;
  }

  getPoint(t: number, optionalTarget?: THREE.Vector3): THREE.Vector3 {
    const point = optionalTarget || new THREE.Vector3();
    const x = this.x + t * this.l;
    const xn = x * this.noise.coef;
    const noise1 = this.noise2D(
      xn + this.noise.time,
      this.yn - this.noise.time,
    );
    const noise2 = this.noise2D(
      this.yn + this.noise.time,
      xn - this.noise.time,
    );
    const z = noise2 * this.noise.height;
    const y = this.y + noise1 * this.noise.height;
    return point.set(x, y, z);
  }
}

class Tube {
  segments: number;
  radialSegments: number;
  radius: number;
  curve: CustomCurve;
  geometry: THREE.TubeGeometry;
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;
  frames?: FrenetFrames;
  colorArray: Float32Array;
  flowSpeed: number;
  flowPhase: number;

  constructor(
    x: number,
    y: number,
    l: number,
    segments: number,
    radius: number,
    flowSpeed: number,
    flowPhase: number,
    noise: NoiseConfig,
    noise2D: (x: number, y: number) => number,
  ) {
    this.segments = segments;
    this.radialSegments = 8;
    this.radius = radius;
    this.flowSpeed = flowSpeed;
    this.flowPhase = flowPhase;

    this.curve = new CustomCurve(x, y, l, noise, noise2D);
    this.geometry = new THREE.TubeGeometry(
      this.curve,
      segments,
      radius,
      this.radialSegments,
      false,
    );

    // Initialize vertex colors for flowing light pulse
    const vertexCount = (segments + 1) * (this.radialSegments + 1);
    this.colorArray = new Float32Array(vertexCount * 3);
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.colorArray, 3),
    );

    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      metalness: 0.8,
      roughness: 0.2,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  update(timeSec: number) {
    this.frames = this.curve.computeFrenetFrames(this.segments, false);
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const normAttr = this.geometry.attributes.normal as THREE.BufferAttribute;
    const colorAttr = this.geometry.attributes.color as THREE.BufferAttribute;
    const pArray = posAttr.array as Float32Array;
    const nArray = normAttr.array as Float32Array;
    const cArray = colorAttr.array as Float32Array;
    const normal = new THREE.Vector3();

    const flowProgress = (timeSec * this.flowSpeed + this.flowPhase) % 1.0;

    for (let i = 0; i <= this.segments; i++) {
      const t = i / this.segments;
      const P = this.curve.getPointAt(t);
      const N = this.frames.normals[i];
      const B = this.frames.binormals[i];

      // Flowing white light pulse calculation along line segment t
      let dist1 = Math.abs(t - flowProgress);
      dist1 = Math.min(dist1, 1.0 - dist1);

      let dist2 = Math.abs(t - ((flowProgress + 0.5) % 1.0));
      dist2 = Math.min(dist2, 1.0 - dist2);

      const minDist = Math.min(dist1, dist2);
      const pulseWidth = 0.2;
      const pulse =
        minDist < pulseWidth ? Math.pow(1.0 - minDist / pulseWidth, 1.6) : 0;

      // Surface flowing pulse is striking white (1.0), inside/body drops to near 0 (0.01)
      const r = 0.01 + 0.99 * pulse;
      const g = 0.01 + 0.99 * pulse;
      const b = 0.02 + 0.98 * pulse;

      for (let j = 0; j <= this.radialSegments; j++) {
        const v = (j / this.radialSegments) * Math.PI * 2;
        const sin = Math.sin(v);
        const cos = -Math.cos(v);
        normal.x = cos * N.x + sin * B.x;
        normal.y = cos * N.y + sin * B.y;
        normal.z = cos * N.z + sin * B.z;
        normal.normalize();

        const index = (i * (this.radialSegments + 1) + j) * 3;
        nArray[index] = normal.x;
        nArray[index + 1] = normal.y;
        nArray[index + 2] = normal.z;

        pArray[index] = P.x + this.radius * normal.x;
        pArray[index + 1] = P.y + this.radius * normal.y;
        pArray[index + 2] = P.z + this.radius * normal.z;

        cArray[index] = r;
        cArray[index + 1] = g;
        cArray[index + 2] = b;
      }
    }
    posAttr.needsUpdate = true;
    normAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  }
}

export function WaveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const noise2D = createNoise2D();

    const conf: WaveConfig = {
      fov: 75,
      cameraZ: 200,
      tubeRadius: 0.22,
      resY: 11.5,
      resX: 3,
      noiseCoef: 50,
      timeCoef: 50,
      heightCoef: 20,
      ambientColor: 0xcccccc,
      lightIntensity: 2,
      light1Color: 0xffffff,
      light2Color: 0xffffff,
      light3Color: 0xffffff,
      light4Color: 0xffffff,
    };

    let animFrameId: number;

    let wWidth = 0;
    let wHeight = 0;

    let light1: THREE.PointLight;
    let light2: THREE.PointLight;
    let light3: THREE.PointLight;
    let light4: THREE.PointLight;

    const objects: Tube[] = [];
    const noiseConf: NoiseConfig = {
      coef: 0,
      height: 0,
      time: 0,
      mouseX: 0,
      mouseY: 0,
      mouse: 0,
    };

    const getRendererSize = (): [number, number] => {
      const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
      const vFOV = (cam.fov * Math.PI) / 180;
      const h = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
      const w = h * cam.aspect;
      return [w, h];
    };

    const updateNoise = () => {
      noiseConf.coef = conf.noiseCoef * 0.00012;
      noiseConf.height = conf.heightCoef;
      noiseConf.time = Date.now() * conf.timeCoef * 0.00000025;
    };

    const updateSize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      if (renderer && camera) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const [w, h] = getRendererSize();
        wWidth = w;
        wHeight = h;
      }
    };

    const initObjects = () => {
      updateNoise();
      const nx = Math.round(wWidth / conf.resX) + 1;
      const ny = Math.round((wHeight * 2) / conf.resY) + 1;

      const baseSpeed = 0.065; // Slightly faster flow speed

      for (let j = 0; j < ny; j++) {
        conf.tubeRadius = window.innerWidth >= 1024 ? 0.22 : 0.15;

        // Group neighboring lines into wave clusters (e.g. groups of 3-4 lines flowing together)
        const groupIndex = Math.floor(j / 3);
        const flowPhase = (groupIndex * 0.15) % 1.0;
        const flowSpeed = baseSpeed + (groupIndex % 3) * 0.003;

        const tube = new Tube(
          -wWidth,
          -wHeight + j * conf.resY,
          wWidth * 2,
          nx,
          conf.tubeRadius,
          flowSpeed,
          flowPhase,
          noiseConf,
          noise2D,
        );
        tube.mesh.rotation.set(0, 0, 15);
        objects.push(tube);
        scene.add(tube.mesh);
      }
    };

    const initScene = () => {
      scene = new THREE.Scene();
      // Keep canvas transparent for blending with background

      scene.add(new THREE.AmbientLight(conf.ambientColor, 1.2));

      const z = 50;
      const lightDistance = window.innerWidth >= 1024 ? 150 : 75;

      light1 = new THREE.PointLight(
        conf.light1Color,
        conf.lightIntensity,
        lightDistance,
      );
      light1.position.set(0, wHeight / 2, z);
      scene.add(light1);

      light2 = new THREE.PointLight(
        conf.light2Color,
        conf.lightIntensity,
        lightDistance,
      );
      light2.position.set(0, -wHeight / 2, z);
      scene.add(light2);

      light3 = new THREE.PointLight(
        conf.light3Color,
        conf.lightIntensity,
        lightDistance,
      );
      light3.position.set(wWidth / 2, 0, z);
      scene.add(light3);

      light4 = new THREE.PointLight(
        conf.light4Color,
        conf.lightIntensity,
        lightDistance,
      );
      light4.position.set(-wWidth / 2, 0, z);
      scene.add(light4);

      camera.position.z = 150;

      initObjects();
    };

    const animateLights = () => {
      const time = Date.now() * 0.001;
      const dx = wWidth / 2;
      const dy = wHeight / 2;

      light1.position.x = Math.sin(time * 0.1) * dx;
      light1.position.y = Math.cos(time * 0.2) * dy;

      light2.position.x = Math.cos(time * 0.3) * dx;
      light2.position.y = Math.sin(time * 0.4) * dy;

      light3.position.x = Math.sin(time * 0.5) * dx;
      light3.position.y = Math.sin(time * 0.6) * dy;

      light4.position.x = Math.sin(time * 0.7) * dx;
      light4.position.y = Math.cos(time * 0.8) * dy;
    };

    const animateObjects = (timeSec: number) => {
      updateNoise();
      for (let i = 0; i < objects.length; i++) {
        objects[i].update(timeSec);
      }
    };

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const timeSec = Date.now() * 0.001;
      animateObjects(timeSec);
      animateLights();
      renderer.render(scene, camera);
    };

    // Initialize WebGLRenderer & Camera
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(conf.fov);
    camera.position.z = conf.cameraZ;

    let scene: THREE.Scene;

    updateSize();
    initScene();
    animate();

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);

      if (renderer && renderer.domElement) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      objects.forEach((obj) => {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
