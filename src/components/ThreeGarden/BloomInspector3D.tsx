import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CategoryId } from '../../types/garden';
import { FLOWER_SPECIES, getGrowthStage, getStageDescription } from '../../constants/categories';
import { createFlower3D, Flower3DInstance } from './flowerGenerators';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface BloomInspector3DProps {
  categoryId?: CategoryId;
  liveProgress?: number; // 0..1 if controlled externally by timer
  isLiveTimer?: boolean;
  height?: number;
  className?: string;
  showControls?: boolean;
}

export const BloomInspector3D: React.FC<BloomInspector3DProps> = ({
  categoryId = 'feature',
  liveProgress,
  isLiveTimer = false,
  height = 360,
  className = '',
  showControls = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalProgress, setInternalProgress] = useState(0.85);
  const [isPlayingAutoGrowth, setIsPlayingAutoGrowth] = useState(false);
  const [selectedCat, setSelectedCat] = useState<CategoryId>(categoryId);

  // Sync category prop changes
  useEffect(() => {
    setSelectedCat(categoryId);
  }, [categoryId]);

  const activeProgress = liveProgress !== undefined ? liveProgress : internalProgress;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const flowerInstanceRef = useRef<Flower3DInstance | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const progressRef = useRef(activeProgress);
  progressRef.current = activeProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isLiveTimer ? '#FAF8F5' : '#FAF6F0');

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 2.2, 4.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;
    controls.target.set(0, 1.1, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFBEB, 1.6);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xEFF6FF, 0.6);
    fillLight.position.set(-4, 5, -3);
    scene.add(fillLight);

    // Ground platform pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.15, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xEDE8E1,
      roughness: 0.8
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.075;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Create initial 3D flower instance
    const flower = createFlower3D(selectedCat, 'blooming', { scale: 1.1 });
    scene.add(flower.group);
    flowerInstanceRef.current = flower;

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      controls.update();

      if (flowerInstanceRef.current) {
        flowerInstanceRef.current.update(progressRef.current, time, 0.8);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);

      if (flowerInstanceRef.current) {
        flowerInstanceRef.current.dispose();
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLiveTimer, selectedCat]);

  // Re-instantiate flower when selected species changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (flowerInstanceRef.current) {
      scene.remove(flowerInstanceRef.current.group);
      flowerInstanceRef.current.dispose();
    }

    const flower = createFlower3D(selectedCat, 'blooming', { scale: 1.1 });
    scene.add(flower.group);
    flowerInstanceRef.current = flower;
    flower.update(progressRef.current, 0, 0.8);
  }, [selectedCat]);

  // Handle continuous auto growth playback loop
  useEffect(() => {
    if (!isPlayingAutoGrowth) return;

    let startTime = performance.now();
    let initialP = internalProgress;
    if (initialP >= 0.99) initialP = 0.05;

    const interval = window.setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const duration = 6.0; // 6 seconds to complete full bloom
      const newP = Math.min(1.0, initialP + (elapsed / duration) * (1.0 - initialP));
      setInternalProgress(newP);
      if (newP >= 1.0) {
        setIsPlayingAutoGrowth(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isPlayingAutoGrowth, internalProgress]);

  const currentStage = getGrowthStage(Math.floor(activeProgress * 1800));
  const stageInfo = getStageDescription(currentStage);
  const spec = FLOWER_SPECIES[selectedCat];

  return (
    <div className={`flex flex-col bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs ${className}`}>
      {/* 3D Canvas */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 p-1.5 px-3 bg-white/90 backdrop-blur-md rounded-xl border border-stone-200/80 shadow-2xs">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: spec.primaryColor }}
          />
          <span className="text-xs font-semibold text-stone-800">
            {spec.name}
          </span>
          <span className="text-stone-300">·</span>
          <span className="text-xs text-stone-500">
            {stageInfo.title}
          </span>
        </div>

        {/* Drag to Orbit hint */}
        <div className="absolute bottom-2 right-3 text-[10px] text-stone-400 pointer-events-none bg-white/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
          3D Orbit: Click & Drag
        </div>
      </div>

      {/* Interactive Growth Slider & Controls (if enabled) */}
      {showControls && (
        <div className="p-4 bg-[#FAF8F5] border-t border-stone-200/80 space-y-3">
          {/* Growth Timeline Scrubber */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-stone-500 text-[10px]">
                3D Bloom Metamorphosis
              </span>
              <span className="font-mono font-medium text-stone-800 tabular-nums">
                {Math.round(activeProgress * 100)}% Growth Accrued
              </span>
            </div>

            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.01"
              value={activeProgress}
              onChange={(e) => {
                setIsPlayingAutoGrowth(false);
                setInternalProgress(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Action Buttons & Play Simulation */}
          <div className="flex items-center justify-between pt-1">
            {/* Species quick toggle buttons */}
            <div className="flex items-center gap-1">
              {(Object.keys(FLOWER_SPECIES) as CategoryId[]).map((catId) => {
                const s = FLOWER_SPECIES[catId];
                const isSelected = selectedCat === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setSelectedCat(catId)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {s.categoryLabel}
                  </button>
                );
              })}
            </div>

            {/* Play Bloom Simulation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (activeProgress >= 0.99) {
                    setInternalProgress(0.05);
                  }
                  setIsPlayingAutoGrowth(!isPlayingAutoGrowth);
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors shadow-2xs"
              >
                {isPlayingAutoGrowth ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Bloom</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlayingAutoGrowth(false);
                  setInternalProgress(0.05);
                }}
                className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
                title="Reset to seed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
