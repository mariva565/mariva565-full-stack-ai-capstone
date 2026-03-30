"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1b26);
    scene.fog = new THREE.Fog(0x1a1b26, 15, 60);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 5, 30);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
      precision: "lowp",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    containerRef.current.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1.5, 40);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 1.5, 40);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Brand colors (matching original)
    const brandColors = [0x6366f1, 0xec4899, 0x06b6d4, 0xa855f7, 0x22c55e];

    // Particles
    const particleCount = 200;
    const pGeometry = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const colorOptions = [
      new THREE.Color(0x6366f1),
      new THREE.Color(0xec4899),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
    ];

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 100;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
    }
    pGeometry.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeometry.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const pMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(pGeometry, pMaterial);
    scene.add(particles);

    // Books
    const books: any[] = [];
    for (let i = 0; i < 8; i++) {
      const bookGroup = new THREE.Group();
      const coverGeometry = new THREE.BoxGeometry(2, 3, 0.4);
      const coverMaterial = new THREE.MeshLambertMaterial({ color: brandColors[i % brandColors.length] });
      const cover = new THREE.Mesh(coverGeometry, coverMaterial);
      bookGroup.add(cover);

      const pagesGeometry = new THREE.BoxGeometry(1.8, 2.8, 0.35);
      const pagesMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5dc });
      const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
      pages.position.x = 0.05;
      bookGroup.add(pages);

      const angle = (i / 12) * Math.PI * 4;
      const radius = 8 + Math.random() * 15;
      const height = (Math.random() - 0.5) * 20;

      bookGroup.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      bookGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI * 0.5);

      bookGroup.userData = {
        originalY: bookGroup.position.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        rotationSpeed: 0.1 + Math.random() * 0.2,
      };

      books.push(bookGroup);
      scene.add(bookGroup);
    }

    // Geometric shapes
    const geometricShapes: any[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1.5, 0),
      new THREE.OctahedronGeometry(1.5),
      new THREE.TetrahedronGeometry(1.5),
      new THREE.DodecahedronGeometry(1.2),
      new THREE.TorusGeometry(1, 0.4, 16, 32),
      new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8),
    ];

    for (let i = 0; i < 10; i++) {
      const geometry = geometries[i % geometries.length];
      const material = new THREE.MeshLambertMaterial({
        color: brandColors[i % brandColors.length],
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const angle = (i / 18) * Math.PI * 6;
      const radius = 5 + Math.random() * 20;
      const height = (Math.random() - 0.5) * 30;

      mesh.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      mesh.userData = {
        originalY: mesh.position.y,
        floatSpeed: 0.3 + Math.random() * 0.7,
        rotationSpeedX: (Math.random() - 0.5) * 0.02,
        rotationSpeedY: (Math.random() - 0.5) * 0.02,
        rotationSpeedZ: (Math.random() - 0.5) * 0.02,
      };

      geometricShapes.push(mesh);
      scene.add(mesh);
    }

    // Camera path
    const cameraPath: any[] = [];
    const numPoints = 50;
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 4;
      const radius = 15 + Math.sin(t * Math.PI * 2) * 6;
      const height = 5 + Math.sin(t * Math.PI * 3) * 8;
      cameraPath.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }

    let pathIndex = 0;
    let isAnimating = true;
    let requestRef: number;

    const animate = () => {
      if (!isAnimating) return;
      requestRef = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      books.forEach((book) => {
        book.position.y = book.userData.originalY + Math.sin(time * book.userData.floatSpeed * 0.3) * 0.5;
        book.rotation.y += book.userData.rotationSpeed * 0.002;
      });

      geometricShapes.forEach((shape) => {
        shape.position.y = shape.userData.originalY + Math.sin(time * shape.userData.floatSpeed * 0.3) * 0.6;
        shape.rotation.x += shape.userData.rotationSpeedX * 0.2;
        shape.rotation.y += shape.userData.rotationSpeedY * 0.2;
        shape.rotation.z += shape.userData.rotationSpeedZ * 0.2;
      });

      if (particles) {
        particles.rotation.y = time * 0.004;
      }

      // Camera movement
      pathIndex = (pathIndex + 0.002) % cameraPath.length;
      const currentIndex = Math.floor(pathIndex);
      const nextIndex = (currentIndex + 1) % cameraPath.length;
      const lerpFactor = pathIndex - currentIndex;

      const currentPos = cameraPath[currentIndex];
      const nextPos = cameraPath[nextIndex];
      if (currentPos && nextPos) {
        camera.position.lerpVectors(currentPos, nextPos, lerpFactor);
      }

      targetLookAt.x = Math.sin(time * 0.1) * 3;
      targetLookAt.y = Math.cos(time * 0.08) * 2;
      targetLookAt.z = Math.sin(time * 0.12) * 3;
      camera.lookAt(targetLookAt);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Pause when not visible
    const handleVisibility = () => {
      if (document.hidden) {
        isAnimating = false;
        if (requestRef) cancelAnimationFrame(requestRef);
        clock.stop();
      } else {
        isAnimating = true;
        clock.start();
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!isAnimating) {
            isAnimating = true;
            clock.start();
            animate();
          }
        } else {
          isAnimating = false;
          if (requestRef) cancelAnimationFrame(requestRef);
          clock.stop();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(renderer.domElement);

    return () => {
      isAnimating = false;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (requestRef) cancelAnimationFrame(requestRef);
      renderer.dispose();
      observer.disconnect();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isLoaded]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => setIsLoaded(true)}
      />
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: isLoaded ? 1 : 0 }}
        id="hero-canvas"
      />
    </>
  );
}
