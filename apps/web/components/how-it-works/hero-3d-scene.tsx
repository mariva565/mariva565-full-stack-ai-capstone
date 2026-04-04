"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { useVisibleAnimation } from "../ui/use-visible-animation";

/** Holographic mascot: 3 torus rings + mascot + particle orbs (v1 port).
 *  Visibility-gated, tab-aware, reduced-motion safe. */
export function Hero3dScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { ref: obsRef, isVisible, shouldAnimate } =
    useVisibleAnimation<HTMLDivElement>({ threshold: 0.1 });

  const setRefs = (el: HTMLDivElement | null) => {
    wrapRef.current = el;
    (obsRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  useEffect(() => {
    const container = wrapRef.current;
    if (!container || container.querySelector("canvas")) return;
    const cleanup = initScene(container, shouldAnimate);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = wrapRef.current;
    if (!container) return;
    container.dispatchEvent(
      new CustomEvent("scene-visibility", { detail: { visible: isVisible } })
    );
  }, [isVisible]);

  return (
    <div
      ref={setRefs}
      className="relative mx-auto aspect-square w-full max-w-[500px]"
    />
  );
}

function initScene(container: HTMLElement, shouldAnimate: boolean) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Mascot sprite
  const mascotGeo = new THREE.PlaneGeometry(3.0, 3.0);
  const mascotMat = new THREE.MeshBasicMaterial({
    transparent: true, alphaTest: 0.08, depthTest: true, depthWrite: false, side: THREE.FrontSide,
  });
  const mascot = new THREE.Mesh(mascotGeo, mascotMat);
  mascot.renderOrder = 2;
  mascot.visible = false;
  scene.add(mascot);

  const loader = new THREE.TextureLoader();
  const textureCandidates = [
    "/assets/v1/mascot-transparent-background.png",
    "/assets/v1/mascot-robot.png",
    "/assets/v1/about-mascot.png",
  ];

  function tryLoadTexture(index: number) {
    if (index >= textureCandidates.length) return;
    loader.load(
      textureCandidates[index],
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        mascotMat.map = tex;
        mascotMat.needsUpdate = true;
        mascot.visible = true;
      },
      undefined,
      () => tryLoadTexture(index + 1)
    );
  }
  tryLoadTexture(0);

  // Atomic rings (torus)
  const ringConfigs = [
    {
      radius: 2.2,
      tube: 0.04,
      color: 0x9d4edd,
      speed: 0.5,
      axis: new THREE.Vector3(1, 1, 0).normalize(),
    },
    {
      radius: 2.8,
      tube: 0.03,
      color: 0xffc2d1,
      speed: -0.4,
      axis: new THREE.Vector3(1, -1, 0).normalize(),
    },
    {
      radius: 3.4,
      tube: 0.03,
      color: 0x22d3ee,
      speed: 0.3,
      axis: new THREE.Vector3(0, 1, 0.5).normalize(),
    },
  ];

  const pivots: THREE.Object3D[] = [];

  ringConfigs.forEach((cfg) => {
    const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 50);
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(geo, mat);
    const pivot = new THREE.Object3D();
    pivot.add(ring);
    ring.rotation.x = Math.PI / 2;
    pivot.userData = { axis: cfg.axis, speed: cfg.speed };
    pivot.rotateOnAxis(cfg.axis, Math.random() * Math.PI);
    scene.add(pivot);
    pivots.push(pivot);
  });

  // Particles
  const particleCount = 30;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 8;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const particlesTex = createSoftParticleTexture();
  const particlesMat = new THREE.PointsMaterial({
    size: 0.2,
    map: particlesTex,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Animation loop
  const clock = new THREE.Clock();
  let frameId: number | null = null;
  let visible = true;

  function animate() {
    if (!visible) return;
    frameId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    // Mascot float
    mascot.position.y = Math.sin(t * 0.8) * 0.15;

    if (shouldAnimate) {
      // Rotate rings
      pivots.forEach((p) => {
        const a = p.userData.axis as THREE.Vector3;
        const s = (p.userData.speed as number) * 0.02;
        p.rotateOnAxis(a, s);
      });
      // Particles slow rotation
      particles.rotation.y = t * 0.05;
    }

    renderer.render(scene, camera);
  }

  function start() {
    visible = true;
    clock.start();
    if (frameId === null) animate();
  }

  function stop() {
    visible = false;
    clock.stop();
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  start();

  const onSceneVisibility = (e: Event) => {
    const { visible: v } = (e as CustomEvent).detail;
    if (v && !document.hidden) start();
    else stop();
  };
  container.addEventListener("scene-visibility", onSceneVisibility);

  const onTabVisibility = () => {
    if (document.hidden) stop();
    else {
      const rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) start();
    }
  };
  document.addEventListener("visibilitychange", onTabVisibility);

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  return () => {
    stop();
    container.removeEventListener("scene-visibility", onSceneVisibility);
    document.removeEventListener("visibilitychange", onTabVisibility);
    window.removeEventListener("resize", onResize);

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat) => mat.dispose());
      }
    });
    particlesTex.dispose();
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}

function createSoftParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
