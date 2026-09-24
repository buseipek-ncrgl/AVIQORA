'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import * as THREE from 'three';

interface Cabin3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatCode: string;
  seatClass: 'Business' | 'Economy';
  flightNumber: string;
  aircraftModel: string;
}

export const Cabin3DModal: React.FC<Cabin3DModalProps> = ({
  isOpen,
  onClose,
  seatCode,
  seatClass,
  flightNumber,
  aircraftModel,
}) => {
  const [activeAngle, setActiveAngle] = useState<'360' | 'window' | 'legroom' | 'recline'>('360');
  const mountRef = useRef<HTMLDivElement>(null);
  const isBusiness = seatClass === 'Business';

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    // Clean up previous canvas if any
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 720;
    const height = 340;

    // 1. Scene Setup & Bright Studio Environment Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Premium deep studio navy background

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 2.2, 5.2);
    camera.lookAt(0, 0.2, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 3. Multi-directional High Contrast Studio Lighting
    // Ambient Light (Overall soft ambient sky/ground fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Directional Light (Top-Front Right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    // Fill Light (Front Left - prevents black shadows)
    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.2);
    fillLight.position.set(-6, 8, 4);
    scene.add(fillLight);

    // Rim/Accent Glow Light (Behind seat for edge highlight)
    const rimLight = new THREE.PointLight(isBusiness ? 0xf59e0b : 0x38bdf8, 3.5, 12);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Floor Base (Studio Pedestal)
    const floorGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.2, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1.1;
    scene.add(floor);

    // Pedestal Ring Line
    const ringGeo = new THREE.TorusGeometry(3.55, 0.04, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: isBusiness ? 0xf59e0b : 0x3b82f6,
      emissive: isBusiness ? 0xf59e0b : 0x3b82f6,
      emissiveIntensity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.0;
    scene.add(ring);

    // Grid Overlay
    const gridHelper = new THREE.GridHelper(8, 16, isBusiness ? 0xf59e0b : 0x60a5fa, 0x334155);
    gridHelper.position.y = -0.99;
    scene.add(gridHelper);

    // 4. 3D Aircraft Seat Model Assembly
    const seatGroup = new THREE.Group();

    // A. Rear Outer Composite Shell (White/Silver Contrast Shell - prevents dark silhouettes!)
    const shellGeo = new THREE.BoxGeometry(1.4, 2.1, 0.4);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9, // Crisp Pearl White Shell
      roughness: 0.2,
      metalness: 0.1,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.position.set(0, 0.65, -0.45);
    seatGroup.add(shellMesh);

    // B. Base Pedestal Structure
    const baseGeo = new THREE.BoxGeometry(1.2, 0.45, 1.2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.75;
    seatGroup.add(baseMesh);

    // C. Seat Cushion (Vibrant Leather Blue / Indigo)
    const cushionGeo = new THREE.BoxGeometry(1.3, 0.35, 1.3);
    const cushionMat = new THREE.MeshStandardMaterial({
      color: isBusiness ? 0x1e3a8a : 0x2563eb,
      roughness: 0.3,
      metalness: 0.1,
    });
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.position.y = -0.35;
    seatGroup.add(cushionMesh);

    // D. Backrest Cushion
    const backGeo = new THREE.BoxGeometry(1.25, 1.7, 0.3);
    const backMat = new THREE.MeshStandardMaterial({
      color: isBusiness ? 0x2563eb : 0x3b82f6,
      roughness: 0.3,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.set(0, 0.65, -0.3);
    seatGroup.add(backMesh);

    // E. Headrest (Golden Amber for Business / Royal Blue for Economy)
    const headGeo = new THREE.BoxGeometry(0.85, 0.45, 0.35);
    const headMat = new THREE.MeshStandardMaterial({
      color: isBusiness ? 0xd97706 : 0x1d4ed8,
      roughness: 0.2,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 1.6, -0.3);
    seatGroup.add(headMesh);

    // F. Chrome Trimmed Armrests
    const armGeo = new THREE.BoxGeometry(0.22, 0.55, 1.25);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.76, 0.1, -0.05);
    seatGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.76, 0.1, -0.05);
    seatGroup.add(rightArm);

    // G. In-Flight Entertainment (IFE 4K Display Console)
    if (isBusiness) {
      const consoleGeo = new THREE.BoxGeometry(1.3, 1.8, 0.3);
      const consoleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
      const consoleMesh = new THREE.Mesh(consoleGeo, consoleMat);
      consoleMesh.position.set(0, 0.6, 1.5);
      seatGroup.add(consoleMesh);

      const screenGeo = new THREE.BoxGeometry(1.15, 0.75, 0.04);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0284c7,
        emissiveIntensity: 0.7,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 0.7, 1.34);
      seatGroup.add(screenMesh);
    }

    scene.add(seatGroup);

    // 5. Smooth Rotation & Viewing Angle Loop
    let animationFrameId: number;
    let currentAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (activeAngle === '360') {
        currentAngle += 0.009;
      } else if (activeAngle === 'window') {
        currentAngle = THREE.MathUtils.lerp(currentAngle, Math.PI / 3.5, 0.08);
      } else if (activeAngle === 'legroom') {
        currentAngle = THREE.MathUtils.lerp(currentAngle, Math.PI / 1.8, 0.08);
      } else if (activeAngle === 'recline') {
        currentAngle = THREE.MathUtils.lerp(currentAngle, -Math.PI / 4, 0.08);
      }

      seatGroup.rotation.y = currentAngle;
      renderer.render(scene, camera);
    };

    animate();

    // 6. Cleanup on Unmount / Tab Switch
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, activeAngle, isBusiness]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="corporate-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          padding: '0',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--brand-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} /> THREE.JS 3D KABİN & KOLTUK PERSPEKTİFİ
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              Koltuk {seatCode} ({seatClass} Class) — {aircraftModel}
            </h3>
          </div>

          <button onClick={onClose} className="btn-outline" style={{ padding: '6px 12px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Real Three.js WebGL 3D Canvas Viewport */}
        <div style={{ position: 'relative', height: '340px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

          {/* Perspective View Info Overlay */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, pointerEvents: 'none' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} /> WebGL 3D Studio Işıklandırması Yapıldı ({flightNumber})
            </span>
          </div>

          {/* Perspective Angle Controller Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              display: 'flex',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '30px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {[
              { id: '360', label: '360° Döner Kabin' },
              { id: 'window', label: 'Pencere Görüşü' },
              { id: 'legroom', label: 'Diz Mesafesi' },
              { id: 'recline', label: 'Yatış Konumu' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveAngle(btn.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  backgroundColor: activeAngle === btn.id ? 'var(--brand-accent)' : 'transparent',
                  color: activeAngle === btn.id ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seat Specification Badges */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Koltuk Aralığı</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-accent)', marginTop: '2px' }}>{isBusiness ? '78 inç (198 cm)' : '34 inç (86 cm)'}</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>4K Ekran Ekranı</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--brand-gold)', marginTop: '2px' }}>{isBusiness ? '18.5" OLED 4K Touch' : '13.3" HD Touch'}</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Güç & Şarj</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>60W Type-C + AC</div>
          </div>
        </div>
      </div>
    </div>
  );
};
