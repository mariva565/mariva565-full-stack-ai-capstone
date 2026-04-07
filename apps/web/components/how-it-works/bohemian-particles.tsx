"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { useVisibleAnimation } from "../ui/use-visible-animation";

/**
 * Bohemian Particles — Three.js particle field (v1 port).
 * 500 particles in a spherical distribution with wave motion,
 * glow layer, pulsing opacity. Visibility-gated, tab-aware,
 * reduced-motion safe.
 */
export function BohemianParticles() {
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
    const cleanup = initParticles(container, shouldAnimate);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Forward visibility changes to the scene */
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
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Three.js scene                                                     */
/* ------------------------------------------------------------------ */

function initParticles(container: HTMLElement, shouldAnimate: boolean) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* Ensure canvas fills the container (v1: .bohemian-particles-canvas) */
  const canvas = renderer.domElement;
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  container.appendChild(canvas);

  /* ---- Colour palette (v1-exact) ---- */
  const colors = [
    new THREE.Color(0xffffff), // White
    new THREE.Color(0xe0e7ff), // Very light indigo
    new THREE.Color(0xcffafe), // Very light cyan
    new THREE.Color(0xf3e8ff), // Very light purple
    new THREE.Color(0xd8b4fe), // Light lavender
  ];

  /* ---- Particles ---- */
  const count = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colorsArr = new Float32Array(count * 3);
  const originalPositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 3 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const c = colors[Math.floor(Math.random() * colors.length)];
    colorsArr[i3] = c.r;
    colorsArr[i3 + 1] = c.g;
    colorsArr[i3 + 2] = c.b;

    originalPositions[i3] = positions[i3];
    originalPositions[i3 + 1] = positions[i3 + 1];
    originalPositions[i3 + 2] = positions[i3 + 2];
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));

  const sprite = createCircleTexture();

  /* Main particles */
  const material = new THREE.PointsMaterial({
    size: 0.15,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  /* Glow layer (shares geometry) */
  const glowMaterial = new THREE.PointsMaterial({
    size: 0.4,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowParticles = new THREE.Points(geometry, glowMaterial);
  scene.add(glowParticles);

  /* ---- Animation loop ---- */
  const clock = new THREE.Clock();
  let frameId: number | null = null;
  let visible = true;

  function animate() {
    if (!visible) return;
    frameId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    const pos = particles.geometry.attributes.position.array as Float32Array;

    if (shouldAnimate) {
      /* Wave effect (v1-exact) */
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];

        pos[i3] = ox + Math.sin(t * 0.5 + ox * 0.5) * 0.3;
        pos[i3 + 1] = oy + Math.cos(t * 0.7 + oy * 0.5) * 0.3;
        pos[i3 + 2] = oz + Math.sin(t * 0.3 + oz * 0.5) * 0.2;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      /* Rotation */
      particles.rotation.y = t * 0.05;
      glowParticles.rotation.y = t * 0.05;

      /* Pulsing opacity */
      const pulse = Math.sin(t * 0.8) * 0.2 + 0.8;
      material.opacity = 0.6 * pulse;
      glowMaterial.opacity = 0.3 * pulse;
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

  /* Visibility gating */
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

  /* Cleanup */
  return () => {
    stop();
    container.removeEventListener("scene-visibility", onSceneVisibility);
    document.removeEventListener("visibilitychange", onTabVisibility);
    window.removeEventListener("resize", onResize);

    geometry.dispose();
    material.dispose();
    glowMaterial.dispose();
    sprite.dispose();
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}

/* ---- Soft circle texture (v1-exact) ---- */
function createCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.8)");
  g.addColorStop(0.5, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
