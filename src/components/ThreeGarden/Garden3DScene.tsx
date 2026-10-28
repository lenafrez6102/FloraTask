import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GardenSession } from '../../types/garden';
import { FLOWER_SPECIES, getStageDescription } from '../../constants/categories';
import { createFlower3D, Flower3DInstance } from './flowerGenerators';
import { formatDuration } from '../../utils/storage';
import { Eye, RotateCcw, Sparkles, Compass } from 'lucide-react';

interface Garden3DSceneProps {
  sessions: GardenSession[];
  onSelectFlower: (session: GardenSession) => void;
  isWatering?: boolean;
}

export const Garden3DScene: React.FC<Garden3DSceneProps> = ({
  sessions,
  onSelectFlower,
  isWatering = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredSession, setHoveredSession] = useState<GardenSession | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Store references for callbacks and clean teardown
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const flowerInstancesRef = useRef<Map<string, { instance: Flower3DInstance; mesh: THREE.Group; session: GardenSession }>>(new Map());
  const waterParticlesRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    // Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#F2ECE4');
    scene.fog = new THREE.Fog('#F2ECE4', 14, 30);

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 7.5, 9.5);
    cameraRef.current = camera;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Environment map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.08; // don't go below ground
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.target.set(0, 0.5, 0);

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xFFFBF0, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xFDF2F8, 0x5D4037, 0.7);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xFFF7ED, 1.4);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xE0F2FE, 0.4);
    fillLight.position.set(-6, 8, -6);
    scene.add(fillLight);

    // --- Build Garden Bed Structure ---
    const gardenBedGroup = new THREE.Group();
    scene.add(gardenBedGroup);

    // Ground grass plain
    const groundGeo = new THREE.PlaneGeometry(35, 35);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xE8DFD1,
      roughness: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    gardenBedGroup.add(ground);

    // Raised Soil Bed Box (Fertile Loam)
    const bedWidth = 8.5;
    const bedLength = 8.5;
    const bedHeight = 0.35;
    const soilBoxGeo = new THREE.BoxGeometry(bedWidth, bedHeight, bedLength);
    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x4E342E, // rich fertile dark brown
      roughness: 0.95
    });
    const soilBox = new THREE.Mesh(soilBoxGeo, soilMat);
    soilBox.position.y = bedHeight / 2;
    soilBox.receiveShadow = true;
    gardenBedGroup.add(soilBox);

    // Cobblestone wooden edging frame around soil bed
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x8D6E63, // warm rustic timber
      roughness: 0.8
    });
    const rimThickness = 0.35;
    const rimHeight = 0.42;

    // 4 Border Rims
    const rimGeoH = new THREE.BoxGeometry(bedWidth + rimThickness * 2, rimHeight, rimThickness);
    const rimNorth = new THREE.Mesh(rimGeoH, frameMat);
    rimNorth.position.set(0, rimHeight / 2, -(bedLength / 2 + rimThickness / 2));
    rimNorth.castShadow = true;
    rimNorth.receiveShadow = true;
    gardenBedGroup.add(rimNorth);

    const rimSouth = rimNorth.clone();
    rimSouth.position.z = bedLength / 2 + rimThickness / 2;
    gardenBedGroup.add(rimSouth);

    const rimGeoV = new THREE.BoxGeometry(rimThickness, rimHeight, bedLength);
    const rimEast = new THREE.Mesh(rimGeoV, frameMat);
    rimEast.position.set(bedWidth / 2 + rimThickness / 2, rimHeight / 2, 0);
    rimEast.castShadow = true;
    rimEast.receiveShadow = true;
    gardenBedGroup.add(rimEast);

    const rimWest = rimEast.clone();
    rimWest.position.x = -(bedWidth / 2 + rimThickness / 2);
    gardenBedGroup.add(rimWest);

    // Decorative Stepping Stones along the front
    const stoneGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.08, 10);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xD7CCC8,
      roughness: 0.85
    });
    [-2.2, 0, 2.2].forEach((x, i) => {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.05, 5.2);
      stone.rotation.y = (i * 0.4);
      stone.receiveShadow = true;
      gardenBedGroup.add(stone);
    });

    // 3D Water Droplets Particle System for Watering
    const dropCount = 120;
    const dropGeo = new THREE.BufferGeometry();
    const dropPositions = new Float32Array(dropCount * 3);
    for (let i = 0; i < dropCount; i++) {
      dropPositions[i * 3] = (Math.random() - 0.5) * bedWidth;
      dropPositions[i * 3 + 1] = Math.random() * 5 + 1;
      dropPositions[i * 3 + 2] = (Math.random() - 0.5) * bedLength;
    }
    dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPositions, 3));
    const dropMat = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const waterParticles = new THREE.Points(dropGeo, dropMat);
    waterParticles.visible = false;
    scene.add(waterParticles);
    waterParticlesRef.current = waterParticles;

    // Raycaster for clicking & hovering flowers
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      flowerInstancesRef.current.forEach((val) => {
        meshes.push(val.mesh);
      });

      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        // Find which flower was hit
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && topObj.parent && topObj.parent !== scene) {
          for (const [id, data] of flowerInstancesRef.current.entries()) {
            if (data.mesh === topObj) {
              setHoveredSession(data.session);
              renderer.domElement.style.cursor = 'pointer';
              return;
            }
          }
          topObj = topObj.parent;
        }
      } else {
        setHoveredSession(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes: THREE.Object3D[] = [];
      flowerInstancesRef.current.forEach((val) => {
        meshes.push(val.mesh);
      });

      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && topObj.parent && topObj.parent !== scene) {
          for (const [, data] of flowerInstancesRef.current.entries()) {
            if (data.mesh === topObj) {
              onSelectFlower(data.session);
              return;
            }
          }
          topObj = topObj.parent;
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Main Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Update OrbitControls
      controls.update();

      // Update swaying of 3D flowers
      flowerInstancesRef.current.forEach((item) => {
        item.instance.update(
          item.session.growthStage === 'seed'
            ? 0.08
            : item.session.growthStage === 'sprout'
            ? 0.28
            : item.session.growthStage === 'bud'
            ? 0.5
            : item.session.growthStage === 'blooming'
            ? 0.78
            : item.session.growthStage === 'lush'
            ? 0.92
            : 1.0,
          time,
          1.0
        );
      });

      // Animate water droplets if watering
      if (waterParticlesRef.current && waterParticlesRef.current.visible) {
        const positions = waterParticlesRef.current.geometry.attributes.position;
        for (let i = 0; i < dropCount; i++) {
          let y = positions.getY(i) - 0.2;
          if (y < 0.35) {
            y = 5.0 + Math.random() * 2;
          }
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);

      flowerInstancesRef.current.forEach((val) => val.instance.dispose());
      flowerInstancesRef.current.clear();

      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectFlower]);

  // Sync watering state to particle visibility
  useEffect(() => {
    if (waterParticlesRef.current) {
      waterParticlesRef.current.visible = isWatering;
    }
  }, [isWatering]);

  // Synchronize 3D Flower Instances with `sessions` prop
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old instances that are no longer in sessions
    const currentSessionIds = new Set(sessions.map((s) => s.id));
    flowerInstancesRef.current.forEach((val, id) => {
      if (!currentSessionIds.has(id)) {
        scene.remove(val.mesh);
        val.instance.dispose();
        flowerInstancesRef.current.delete(id);
      }
    });

    // Grid layout calculation for 4x4 or 5x5 planter bed
    const cols = 4;
    const spacingX = 1.85;
    const spacingZ = 1.85;
    const offsetX = ((cols - 1) * spacingX) / 2;

    sessions.forEach((session, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      // Subtle organic jitter so flowers don't look like factory robots
      const jitterX = Math.sin(index * 3.7) * 0.1;
      const jitterZ = Math.cos(index * 2.3) * 0.1;
      const posX = col * spacingX - offsetX + jitterX;
      const posZ = row * spacingZ - 2.6 + jitterZ;
      const posY = 0.35; // sit on top of raised soil box
      const naturalYaw = (index * 2.39996) % (Math.PI * 2);
      const naturalScale = 0.92 + ((index * 7) % 5) * 0.035;

      let existing = flowerInstancesRef.current.get(session.id);
      if (existing) {
        // Update session reference and position
        existing.session = session;
        existing.mesh.position.set(posX, posY, posZ);
        existing.mesh.rotation.y = naturalYaw;
      } else {
        // Instantiate new 3D flower with natural scale and orientation
        const flower3D = createFlower3D(session.categoryId, session.growthStage, { scale: naturalScale });
        flower3D.group.position.set(posX, posY, posZ);
        flower3D.group.rotation.y = naturalYaw;
        scene.add(flower3D.group);
        flowerInstancesRef.current.set(session.id, {
          instance: flower3D,
          mesh: flower3D.group,
          session
        });
      }
    });
  }, [sessions]);

  // Camera presets
  const setCameraView = (type: 'iso' | 'top' | 'close') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (type === 'iso') {
      camera.position.set(0, 7.5, 9.5);
      controls.target.set(0, 0.5, 0);
    } else if (type === 'top') {
      camera.position.set(0, 12.0, 0.1);
      controls.target.set(0, 0.4, 0);
    } else if (type === 'close') {
      camera.position.set(0, 3.2, 5.0);
      controls.target.set(0, 1.2, 0);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border-4 border-[#D8D0C3] shadow-inner bg-[#F2ECE4]">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* 3D Viewport Controls Pill Dock */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-stone-200/80 shadow-xs">
        <button
          onClick={() => setCameraView('iso')}
          className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
          title="Isometric Garden Angle"
        >
          <Compass className="w-3.5 h-3.5 text-stone-500" />
          <span>Isometric</span>
        </button>

        <button
          onClick={() => setCameraView('top')}
          className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
          title="Top-Down Plan Angle"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span>Top Down</span>
        </button>

        <button
          onClick={() => setCameraView('close')}
          className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1"
          title="Close-Up Botanical Angle"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Close Up</span>
        </button>

        <button
          onClick={() => setCameraView('iso')}
          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors ml-0.5"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoveredSession && (
        <div
          className="absolute z-30 pointer-events-none p-3 bg-stone-900/95 text-white rounded-xl shadow-2xl border border-stone-700 text-xs transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: FLOWER_SPECIES[hoveredSession.categoryId].primaryColor }}
            />
            <span className="font-semibold text-stone-100">
              {hoveredSession.taskName}
            </span>
          </div>
          <div className="text-[11px] text-stone-300 flex items-center gap-2">
            <span>{FLOWER_SPECIES[hoveredSession.categoryId].name}</span>
            <span>·</span>
            <span className="font-mono tabular-nums text-amber-300 font-medium">
              {formatDuration(hoveredSession.durationSeconds)}
            </span>
            <span>·</span>
            <span className="text-stone-400">Click to inspect</span>
          </div>
        </div>
      )}

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-4 inset-x-4 flex justify-between items-center pointer-events-none">
        <div className="px-3 py-1 bg-stone-900/70 text-white text-[11px] rounded-lg backdrop-blur-xs flex items-center gap-2">
          <span>🌿 Click and drag to orbit in 3D</span>
          <span>·</span>
          <span>Scroll to zoom</span>
          <span>·</span>
          <span>Click any flower to inspect details</span>
        </div>

        <div className="px-2.5 py-1 bg-white/80 backdrop-blur-xs rounded-lg text-[11px] font-mono font-medium text-stone-700 border border-stone-200/80">
          {sessions.length} 3D Blooms in Garden Bed
        </div>
      </div>
    </div>
  );
};
