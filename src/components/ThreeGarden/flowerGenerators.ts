import * as THREE from 'three';
import { CategoryId, GrowthStage } from '../../types/garden';
import { FLOWER_SPECIES } from '../../constants/categories';

export interface Flower3DInstance {
  group: THREE.Group;
  update: (progress: number, time: number, windStrength?: number) => void;
  dispose: () => void;
}

// Biological Logistic and Smoothstep curves
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function easeOutQuad(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * (2 - c);
}

// Global cached procedural canvas textures
const petalTextureCache = new Map<string, THREE.CanvasTexture>();
const leafTextureCache = new Map<string, THREE.CanvasTexture>();
const discTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-fidelity botanical petal textures with soft pastel gradients,
 * delicate capillary vascular veins, and velvety cellular margin shading.
 */
function getBotanicalPetalTexture(categoryId: CategoryId): THREE.CanvasTexture {
  if (petalTextureCache.has(categoryId)) {
    return petalTextureCache.get(categoryId)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // Species-specific botanical color maps (clean pastel shades)
  let throatColor = '#FFF5F7';
  let bodyColor = '#FBCFE8';
  let tipColor = '#F472B6';
  let veinColor = 'rgba(225, 29, 72, 0.14)';
  let accentBlush = 'rgba(244, 114, 182, 0.16)';

  if (categoryId === 'feature') {
    // Cherry Blossom (Sakura): White-blush throat with rosy pink petal body
    throatColor = '#FFF5F8';
    bodyColor = '#FBCFE8';
    tipColor = '#F472B6';
    veinColor = 'rgba(219, 39, 119, 0.15)';
    accentBlush = 'rgba(244, 63, 94, 0.18)';
  } else if (categoryId === 'bugfix') {
    // English Lavender: Soft periwinkle floret with royal violet throat
    throatColor = '#F5F3FF';
    bodyColor = '#DDD6FE';
    tipColor = '#A78BFA';
    veinColor = 'rgba(109, 40, 217, 0.16)';
    accentBlush = 'rgba(124, 58, 237, 0.18)';
  } else if (categoryId === 'refactor') {
    // Chamomile Daisy: Silky pure white ray petal with subtle pale yellow throat hint
    throatColor = '#FEFCE8';
    bodyColor = '#FFFFFF';
    tipColor = '#F8FAFC';
    veinColor = 'rgba(202, 138, 4, 0.1)';
    accentBlush = 'rgba(254, 240, 138, 0.2)';
  } else if (categoryId === 'research') {
    // Sunlit Marigold: Radiant warm golden amber body with saffron tips
    throatColor = '#FBBF24';
    bodyColor = '#F59E0B';
    tipColor = '#FDE047';
    veinColor = 'rgba(180, 83, 9, 0.18)';
    accentBlush = 'rgba(245, 158, 11, 0.2)';
  } else if (categoryId === 'design') {
    // Pastel Tulip: Radiant peach-coral petals with buttery luminous interior base
    throatColor = '#FEF9C3';
    bodyColor = '#FDA4AF';
    tipColor = '#FB7185';
    veinColor = 'rgba(225, 29, 72, 0.15)';
    accentBlush = 'rgba(251, 113, 133, 0.18)';
  } else {
    // Mint Succulent: Velvety pale seafoam-celadon with blushing dusty rose margins
    throatColor = '#ECFDF5';
    bodyColor = '#A7F3D0';
    tipColor = '#FB7185';
    veinColor = 'rgba(16, 185, 129, 0.12)';
    accentBlush = 'rgba(244, 114, 182, 0.18)';
  }

  // 1. Smooth Botanical Radial & Longitudinal Gradient
  const grad = ctx.createLinearGradient(w / 2, h, w / 2, 0);
  grad.addColorStop(0.0, throatColor);
  grad.addColorStop(0.25, throatColor);
  grad.addColorStop(0.7, bodyColor);
  grad.addColorStop(1.0, tipColor);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2. Throat Nectar Guide Blush (concentric glow at base)
  const throatGrad = ctx.createRadialGradient(w / 2, h * 0.95, 5, w / 2, h * 0.95, w * 0.4);
  throatGrad.addColorStop(0.0, accentBlush);
  throatGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = throatGrad;
  ctx.fillRect(0, 0, w, h);

  // 3. Delicate Vascular Plant Capillaries / Veins
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 1.1;
  ctx.lineCap = 'round';

  const veinCount = 9;
  for (let v = 0; v < veinCount; v++) {
    const norm = (v - (veinCount - 1) / 2) / ((veinCount - 1) / 2); // -1 to 1
    const spread = norm * (w * 0.4);

    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.96);
    ctx.bezierCurveTo(
      w / 2 + spread * 0.35,
      h * 0.65,
      w / 2 + spread * 0.8,
      h * 0.35,
      w / 2 + spread,
      h * 0.08
    );
    ctx.stroke();

    // Secondary micro-vein branches
    if (Math.abs(norm) > 0.25) {
      ctx.beginPath();
      ctx.moveTo(w / 2 + spread * 0.4, h * 0.58);
      ctx.quadraticCurveTo(
        w / 2 + spread * 0.65,
        h * 0.5,
        w / 2 + spread * 0.9,
        h * 0.42
      );
      ctx.stroke();
    }
  }

  // 4. Micro-Cellular Velvety Texture
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 5;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  petalTextureCache.set(categoryId, texture);
  return texture;
}

/**
 * Creates high-fidelity botanical leaf texture with natural chlorophyll gradient,
 * prominent pale green midrib channel, and secondary pinnate veins.
 */
function getBotanicalLeafTexture(): THREE.CanvasTexture {
  if (leafTextureCache.has('foliage')) {
    return leafTextureCache.get('foliage')!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // Tender leaf base to rich emerald blade
  const grad = ctx.createLinearGradient(w / 2, h, w / 2, 0);
  grad.addColorStop(0.0, '#86EFAC');
  grad.addColorStop(0.25, '#4ADE80');
  grad.addColorStop(0.7, '#22C55E');
  grad.addColorStop(1.0, '#15803D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Pale Central Midrib
  ctx.strokeStyle = '#DCFCE7';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(w / 2, h);
  ctx.quadraticCurveTo(w / 2 + 2, h * 0.5, w / 2, 10);
  ctx.stroke();

  // Secondary Pinnate Veins
  ctx.strokeStyle = 'rgba(220, 252, 231, 0.6)';
  ctx.lineWidth = 1.3;
  for (let y = h * 0.85; y > h * 0.12; y -= 34) {
    ctx.beginPath();
    ctx.moveTo(w / 2, y);
    ctx.quadraticCurveTo(w / 2 + 35, y - 16, w * 0.9, y - 26);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2, y);
    ctx.quadraticCurveTo(w / 2 - 35, y - 16, w * 0.1, y - 26);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  leafTextureCache.set('foliage', texture);
  return texture;
}

/**
 * Creates soft, pale buttercup-gold disc texture (NEVER harsh orange).
 */
function getCenterDiscTexture(categoryId: CategoryId): THREE.CanvasTexture {
  const key = `disc_${categoryId}`;
  if (discTextureCache.has(key)) {
    return discTextureCache.get(key)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 64;
  const cy = 64;

  // Soft buttercup and golden sunlight gradient
  const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 60);
  bgGrad.addColorStop(0.0, '#FEF08A'); // pale soft pastel yellow
  bgGrad.addColorStop(0.5, '#FDE047'); // sunny buttercup yellow
  bgGrad.addColorStop(1.0, '#EAB308'); // warm gold edge
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 128, 128);

  // Delicate micro-floret dots
  const floretCount = 100;
  for (let i = 0; i < floretCount; i++) {
    const phi = i * 2.399963;
    const r = Math.sqrt(i / floretCount) * 56;
    const x = cx + Math.cos(phi) * r;
    const y = cy + Math.sin(phi) * r;

    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#FEF9C3' : '#FACC15';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  discTextureCache.set(key, texture);
  return texture;
}

/**
 * Generates a smooth, organic, subdivided 3D parametric petal mesh.
 * This completely avoids flat faceted polygons by computing continuous bi-cubic curvature,
 * transverse cupping, undulating ruffled margins, and apical notches on a structured grid.
 */
function createParametricPetalGeometry(
  species: 'cherry' | 'lavender' | 'daisy' | 'marigold' | 'tulip' | 'succulent',
  length = 1.0,
  maxWidth = 0.52
): THREE.BufferGeometry {
  const segX = 14;
  const segY = 22;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segY; j++) {
    const v = j / segY; // 0 (base) to 1 (tip)

    // Calculate natural silhouette profile width W(v)
    let w = 0;
    if (species === 'cherry') {
      w = maxWidth * Math.sin(Math.pow(v, 0.72) * Math.PI);
    } else if (species === 'daisy') {
      w = maxWidth * Math.sin(Math.pow(v, 0.6) * Math.PI) * 0.9;
    } else if (species === 'marigold') {
      w = maxWidth * (0.2 + 0.8 * Math.sin(Math.pow(v, 0.65) * Math.PI));
    } else if (species === 'tulip') {
      w = maxWidth * (0.25 + 0.85 * Math.sin(Math.pow(v, 0.68) * Math.PI));
    } else if (species === 'succulent') {
      w = maxWidth * Math.sin(Math.pow(v, 0.7) * Math.PI);
    } else {
      w = maxWidth * Math.sin(v * Math.PI);
    }

    for (let i = 0; i <= segX; i++) {
      const uNorm = (i / segX) * 2 - 1; // -1 to 1 across width
      let x = (uNorm * w) / 2;
      let y = v * length;

      // 1. Apical Heart Notch for Cherry Blossom
      if (species === 'cherry' && v > 0.82) {
        const notchFactor = (v - 0.82) / 0.18;
        const centerProximity = 1.0 - Math.min(1.0, Math.abs(uNorm) * 2.2);
        if (centerProximity > 0) {
          y -= centerProximity * notchFactor * (length * 0.12);
        }
      }

      // 2. Longitudinal arching curvature under gravity & sun exposure
      let arch = 0;
      if (species === 'tulip') {
        arch = Math.sin(v * Math.PI * 0.85) * (length * 0.28);
      } else if (species === 'succulent') {
        arch = -Math.sin(v * Math.PI * 0.7) * (length * 0.12);
      } else {
        arch = -Math.sin(v * Math.PI * 0.8) * (length * 0.18);
      }

      // 3. Transverse cupping (spoon / canoe cross-section)
      const cupStrength = species === 'tulip' ? 0.42 : (species === 'succulent' ? 0.35 : 0.26);
      const cup = -(uNorm * uNorm) * cupStrength * Math.sin(v * Math.PI);

      // 4. Delicate undulating edge ruffles on margins
      let ruffles = 0;
      if (species === 'marigold') {
        const marginFactor = Math.pow(Math.abs(uNorm), 1.5);
        ruffles = Math.sin(v * Math.PI * 9 + uNorm * 4) * 0.04 * marginFactor;
      } else if (species === 'cherry' || species === 'daisy') {
        const marginFactor = Math.abs(uNorm);
        ruffles = Math.sin(v * Math.PI * 6) * 0.018 * marginFactor;
      }

      // 5. Reflex flare at tip (tips relax softly in open bloom)
      let reflex = 0;
      if (species !== 'tulip' && v > 0.75) {
        reflex = Math.pow((v - 0.75) / 0.25, 2) * (length * 0.08);
      }

      const z = arch + cup + ruffles + reflex;

      positions.push(x, y, z);
      normals.push(0, 0, 1);
      uvs.push((uNorm + 1) / 2, v);
    }
  }

  // Build grid triangle indices
  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = (j + 1) * (segX + 1) + i;
      const c = (j + 1) * (segX + 1) + (i + 1);
      const d = j * (segX + 1) + (i + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Creates an organic, gracefully arched leaf geometry with central midrib trough.
 */
function createBotanicalLeafGeometry(length = 0.92, maxWidth = 0.34): THREE.BufferGeometry {
  const segX = 10;
  const segY = 16;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= segY; j++) {
    const v = j / segY;
    const w = maxWidth * Math.sin(Math.pow(v, 0.65) * Math.PI);

    for (let i = 0; i <= segX; i++) {
      const uNorm = (i / segX) * 2 - 1;
      const x = (uNorm * w) / 2;
      const y = v * length;

      const arch = -Math.sin(v * Math.PI) * (length * 0.22);
      const trough = Math.abs(uNorm) * 0.055;
      const twist = Math.sin(v * Math.PI * 1.5) * 0.02 * uNorm;

      const z = arch + trough + twist;

      positions.push(x, y, z);
      normals.push(0, 0, 1);
      uvs.push((uNorm + 1) / 2, v);
    }
  }

  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * (segX + 1) + i;
      const b = (j + 1) * (segX + 1) + i;
      const c = (j + 1) * (segX + 1) + (i + 1);
      const d = j * (segX + 1) + (i + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

interface PetalItem {
  mesh: THREE.Mesh;
  baseRotX: number;
  baseRotY: number;
  baseRotZ: number;
  openRotX: number;
  staggerOffset: number;
  whorlTier: number;
  flutterPhase: number;
}

interface LeafItem {
  mesh: THREE.Mesh;
  targetAngleX: number;
  emergenceThreshold: number;
  heightAlongStem: number;
}

/**
 * Master procedural builder for naturally authentic 3D flower species.
 * Completely free of artificial orange domes or bulky central spheres.
 */
export function createFlower3D(
  categoryId: CategoryId,
  initialStage: GrowthStage = 'blooming',
  options: { scale?: number } = {}
): Flower3DInstance {
  const species = FLOWER_SPECIES[categoryId] || FLOWER_SPECIES.feature;
  const rootGroup = new THREE.Group();
  const flowerScale = options.scale || 1.0;
  rootGroup.scale.set(flowerScale, flowerScale, flowerScale);

  const materialsToDispose: THREE.Material[] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const trackMat = <T extends THREE.Material>(mat: T): T => {
    materialsToDispose.push(mat);
    return mat;
  };
  const trackGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
    geometriesToDispose.push(geo);
    return geo;
  };

  // 1. Fertile Soil Mound & Soft Contact Shadow
  const soilGeo = trackGeo(new THREE.CylinderGeometry(0.52, 0.76, 0.16, 16));
  const soilMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3E2723, // rich dark garden soil
      roughness: 0.95,
      metalness: 0.0
    })
  );
  const soilMound = new THREE.Mesh(soilGeo, soilMat);
  soilMound.position.y = 0.08;
  soilMound.receiveShadow = true;
  rootGroup.add(soilMound);

  const shadowGeo = trackGeo(new THREE.CircleGeometry(0.85, 20));
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x1E140F,
      transparent: true,
      opacity: 0.32,
      depthWrite: false
    })
  );
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.01;
  rootGroup.add(contactShadow);

  // 2. Seedling Sprout Bulb
  const seedGroup = new THREE.Group();
  seedGroup.position.y = 0.16;
  rootGroup.add(seedGroup);

  const seedGeo = trackGeo(new THREE.SphereGeometry(0.12, 10, 10));
  seedGeo.scale(0.85, 1.25, 0.85);
  const seedMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.85
    })
  );
  const seedMesh = new THREE.Mesh(seedGeo, seedMat);
  seedGroup.add(seedMesh);

  // 3. Graceful Botanical Stem (Tapered, Curved S-Spine)
  const stemGroup = new THREE.Group();
  stemGroup.position.y = 0.15;
  rootGroup.add(stemGroup);

  const stemHeight = categoryId === 'bugfix' ? 2.5 : 2.1;
  const stemSegments = 24;
  const stemGeo = trackGeo(new THREE.CylinderGeometry(0.034, 0.072, stemHeight, 10, stemSegments));
  stemGeo.translate(0, stemHeight / 2, 0);

  // Apply natural biological S-curve and phototropic lean
  const stemPos = stemGeo.attributes.position;
  for (let i = 0; i < stemPos.count; i++) {
    const y = stemPos.getY(i);
    const norm = Math.min(1.0, Math.max(0.0, y / stemHeight));
    const bow = Math.sin(norm * Math.PI) * 0.08;
    const sCurve = Math.sin(norm * Math.PI * 2) * 0.03;
    stemPos.setX(i, stemPos.getX(i) + bow);
    stemPos.setZ(i, stemPos.getZ(i) + sCurve);
  }
  stemGeo.computeVertexNormals();

  const stemMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x437E3A, // natural botanical sap green
      roughness: 0.52,
      metalness: 0.02
    })
  );
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  stemMesh.receiveShadow = true;
  stemGroup.add(stemMesh);

  // 4. Botanical Leaves along Stem Nodes
  const leavesGroup = new THREE.Group();
  stemGroup.add(leavesGroup);

  const leafTexture = getBotanicalLeafTexture();
  const leafMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: leafTexture,
      roughness: 0.42,
      metalness: 0.02,
      side: THREE.DoubleSide
    })
  );
  const leafGeo = trackGeo(createBotanicalLeafGeometry(0.88, 0.32));

  const leafItems: LeafItem[] = [];
  const leafConfig = [
    { height: 0.38, angleY: 0.25, targetX: 0.72, emerge: 0.14 },
    { height: 0.85, angleY: 2.45, targetX: 0.65, emerge: 0.28 },
    { height: 1.32, angleY: 4.55, targetX: 0.60, emerge: 0.42 }
  ];

  leafConfig.forEach((cfg, idx) => {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.y = cfg.height;
    leaf.scale.set(0.001, 0.001, 0.001);
    leaf.rotation.y = cfg.angleY;
    leaf.rotation.x = 0.15;
    leaf.castShadow = true;
    leavesGroup.add(leaf);
    leafItems.push({
      mesh: leaf,
      targetAngleX: cfg.targetX,
      emergenceThreshold: cfg.emerge,
      heightAlongStem: cfg.height
    });
  });

  // 5. Flower Head, Calyx & Sepals (Pedicel Receptacle)
  const headGroup = new THREE.Group();
  headGroup.position.y = stemHeight;
  stemGroup.add(headGroup);

  // Small, natural green pedicel cup where petals insert
  const receptacleGeo = trackGeo(new THREE.CylinderGeometry(0.12, 0.04, 0.12, 12));
  const calyxMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x336929, // botanical protective sepal green
      roughness: 0.58
    })
  );
  const receptacleMesh = new THREE.Mesh(receptacleGeo, calyxMat);
  receptacleMesh.position.y = -0.05;
  headGroup.add(receptacleMesh);

  // 5 Pointed Calyx Sepals cradling the base
  const sepalGroup = new THREE.Group();
  sepalGroup.position.y = -0.03;
  headGroup.add(sepalGroup);

  const sepalGeo = trackGeo(new THREE.ConeGeometry(0.05, 0.24, 5));
  sepalGeo.rotateX(Math.PI / 2);
  for (let s = 0; s < 5; s++) {
    const sepalAng = (s * Math.PI * 2) / 5;
    const sepal = new THREE.Mesh(sepalGeo, calyxMat);
    sepal.position.set(Math.cos(sepalAng) * 0.09, -0.01, Math.sin(sepalAng) * 0.09);
    sepal.rotation.y = sepalAng;
    sepal.rotation.x = 0.65;
    sepalGroup.add(sepal);
  }

  // Pre-bloom Green Bud Bulb (ONLY visible during bud stage; vanishes when petals open!)
  const budGeo = trackGeo(new THREE.SphereGeometry(0.16, 10, 10));
  budGeo.scale(0.8, 1.3, 0.8);
  const budMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3D7A42, // botanical bud green (NOT ORANGE!)
      roughness: 0.55
    })
  );
  const budMesh = new THREE.Mesh(budGeo, budMat);
  budMesh.castShadow = true;
  budMesh.position.y = 0.05;
  headGroup.add(budMesh);

  // 6. Master Bloom Group (Subdivided Botanical Petals)
  const bloomGroup = new THREE.Group();
  headGroup.add(bloomGroup);

  const petalTexture = getBotanicalPetalTexture(categoryId);
  const botanicalPetalMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      map: petalTexture,
      roughness: 0.38,
      metalness: 0.0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.25,
      sheen: 0.85,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color(species.primaryColor),
      side: THREE.DoubleSide
    })
  );

  const centerDiscTexture = getCenterDiscTexture(categoryId);
  const centerMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: centerDiscTexture,
      roughness: 0.48,
      metalness: 0.02
    })
  );

  const petalItems: PetalItem[] = [];

  // Construct Distinct Natural Species Architectures WITHOUT any orange domes
  if (categoryId === 'feature') {
    // Cherry Blossom (Sakura): 5 heart-notched outer petals + 5 offset inner petals + 18 delicate stamens
    const outerPetalGeo = trackGeo(createParametricPetalGeometry('cherry', 1.05, 0.62));
    const innerPetalGeo = trackGeo(createParametricPetalGeometry('cherry', 0.94, 0.56));

    // Outer Whorl
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const petal = new THREE.Mesh(outerPetalGeo, botanicalPetalMat);
      const varScale = 0.96 + ((i * 3) % 4) * 0.03;
      petal.scale.set(varScale, varScale, varScale);
      petal.position.set(Math.cos(angle) * 0.04, 0.01, Math.sin(angle) * 0.04);
      petal.rotation.y = angle;
      petal.rotation.x = 0.14;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.12,
        baseRotY: angle,
        baseRotZ: ((i % 2) - 0.5) * 0.04,
        openRotX: 1.34,
        staggerOffset: i * 0.03,
        whorlTier: 0,
        flutterPhase: i * 1.3
      });
    }

    // Inner Whorl (offset by 36 deg)
    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5 + Math.PI / 5;
      const petal = new THREE.Mesh(innerPetalGeo, botanicalPetalMat);
      const varScale = 0.90 + ((j * 2) % 3) * 0.03;
      petal.scale.set(varScale, varScale, varScale);
      petal.position.set(Math.cos(angle) * 0.03, 0.02, Math.sin(angle) * 0.03);
      petal.rotation.y = angle;
      petal.rotation.x = 0.18;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.18,
        baseRotY: angle,
        baseRotZ: ((j % 2) - 0.5) * 0.03,
        openRotX: 1.18,
        staggerOffset: 0.12 + j * 0.03,
        whorlTier: 1,
        flutterPhase: j * 1.3 + 2.0
      });
    }

    // Center Pistil & 18 Golden Anther Stamens (NO DOME)
    const stamenStemGeo = trackGeo(new THREE.CylinderGeometry(0.007, 0.007, 0.28, 4));
    const antherGeo = trackGeo(new THREE.SphereGeometry(0.03, 6, 6));
    const antherMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xFDE047, // sunny buttercup yellow pollen
        roughness: 0.32
      })
    );
    const filamentMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xFB7185, // delicate soft pink filament
        roughness: 0.5
      })
    );

    for (let s = 0; s < 18; s++) {
      const stamenAngle = (s * Math.PI * 2) / 18 + (s % 2) * 0.1;
      const stamenObj = new THREE.Group();
      const stamenBar = new THREE.Mesh(stamenStemGeo, filamentMat);
      stamenBar.position.y = 0.14;
      stamenObj.add(stamenBar);
      const anther = new THREE.Mesh(antherGeo, antherMat);
      anther.position.y = 0.28;
      stamenObj.add(anther);

      stamenObj.rotation.y = stamenAngle;
      stamenObj.rotation.x = 0.24 + (s % 3) * 0.06;
      bloomGroup.add(stamenObj);
    }
  } else if (categoryId === 'bugfix') {
    // English Lavender: Slender botanical spike with 7 tiers of 2-lipped florets (NO DOME)
    const floretPetalGeo = trackGeo(createParametricPetalGeometry('lavender', 0.42, 0.28));
    const calyxTubeGeo = trackGeo(new THREE.CylinderGeometry(0.04, 0.03, 0.2, 6));
    const calyxTubeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x6D28D9,
        roughness: 0.55
      })
    );

    const tiers = 7;
    for (let t = 0; t < tiers; t++) {
      const tierHeight = -0.55 + t * 0.24;
      const floretsInTier = 5;
      const taper = 1.0 - t * 0.08;

      for (let f = 0; f < floretsInTier; f++) {
        const ang = (f * Math.PI * 2) / floretsInTier + t * 0.5;
        const floretGroup = new THREE.Group();
        floretGroup.position.set(
          Math.cos(ang) * 0.14 * taper,
          tierHeight,
          Math.sin(ang) * 0.14 * taper
        );
        floretGroup.rotation.y = ang;

        const tube = new THREE.Mesh(calyxTubeGeo, calyxTubeMat);
        tube.rotation.x = Math.PI / 3;
        floretGroup.add(tube);

        const petalTop = new THREE.Mesh(floretPetalGeo, botanicalPetalMat);
        petalTop.scale.set(taper * 0.85, taper * 0.85, taper * 0.85);
        petalTop.position.set(0, 0.12, 0.1);
        petalTop.rotation.x = 0.5;
        floretGroup.add(petalTop);

        bloomGroup.add(floretGroup);
        petalItems.push({
          mesh: petalTop,
          baseRotX: 0.2,
          baseRotY: 0,
          baseRotZ: 0,
          openRotX: 0.72,
          staggerOffset: t * 0.045,
          whorlTier: t,
          flutterPhase: (t + f) * 0.8
        });
      }
    }
  } else if (categoryId === 'refactor') {
    // Chamomile Daisy: 20 pure silky ivory ray petals radiating around a tiny, flat golden floret disc
    // (NO ORANGE DOME! Replaced with a tiny, flat, delicate golden floret disc flush with petals)
    const daisyPetalGeo = trackGeo(createParametricPetalGeometry('daisy', 1.08, 0.32));

    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const petal = new THREE.Mesh(daisyPetalGeo, botanicalPetalMat);
      const varScale = 0.94 + (i % 3) * 0.035;
      petal.scale.set(varScale, varScale, varScale);
      // Attach petals around the tiny center disc so they form a beautiful flat ray circle
      petal.position.set(Math.cos(angle) * 0.07, 0.01, Math.sin(angle) * 0.07);
      petal.rotation.y = angle;
      petal.rotation.x = 0.15;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.14,
        baseRotY: angle,
        baseRotZ: ((i % 2) - 0.5) * 0.03,
        openRotX: 1.5, // ray petals open flat with gentle natural downward relaxation
        staggerOffset: (i % 4) * 0.03 + i * 0.006,
        whorlTier: i % 2,
        flutterPhase: i * 0.85
      });
    }

    // Tiny, flat, delicate sunny golden button (flat disc, NOT a bulging orange dome!)
    const smallDiscGeo = trackGeo(new THREE.CylinderGeometry(0.12, 0.13, 0.025, 20));
    const smallDisc = new THREE.Mesh(smallDiscGeo, centerMat);
    smallDisc.position.y = 0.015;
    bloomGroup.add(smallDisc);
  } else if (categoryId === 'research') {
    // Sunlit Marigold: 4 concentric tiers of ruffled petals forming a full pom-pom blossom
    // (NO ORANGE DOME/DISC! The center is completely filled with tight ruffled petals)
    const outerGeo = trackGeo(createParametricPetalGeometry('marigold', 1.04, 0.44));
    const midGeo = trackGeo(createParametricPetalGeometry('marigold', 0.88, 0.38));
    const innerGeo = trackGeo(createParametricPetalGeometry('marigold', 0.72, 0.32));
    const heartGeo = trackGeo(createParametricPetalGeometry('marigold', 0.52, 0.26));

    // Tier 1: Outer Whorl (12 petals)
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const petal = new THREE.Mesh(outerGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.06, 0.01, Math.sin(angle) * 0.06);
      petal.rotation.y = angle;
      petal.rotation.x = 0.18;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.16,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 1.45,
        staggerOffset: i * 0.02,
        whorlTier: 0,
        flutterPhase: i * 1.1
      });
    }

    // Tier 2: Middle Whorl (10 petals, offset)
    for (let j = 0; j < 10; j++) {
      const angle = (j * Math.PI * 2) / 10 + Math.PI / 10;
      const petal = new THREE.Mesh(midGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.04, 0.02, Math.sin(angle) * 0.04);
      petal.rotation.y = angle;
      petal.rotation.x = 0.24;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.22,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 1.18,
        staggerOffset: 0.12 + j * 0.02,
        whorlTier: 1,
        flutterPhase: j * 1.1 + 1.2
      });
    }

    // Tier 3: Inner Whorl (8 petals)
    for (let k = 0; k < 8; k++) {
      const angle = (k * Math.PI * 2) / 8 + Math.PI / 8;
      const petal = new THREE.Mesh(innerGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.025, 0.03, Math.sin(angle) * 0.025);
      petal.rotation.y = angle;
      petal.rotation.x = 0.32;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.28,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 0.88,
        staggerOffset: 0.22 + k * 0.02,
        whorlTier: 2,
        flutterPhase: k * 1.1 + 2.4
      });
    }

    // Tier 4: Ruffled Center Heart (6 tight petals that cradle the center, NO orange disc!)
    for (let h = 0; h < 6; h++) {
      const angle = (h * Math.PI * 2) / 6;
      const petal = new THREE.Mesh(heartGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.015, 0.04, Math.sin(angle) * 0.015);
      petal.rotation.y = angle;
      petal.rotation.x = 0.42;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.36,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 0.65,
        staggerOffset: 0.3 + h * 0.02,
        whorlTier: 3,
        flutterPhase: h * 1.1 + 3.0
      });
    }
  } else if (categoryId === 'design') {
    // Pastel Tulip: 6 broad overlapping perianth chalice tepals (NO DOME)
    const outerTepalGeo = trackGeo(createParametricPetalGeometry('tulip', 1.24, 0.72));
    const innerTepalGeo = trackGeo(createParametricPetalGeometry('tulip', 1.18, 0.68));

    // 3 Outer Tepals
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const petal = new THREE.Mesh(outerTepalGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.04, 0.01, Math.sin(angle) * 0.04);
      petal.rotation.y = angle;
      petal.rotation.x = 0.22;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.18,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 0.88,
        staggerOffset: 0.04 * i,
        whorlTier: 0,
        flutterPhase: i * 1.4
      });
    }

    // 3 Inner Tepals (alternating 60 deg)
    for (let j = 0; j < 3; j++) {
      const angle = (j * Math.PI * 2) / 3 + Math.PI / 3;
      const petal = new THREE.Mesh(innerTepalGeo, botanicalPetalMat);
      petal.position.set(Math.cos(angle) * 0.03, 0.02, Math.sin(angle) * 0.03);
      petal.rotation.y = angle;
      petal.rotation.x = 0.26;
      petal.castShadow = true;
      bloomGroup.add(petal);
      petalItems.push({
        mesh: petal,
        baseRotX: 0.22,
        baseRotY: angle,
        baseRotZ: 0,
        openRotX: 0.74,
        staggerOffset: 0.14 + 0.04 * j,
        whorlTier: 1,
        flutterPhase: j * 1.4 + 1.5
      });
    }

    // Interior 3-Lobed Star Pistil & Slender Plum Stamens
    const pistilGeo = trackGeo(new THREE.CylinderGeometry(0.03, 0.025, 0.38, 6));
    const pistilMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xBBF7D0, // tender pale pistachio green
        roughness: 0.4
      })
    );
    const pistil = new THREE.Mesh(pistilGeo, pistilMat);
    pistil.position.y = 0.19;
    bloomGroup.add(pistil);

    const antherGeo = trackGeo(new THREE.BoxGeometry(0.025, 0.15, 0.025));
    const tulipAntherMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x4A148C, // dark plum anthers
        roughness: 0.35
      })
    );
    for (let a = 0; a < 6; a++) {
      const antherAng = (a * Math.PI * 2) / 6;
      const anther = new THREE.Mesh(antherGeo, tulipAntherMat);
      anther.position.set(Math.cos(antherAng) * 0.08, 0.22, Math.sin(antherAng) * 0.08);
      bloomGroup.add(anther);
    }
  } else {
    // Mint Succulent (Echeveria): Fibonacci spiral rosette with plump fleshy leaves (NO DOME)
    const succLeafGeo = trackGeo(createParametricPetalGeometry('succulent', 0.85, 0.42));
    const numLeaves = 22;

    for (let i = 0; i < numLeaves; i++) {
      const phi = i * 2.399963;
      const r = 0.08 + Math.sqrt(i / numLeaves) * 0.58;
      const leaf = new THREE.Mesh(succLeafGeo, botanicalPetalMat);
      const leafScale = 0.65 + (i / numLeaves) * 0.45;
      leaf.scale.set(leafScale, leafScale, leafScale);
      leaf.position.set(Math.cos(phi) * r, (i / numLeaves) * 0.16, Math.sin(phi) * r);
      leaf.rotation.y = phi;
      leaf.rotation.x = 0.24;
      bloomGroup.add(leaf);
      petalItems.push({
        mesh: leaf,
        baseRotX: 0.22,
        baseRotY: phi,
        baseRotZ: 0,
        openRotX: 0.38 + (i / numLeaves) * 0.64,
        staggerOffset: (1 - i / numLeaves) * 0.22,
        whorlTier: Math.floor(i / 6),
        flutterPhase: i * 0.7
      });
    }
  }

  // Soft Subtle Shimmer Dewdrops (only on mature 100% full bloom, very small and soft)
  const sparkleGroup = new THREE.Group();
  rootGroup.add(sparkleGroup);
  const sparkleGeo = trackGeo(new THREE.SphereGeometry(0.02, 6, 6));
  const sparkleMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xFEF08A,
      transparent: true,
      opacity: 0.45
    })
  );
  const sparkles: THREE.Mesh[] = [];
  for (let s = 0; s < 5; s++) {
    const sp = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleGroup.add(sp);
    sparkles.push(sp);
  }

  /**
   * Continuous growth & swaying loop.
   */
  const update = (progress: number, time: number, windStrength = 1.0) => {
    const p = Math.min(1.0, Math.max(0.01, progress));

    // 1. Biological Logistic S-Curve for vegetative elongation
    const stemProgress = smoothstep(0.04, 0.62, p);
    const stemGrowth = 0.08 + 0.92 * stemProgress;

    // 2. Phototropic Circumnutation & Elastic Wind Sway
    const circumnutationAmp = Math.sin(stemProgress * Math.PI) * 0.036;
    const nutationX = Math.sin(time * 0.75 + rootGroup.position.x) * circumnutationAmp;
    const nutationZ = Math.cos(time * 0.75 + rootGroup.position.z) * circumnutationAmp;

    const windSwayX = Math.sin(time * 1.35 + rootGroup.position.x * 2.5) * 0.04 * windStrength;
    const windSwayZ = Math.cos(time * 1.05 + rootGroup.position.z * 2.0) * 0.024 * windStrength;

    stemGroup.rotation.z = windSwayX + nutationX;
    stemGroup.rotation.x = windSwayZ + nutationZ;

    const stemThickness = 0.5 + 0.5 * easeOutQuad(p);
    stemMesh.scale.set(stemThickness, stemGrowth, stemThickness);
    headGroup.position.y = stemHeight * stemGrowth;

    // 3. Staggered Leaf Unfurling
    leafItems.forEach((leafItem) => {
      if (p < leafItem.emergenceThreshold) {
        leafItem.mesh.scale.set(0.001, 0.001, 0.001);
      } else {
        const leafProgress = smoothstep(
          leafItem.emergenceThreshold,
          leafItem.emergenceThreshold + 0.35,
          p
        );
        const currentScale = easeOutQuad(leafProgress);
        leafItem.mesh.scale.set(currentScale, currentScale, currentScale);

        const currentAngle = 0.15 + (leafItem.targetAngleX - 0.15) * leafProgress;
        const leafFlutter = Math.sin(time * 2.2 + leafItem.heightAlongStem * 5) * 0.022 * windStrength;
        leafItem.mesh.rotation.x = currentAngle + leafFlutter;
      }
    });

    // 4. Bud Stage vs. Open Blooming
    if (p < 0.22) {
      seedGroup.scale.set(1.0, 1.0, 1.0);
      budMesh.visible = false;
      bloomGroup.scale.set(0.001, 0.001, 0.001);
      sepalGroup.scale.set(0.2, 0.2, 0.2);
    } else if (p < 0.48) {
      // Closed green sepal bud
      const budGrowth = smoothstep(0.22, 0.48, p);
      seedGroup.scale.set(
        Math.max(0.3, 1.0 - budGrowth * 0.6),
        Math.max(0.3, 1.0 - budGrowth * 0.6),
        Math.max(0.3, 1.0 - budGrowth * 0.6)
      );
      budMesh.visible = true;
      const currentBudScale = 0.3 + 0.7 * easeOutQuad(budGrowth);
      budMesh.scale.set(currentBudScale, currentBudScale, currentBudScale);
      bloomGroup.scale.set(0.001, 0.001, 0.001);
      sepalGroup.scale.set(0.6, 0.6, 0.6);
    } else {
      // 5. Open Bloom (Hide budMesh completely; no orange bulb inside!)
      budMesh.visible = false;
      seedGroup.scale.set(0.3, 0.3, 0.3);

      const masterBloomFactor = smoothstep(0.48, 0.95, p);
      const bloomScale = easeOutQuad(masterBloomFactor);
      bloomGroup.scale.set(bloomScale, bloomScale, bloomScale);
      sepalGroup.scale.set(1.0, 1.0, 1.0);

      petalItems.forEach((item) => {
        const petalStart = 0.46 + item.staggerOffset;
        const petalEnd = Math.min(1.0, petalStart + 0.4);
        const individualPetalP = smoothstep(petalStart, petalEnd, p);

        const targetRotX = item.baseRotX + (item.openRotX - item.baseRotX) * individualPetalP;
        const petalFlutter = Math.sin(time * 2.4 + item.flutterPhase) * 0.016 * windStrength * individualPetalP;
        const petalBreathing = Math.sin(time * 1.2) * 0.008 * individualPetalP;

        item.mesh.rotation.x = targetRotX + petalFlutter + petalBreathing;
      });
    }

    // 6. Subtle Dewdrop Shimmer
    const isSparkle = p >= 0.98;
    sparkleGroup.visible = isSparkle;
    if (isSparkle) {
      sparkles.forEach((sp, idx) => {
        const ang = (idx * Math.PI * 2) / sparkles.length + time * 0.5;
        const rad = 0.35 + Math.sin(time * 1.8 + idx) * 0.08;
        sp.position.set(
          Math.cos(ang) * rad,
          headGroup.position.y + 0.2 + Math.sin(time * 2.2 + idx) * 0.1,
          Math.sin(ang) * rad
        );
      });
    }
  };

  const stageToProgress = (stg: GrowthStage): number => {
    switch (stg) {
      case 'seed': return 0.05;
      case 'sprout': return 0.22;
      case 'bud': return 0.42;
      case 'blooming': return 0.76;
      case 'lush': return 0.92;
      case 'sparkle': return 1.0;
    }
  };

  update(stageToProgress(initialStage), 0);

  const dispose = () => {
    geometriesToDispose.forEach((g) => g.dispose());
    materialsToDispose.forEach((m) => m.dispose());
  };

  return {
    group: rootGroup,
    update,
    dispose
  };
}
