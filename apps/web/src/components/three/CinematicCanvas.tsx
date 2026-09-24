'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CinematicCanvasProps {
  scrollProgress: number; // 0.0 to 1.0
  activeRoute: { from: string; to: string } | null;
}

export const CinematicCanvas: React.FC<CinematicCanvasProps> = ({ scrollProgress, activeRoute }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1e33, 0.008);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // --- 2. Lighting System ---
    const ambientLight = new THREE.AmbientLight(0xdff0ff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4facfe, 1.2);
    fillLight.position.set(-20, -10, -10);
    scene.add(fillLight);

    // --- 3. 3D Procedural Airliner Model ---
    const airlinerGroup = new THREE.Group();

    // Fuselage (Body)
    const bodyGeo = new THREE.CylinderGeometry(1.2, 1.1, 16, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.85,
      roughness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI / 2;
    airlinerGroup.add(bodyMesh);

    // Cockpit Nose Cone
    const noseGeo = new THREE.ConeGeometry(1.2, 3.5, 32);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x07111f,
      metalness: 0.9,
      roughness: 0.1,
    });
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.position.z = -9.75;
    airlinerGroup.add(noseMesh);

    // Main Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(11, -3);
    wingShape.lineTo(10.5, -5);
    wingShape.lineTo(0, -2);
    wingShape.closePath();

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });

    const rightWing = new THREE.Mesh(wingExtrude, wingMat);
    rightWing.rotation.x = Math.PI / 2;
    rightWing.position.set(0.5, 0, 1);
    airlinerGroup.add(rightWing);

    const leftWing = new THREE.Mesh(wingExtrude, wingMat);
    leftWing.rotation.x = Math.PI / 2;
    leftWing.scale.x = -1;
    leftWing.position.set(-0.5, 0, 1);
    airlinerGroup.add(leftWing);

    // Tail Fin (Vertical Stabilizer)
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(1.5, 4);
    tailShape.lineTo(3.2, 3.8);
    tailShape.lineTo(3.8, 0);
    tailShape.closePath();

    const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02 });
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, metalness: 0.9, roughness: 0.1 });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.rotation.y = Math.PI / 2;
    tailMesh.position.set(0, 1, 6);
    airlinerGroup.add(tailMesh);

    // Engines
    const engineGeo = new THREE.CylinderGeometry(0.55, 0.5, 2.5, 24);
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });

    const rightEngine = new THREE.Mesh(engineGeo, engineMat);
    rightEngine.rotation.x = Math.PI / 2;
    rightEngine.position.set(3.5, -0.9, 0.5);
    airlinerGroup.add(rightEngine);

    const leftEngine = new THREE.Mesh(engineGeo, engineMat);
    leftEngine.rotation.x = Math.PI / 2;
    leftEngine.position.set(-3.5, -0.9, 0.5);
    airlinerGroup.add(leftEngine);

    // Navigation Lights (Red/Green wingtips)
    const navLightGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const greenLightMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const leftNavLight = new THREE.Mesh(navLightGeo, redLightMat);
    leftNavLight.position.set(-11, 0, -2);
    airlinerGroup.add(leftNavLight);

    const rightNavLight = new THREE.Mesh(navLightGeo, greenLightMat);
    rightNavLight.position.set(11, 0, -2);
    airlinerGroup.add(rightNavLight);

    airlinerGroup.scale.set(0.65, 0.65, 0.65);
    airlinerGroup.position.set(0, 0, 0);
    scene.add(airlinerGroup);

    // --- 4. Procedural Volumetric Cloud Bank ---
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.75,
    });

    for (let i = 0; i < 45; i++) {
      const puffGeo = new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(2, 5), 2);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        THREE.MathUtils.randFloatSpread(120),
        THREE.MathUtils.randFloat(-15, -2),
        THREE.MathUtils.randFloatSpread(150)
      );
      puff.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      cloudGroup.add(puff);
    }
    scene.add(cloudGroup);

    // --- 5. 3D Earth Globe with Glow & Flight Paths ---
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -60, -30);

    const earthGeo = new THREE.SphereGeometry(18, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b48,
      roughness: 0.6,
      metalness: 0.2,
      emissive: 0x051329,
      emissiveIntensity: 0.5,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Atmosphere Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(19.2, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);

    // City Markers (IST, LHR, CDG, FCO, AMS, DXB, HND, JFK)
    const cities: Record<string, THREE.Vector3> = {
      IST: new THREE.Vector3(7.2, 11.5, 11.8),
      LHR: new THREE.Vector3(1.2, 14.8, 9.8),
      CDG: new THREE.Vector3(3.1, 14.2, 10.5),
      JFK: new THREE.Vector3(-11.5, 11.2, 8.5),
      DXB: new THREE.Vector3(12.5, 6.8, 11.2),
      HND: new THREE.Vector3(16.2, 7.5, -4.2),
    };

    const markerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    Object.entries(cities).forEach(([code, pos]) => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      earthGroup.add(marker);
    });

    scene.add(earthGroup);

    // --- 6. Scroll Interpolation & Render Loop ---
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const p = scrollRef.current;

      // Gentle floating animation
      const time = Date.now() * 0.001;
      airlinerGroup.position.y = Math.sin(time * 1.5) * 0.2;
      airlinerGroup.rotation.z = Math.sin(time * 1.2) * 0.03;
      cloudGroup.position.z = (time * 2) % 40;

      // Dynamic Lighting & Atmosphere Shift based on Scroll %
      if (p < 0.45) {
        // Gündüz Gökyüzü
        scene.background = new THREE.Color(0x0b1e33);
        sunLight.color.setHex(0xffffff);
        sunLight.intensity = 2.5;
      } else if (p < 0.7) {
        // Golden Hour / Sunset
        scene.background = new THREE.Color(0x2a132e);
        sunLight.color.setHex(0xffaa44);
        sunLight.intensity = 3.0;
      } else if (p < 0.88) {
        // Twilight Orbit
        scene.background = new THREE.Color(0x081026);
        sunLight.color.setHex(0x4facfe);
        sunLight.intensity = 1.5;
      } else {
        // Gece Uçuşu & Yıldızlar
        scene.background = new THREE.Color(0x040712);
        sunLight.color.setHex(0x1e293b);
        sunLight.intensity = 0.5;
      }

      // Camera Rig Interpolation along Scroll Timeline
      if (p < 0.15) {
        // %0 - %15: Hero Uzak Görünüş
        const factor = p / 0.15;
        camera.position.set(0, 1.5 + factor * 0.5, 25 - factor * 8);
        camera.lookAt(0, 0, 0);
        airlinerGroup.rotation.set(0, 0, 0);
      } else if (p < 0.28) {
        // %15 - %28: Uçak Kameranın Üzerinden Geçer
        const factor = (p - 0.15) / 0.13;
        camera.position.set(0, 1 - factor * 2, 17 - factor * 15);
        airlinerGroup.position.z = factor * 12;
        camera.lookAt(airlinerGroup.position);
      } else if (p < 0.40) {
        // %28 - %40: Kamera Uçağın Arkasına Geçer (Follow Chase Camera)
        const factor = (p - 0.28) / 0.12;
        camera.position.set(0, 2.5, -8 + factor * 16);
        airlinerGroup.position.z = 0;
        airlinerGroup.rotation.y = THREE.MathUtils.lerp(airlinerGroup.rotation.y, 0, 0.1);
        camera.lookAt(0, 0, -10);
      } else if (p < 0.50) {
        // %40 - %50: Bulut Tabakasına Giriş & Sis Geçişi
        const factor = (p - 0.40) / 0.10;
        scene.fog = new THREE.FogExp2(0xffffff, factor * 0.08 + 0.008);
        camera.position.set(0, 2 + factor * 3, 10 + factor * 10);
        camera.lookAt(0, 0, 0);
      } else if (p < 0.72) {
        // %50 - %72: 3D Dünya ve Yüksek Yörünge
        scene.fog = new THREE.FogExp2(0x0b1e33, 0.005);
        const factor = (p - 0.50) / 0.22;
        earthGroup.rotation.y = factor * Math.PI * 1.5;
        earthGroup.position.y = THREE.MathUtils.lerp(-60, -2, factor);
        camera.position.set(0, 10, 38);
        camera.lookAt(0, -2, 0);
        airlinerGroup.position.set(0, 25, 0); // Hide plane temporarily in orbit
      } else if (p < 0.88) {
        // %72 - %88: Uçak Showcase 360° Orbit
        const factor = (p - 0.72) / 0.16;
        earthGroup.position.y = -60; // Lower Earth
        airlinerGroup.position.set(0, 0, 0);
        const radius = 16;
        const angle = factor * Math.PI * 2;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = Math.cos(angle) * radius;
        camera.position.y = 2 + Math.sin(factor * Math.PI) * 4;
        camera.lookAt(0, 0, 0);
      } else {
        // %88 - %100: Gece & Final Boarding Pass Punch
        const factor = (p - 0.88) / 0.12;
        airlinerGroup.position.set(0, factor * 10, -factor * 20);
        camera.position.set(0, 0, 22);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
