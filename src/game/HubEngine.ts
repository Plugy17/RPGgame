import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';
import { ITEMS } from '../data/items';
import { playSfx } from '../audio/sfx';

const BOT_NAMES = ['VikingSlayer','ThorHammer','Freya92','OdinEye','Sigrid_pw','BjornFury','Loki_X','Skadi99','HeimdallR','Ragnhild','IronVordr','NordBear','ValhallG','GunnarK','HelgaW'];

const CITY_SIZE = 250;

export interface NpcDef {
  id: string;
  name: string;
  nameEn: string;
  position: THREE.Vector3;
  color: number;
  markerColor: string;
  markerText: string;
  role: 'quest' | 'vendor' | 'alchemist' | 'armorer' | 'tavern' | 'alliance_master' | 'arena_master';
}

export const HUB_NPCS: NpcDef[] = [
  { id:'galahad',   name:'Верховный Маг Галахад', nameEn:'Archmage Galahad',   position: new THREE.Vector3(-10, 0, -6),   color: 0x7c3aed, markerColor:'#c084fc', markerText:'Q', role:'quest' },
  { id:'darius',    name:'Купец Дариус',          nameEn:'Merchant Darius',     position: new THREE.Vector3(10, 0, -6),   color: 0xd97706, markerColor:'#fbbf24', markerText:'$', role:'vendor' },
  { id:'alchemist', name:'Алхимик Элара',        nameEn:'Alchemist Elara',     position: new THREE.Vector3(-40, 0, -30), color: 0x22c55e, markerColor:'#34d399', markerText:'A', role:'alchemist' },
  { id:'armorer',   name:'Кузнец Торвин',        nameEn:'Armorer Thorvin',     position: new THREE.Vector3(40, 0, -30),  color: 0x64748b, markerColor:'#94a3b8', markerText:'T', role:'armorer' },
  { id:'tavern',    name:'Тавернщик Хильда',      nameEn:'Tavernkeep Hilda',    position: new THREE.Vector3(-30, 0, 30),  color: 0xf59e0b, markerColor:'#fbbf24', markerText:'!', role:'tavern' },
  { id:'alliance_m',name:'Мастер Альянсов Рик',  nameEn:'Alliance Master Rick',position: new THREE.Vector3(30, 0, 30),   color: 0x3b82f6, markerColor:'#60a5fa', markerText:'G', role:'alliance_master' },
  { id:'arena_m',   name:'Глава Арены Кайл',     nameEn:'Arena Master Kael',   position: new THREE.Vector3(0, 0, 60),    color: 0xef4444, markerColor:'#f87171', markerText:'D', role:'arena_master' },
];

export interface BotPlayer { mesh: THREE.Group; target: THREE.Vector3; speed: number; name: string; }
export interface NpcObject { def: NpcDef; mesh: THREE.Group; position: THREE.Vector3; }
export interface HubCallbacks { onNpcNear: (npcId: string | null) => void; onPositionUpdate: (pos: { x: number; z: number }) => void; onBotClick: (name: string) => void; }

const STREAM_RADIUS = 50;
const STREAM_RADIUS_SQ = STREAM_RADIUS * STREAM_RADIUS;

interface CollisionBox { box: THREE.Box3; position: THREE.Vector3; size: THREE.Vector3; }

export class HubEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private player: THREE.Group;
  private bots: BotPlayer[] = [];
  private npcs: NpcObject[] = [];
  private torches: THREE.Group[] = [];
  private streamedObjects: THREE.Object3D[] = [];
  private collisionBoxes: CollisionBox[] = [];
  private animId = 0;
  private mounted = false;
  private joystick = { dx: 0, dz: 0 };
  private playerSpeed = 5;
  private lastTime = 0;
  private nearNpc: string | null = null;
  private callbacks: HubCallbacks;
  private camOffset = new THREE.Vector3(0, 10, 14);
  private currentEquipJson = '';
  private equipMeshes: { head?: THREE.Mesh; weapon?: THREE.Mesh } = {};
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private canvas: HTMLCanvasElement;
  private lastStreamUpdate = 0;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private clock = new THREE.Clock();
  private glowMaterials: THREE.MeshStandardMaterial[] = [];
  private playerCollider = new THREE.Vector3(0.4, 1.8, 0.4);

  constructor(canvas: HTMLCanvasElement, callbacks: HubCallbacks) {
    this.callbacks = callbacks;
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x0a0f1a);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 350);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1a);
    this.scene.fog = new THREE.FogExp2(0x0a0f1a, 0.012);

    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.5, 0.3, 0.9
    );
    this.composer.addPass(this.bloomPass);

    this.setupLights();
    this.buildGround();
    this.buildCitadel();
    this.spawnBots();
    this.spawnNpcs();
    this.player = this.buildCharacter(0x2a4a7a);
    this.scene.add(this.player);
    this.updateCamera(true);

    canvas.addEventListener('click', this.handleClick);
  }

  private handleClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const botMeshes = this.bots.map(b => b.mesh);
    const intersects = this.raycaster.intersectObjects(botMeshes, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      for (const bot of this.bots) {
        if (bot.mesh === hit || bot.mesh.children.includes(hit as THREE.Object3D)) {
          this.callbacks.onBotClick(bot.name);
          break;
        }
      }
    }
  };

  private setupLights() {
    this.scene.add(new THREE.AmbientLight(0x1a2a3a, 0.6));
    const moon = new THREE.DirectionalLight(0x6688aa, 1.2);
    moon.position.set(-10, 20, 10);
    this.scene.add(moon);
    const ambient = new THREE.HemisphereLight(0x404060, 0x202040, 0.4);
    this.scene.add(ambient);
  }

  private buildGround() {
    // Main ground
    const geo = new THREE.PlaneGeometry(500, 500, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.95, metalness: 0.05 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Cobblestone paths
    for (const [x1, z1, x2, z2] of [[0, -80, 0, 80], [-80, 0, 80, 0]] as number[][]) {
      const w = Math.abs(x2 - x1) || 5;
      const h = Math.abs(z2 - z1) || 160;
      const pathGeo = new THREE.PlaneGeometry(w || 5, h);
      const pathMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
      this.scene.add(path);
    }

    // Central fountain with glow
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, 2);

    const baseGeo = new THREE.CylinderGeometry(2.0, 2.4, 0.5, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.5, metalness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    fountainGroup.add(base);

    const waterGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.15, 16);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.7 });
    waterMat.userData = { isGlow: true };
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.55;
    fountainGroup.add(water);

    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.0, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.4, metalness: 0.4 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 1.5;
    fountainGroup.add(pillar);

    // Glowing crystals on fountain
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const crystalGeo = new THREE.OctahedronGeometry(0.15);
      const crystalMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.8 });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(Math.cos(angle) * 1.8, 0.6, Math.sin(angle) * 1.8);
      crystal.userData.isGlow = true;
      fountainGroup.add(crystal);
    }

    this.scene.add(fountainGroup);

    const fountainLight = new THREE.PointLight(0x4a9eff, 2, 6);
    fountainLight.position.set(0, 1, 2);
    this.scene.add(fountainLight);
  }

  private buildCitadel() {
    // Main keep with detailed architecture
    this.addDetailedBuilding(new THREE.Vector3(0, 0, -22), 14, 9, 12, 0x2a2a40, 0x5a3a2a, 'keep');
    this.addDetailedBuilding(new THREE.Vector3(-16, 0, -14), 10, 6, 8, 0x2a3a50, 0x4a2a1a, 'wing');
    this.addDetailedBuilding(new THREE.Vector3(16, 0, -14), 10, 6, 8, 0x2a4050, 0x1a2a4a, 'wing');

    // District buildings
    const districtBuildings: { x: number; z: number; w: number; h: number; d: number; wall: number; roof: number; type: string }[] = [
      { x: -40, z: -30, w: 8, h: 5, d: 6, wall: 0x1a3a2a, roof: 0x2a5a3a, type: 'alchemist' },
      { x: 40, z: -30, w: 9, h: 6, d: 8, wall: 0x3a3a4a, roof: 0x5a3a2a, type: 'armorer' },
      { x: -30, z: 30, w: 10, h: 5, d: 8, wall: 0x3a2a1a, roof: 0x5a2a0a, type: 'tavern' },
      { x: 30, z: 30, w: 8, h: 6, d: 8, wall: 0x1a2a4a, roof: 0x2a3a5a, type: 'alliance' },
      { x: 0, z: 65, w: 18, h: 7, d: 18, wall: 0x3a1a1a, roof: 0x5a2a2a, type: 'arena' },
      ...Array.from({ length: 40 }, (_, i) => ({
        x: (Math.random() - 0.5) * 220,
        z: (Math.random() - 0.5) * 220,
        w: 4 + Math.random() * 6,
        h: 3 + Math.random() * 5,
        d: 4 + Math.random() * 6,
        wall: 0x2a2a3a + Math.floor(Math.random() * 0x101010),
        roof: 0x3a2a1a + Math.floor(Math.random() * 0x101010),
        type: 'house',
      })),
    ];

    for (const b of districtBuildings) {
      this.addDetailedBuilding(
        new THREE.Vector3(b.x, 0, b.z),
        b.w, b.h, b.d,
        b.wall, b.roof, b.type
      );
    }

    // Towers with glow
    for (const [x, z] of [[-22, 5], [22, 5], [-12, -20], [12, -20]] as number[][]) {
      this.addGlowingTower(new THREE.Vector3(x, 0, z));
    }

    // Torches with glow
    const torchPositions = [[-8, 0, -5], [8, 0, -5], [-5, 0, 5], [5, 0, 5], [0, 0, -15], [0, 0, 12], [-12, 0, -8], [12, 0, -8]] as number[][];
    for (const [x, , z] of torchPositions) {
      this.addGlowingTorch(new THREE.Vector3(x, 0, z));
    }

    // District torches
    for (const pos of [[-40, 0, -20], [40, 0, -20], [-30, 0, 20], [30, 0, 20], [0, 0, 58]] as number[][]) {
      this.addGlowingTorch(new THREE.Vector3(pos[0], 0, pos[2]));
    }
  }

  private addDetailedBuilding(pos: THREE.Vector3, w: number, h: number, d: number, wallColor: number, roofColor: number, type: string) {
    const g = new THREE.Group();
    g.userData = { type: 'building', originX: pos.x, originZ: pos.z };

    // Main structure
    const wallsGeo = new THREE.BoxGeometry(w, h, d);
    const wallsMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.85, metalness: 0.1 });
    const walls = new THREE.Mesh(wallsGeo, wallsMat);
    walls.position.set(pos.x, h / 2, pos.z);
    g.add(walls);

    // Add collision box
    this.collisionBoxes.push({
      box: new THREE.Box3(
        new THREE.Vector3(pos.x - w / 2, 0, pos.z - d / 2),
        new THREE.Vector3(pos.x + w / 2, h, pos.z + d / 2)
      ),
      position: pos.clone(),
      size: new THREE.Vector3(w, h, d),
    });

    // Roof
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.45, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(pos.x, h + h * 0.22, pos.z);
    g.add(roof);

    // Glow windows
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.6 });
    for (const wx of [-w / 3.5, w / 3.5]) {
      for (const wy of [h * 0.35, h * 0.65]) {
        const winGeo = new THREE.PlaneGeometry(0.6, 0.9);
        const win = new THREE.Mesh(winGeo, windowMat.clone());
        win.position.set(pos.x + wx, wy, pos.z + d / 2 + 0.02);
        win.userData.isGlow = true;
        g.add(win);
      }
    }

    // Type-specific decorations
    if (type === 'keep') {
      // Glowing runes on keep
      for (let i = 0; i < 4; i++) {
        const runeGeo = new THREE.RingGeometry(0.15, 0.25, 6);
        const runeMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const rune = new THREE.Mesh(runeGeo, runeMat);
        rune.position.set(pos.x + (i - 1.5) * 2, h * 0.5, pos.z + d / 2 + 0.05);
        rune.userData.isGlow = true;
        g.add(rune);
      }
    } else if (type === 'arena') {
      // Arena flags
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 4, 6);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(pos.x + Math.cos(angle) * 6, 2, pos.z + Math.sin(angle) * 6);
        g.add(pole);

        const flagGeo = new THREE.PlaneGeometry(0.8, 1.2);
        const flagMat = new THREE.MeshBasicMaterial({ color: 0xcc3333, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(pos.x + Math.cos(angle) * 6.5, 3.5, pos.z + Math.sin(angle) * 6.5);
        flag.userData.isGlow = true;
        g.add(flag);
      }
    }

    this.scene.add(g);
    this.streamedObjects.push(g);
  }

  private addGlowingTower(pos: THREE.Vector3) {
    const g = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(1.5, 1.8, 10, 10);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a40, roughness: 0.6, metalness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(pos.x, 5, pos.z);
    g.add(body);

    const topGeo = new THREE.ConeGeometry(2.0, 4, 10);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x4a1a6a, roughness: 0.5, metalness: 0.3 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(pos.x, 12, pos.z);
    g.add(top);

    // Glowing beacon at top
    const beaconGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(pos.x, 14.5, pos.z);
    beacon.userData.isGlow = true;
    g.add(beacon);

    const beaconLight = new THREE.PointLight(0xfbbf24, 2, 12);
    beaconLight.position.set(pos.x, 14.5, pos.z);
    g.add(beaconLight);

    // Collision
    this.collisionBoxes.push({
      box: new THREE.Box3(
        new THREE.Vector3(pos.x - 1.8, 0, pos.z - 1.8),
        new THREE.Vector3(pos.x + 1.8, 14, pos.z + 1.8)
      ),
      position: pos.clone(),
      size: new THREE.Vector3(3.6, 14, 3.6),
    });

    this.scene.add(g);
  }

  private addGlowingTorch(pos: THREE.Vector3) {
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.07, 3.0, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(pos.x, 1.5, pos.z);
    this.scene.add(pole);

    const flameGroup = new THREE.Group();
    flameGroup.position.set(pos.x, 3.2, pos.z);

    const flameGeo = new THREE.ConeGeometry(0.15, 0.4, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.85 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 0.2;
    flame.userData.isGlow = true;
    flameGroup.add(flame);

    const innerGeo = new THREE.ConeGeometry(0.08, 0.25, 5);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.95 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = 0.15;
    inner.userData.isGlow = true;
    flameGroup.add(inner);

    this.scene.add(flameGroup);
    this.torches.push(flameGroup);

    const light = new THREE.PointLight(0xff6622, 2.5, 10);
    light.position.set(pos.x, 3.4, pos.z);
    this.scene.add(light);
  }

  private buildCharacter(color: number): THREE.Group {
    const g = new THREE.Group();

    // Body with better materials
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
    body.position.y = 0.8;
    g.add(body);

    // Pauldrons
    for (const sx of [-0.32, 0.32]) {
      const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.5 });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(sx, 1.08, 0);
      g.add(p);
    }

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.35;
    g.add(head);

    // Legs
    for (const lx of [-0.12, 0.12]) {
      const legGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.55, 6);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.6 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.28, 0);
      g.add(leg);
    }

    return g;
  }

  private makeNameSprite(text: string, color = '#ffffff'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 40;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    ctx.beginPath(); ctx.roundRect(4, 4, 248, 32, 6); ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 20);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.0, 0.32, 1);
    return sprite;
  }

  private makeMarkerSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 56; canvas.height = 56;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(28, 28, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 28, 29);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.6, 0.6, 1);
    return sprite;
  }

  private spawnBots() {
    const usedNames = new Set<string>();
    for (let i = 0; i < 8; i++) {
      let name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      while (usedNames.has(name)) name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      usedNames.add(name);

      const colors = [0xe74c3c, 0x27ae60, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x2980b9, 0x4a9eff];
      const mesh = this.buildCharacter(colors[i % colors.length]);
      const angle = (i / 8) * Math.PI * 2;
      const dist = 10 + Math.random() * 5;
      mesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      this.scene.add(mesh);

      const nameTag = this.makeNameSprite(name, '#93c5fd');
      nameTag.position.set(0, 2.0, 0);
      mesh.add(nameTag);

      this.bots.push({ mesh, target: this.randomBotTarget(), speed: 1.0 + Math.random() * 0.5, name });
    }
  }

  private randomBotTarget(): THREE.Vector3 {
    const targets = [
      new THREE.Vector3(-10, 0, -5), new THREE.Vector3(10, 0, -5), new THREE.Vector3(0, 0, 3),
      new THREE.Vector3(-8, 0, 8), new THREE.Vector3(8, 0, 8), new THREE.Vector3(0, 0, 12),
      new THREE.Vector3(-40, 0, -25), new THREE.Vector3(40, 0, -25),
      new THREE.Vector3(-30, 0, 25), new THREE.Vector3(30, 0, 25),
      new THREE.Vector3(0, 0, 60),
    ];
    return targets[Math.floor(Math.random() * targets.length)].clone();
  }

  private spawnNpcs() {
    for (const def of HUB_NPCS) {
      const mesh = this.buildCharacter(def.color);
      mesh.position.copy(def.position);
      this.scene.add(mesh);
      const nameTag = this.makeNameSprite(def.name, '#fbbf24');
      nameTag.position.set(0, 2.3, 0);
      mesh.add(nameTag);
      const marker = this.makeMarkerSprite(def.markerText, def.markerColor);
      marker.position.set(0, 2.8, 0);
      mesh.add(marker);
      this.npcs.push({ def, mesh, position: def.position.clone() });
    }
  }

  setJoystick(input: { dx: number; dz: number }) { this.joystick = input; }

  updateEquipment(equipment: { head: string | null; weapon: string | null }, inventory: Array<{ instanceId: string; itemId: string }>) {
    const json = JSON.stringify(equipment);
    if (json === this.currentEquipJson) return;
    this.currentEquipJson = json;
    if (this.equipMeshes.head) { this.player.remove(this.equipMeshes.head); this.equipMeshes.head = undefined; }
    if (this.equipMeshes.weapon) { this.player.remove(this.equipMeshes.weapon); this.equipMeshes.weapon = undefined; }
    const headInv = equipment.head ? inventory.find(i => i.instanceId === equipment.head) : null;
    const headDef = headInv ? ITEMS[headInv.itemId] : null;
    if (headDef) {
      const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.18, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(headDef.color), roughness: 0.3, metalness: 0.5 }));
      helm.position.y = 1.47;
      this.player.add(helm);
      this.equipMeshes.head = helm;
    }
    const weapInv = equipment.weapon ? inventory.find(i => i.instanceId === equipment.weapon) : null;
    const weapDef = weapInv ? ITEMS[weapInv.itemId] : null;
    if (weapDef) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.65, 0.05), new THREE.MeshStandardMaterial({ color: new THREE.Color(weapDef.color), roughness: 0.2, metalness: 0.7 }));
      blade.position.set(0.42, 1.0, 0);
      blade.rotation.z = -0.3;
      this.player.add(blade);
      this.equipMeshes.weapon = blade;
    }
  }

  updateSkin(skinId: string) {
    const skinDef = ITEMS[skinId];
    if (!skinDef) return;
    const body = this.player.children[0] as THREE.Mesh;
    if (body) {
      const mat = body.material as THREE.MeshStandardMaterial;
      mat.color.set(skinDef.color);
      if (skinId === 'skin_fire') { mat.emissive = new THREE.Color(0x661100); mat.emissiveIntensity = 0.5; }
      else if (skinId === 'skin_ice') { mat.emissive = new THREE.Color(0x113366); mat.emissiveIntensity = 0.5; }
      else if (skinId === 'skin_shadow') { mat.emissive = new THREE.Color(0x111111); mat.emissiveIntensity = 0.7; }
      else { mat.emissive = new THREE.Color(0x000000); mat.emissiveIntensity = 0; }
    }
  }

  private checkCollision(newX: number, newZ: number): boolean {
    const halfW = this.playerCollider.x / 2;
    const halfD = this.playerCollider.z / 2;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newX - halfW, 0, newZ - halfD),
      new THREE.Vector3(newX + halfW, this.playerCollider.y, newZ + halfD)
    );
    for (const cb of this.collisionBoxes) {
      if (playerBox.intersectsBox(cb.box)) return true;
    }
    return false;
  }

  start() { this.mounted = true; this.lastTime = performance.now(); this.clock.start(); this.loop(); }
  stop() { this.mounted = false; cancelAnimationFrame(this.animId); }

  private updateStreaming() {
    const px = this.player.position.x;
    const pz = this.player.position.z;
    for (const obj of this.streamedObjects) {
      const ox = (obj.userData as { originX?: number }).originX ?? obj.position.x;
      const oz = (obj.userData as { originZ?: number }).originZ ?? obj.position.z;
      const dx = px - ox;
      const dz = pz - oz;
      const distSq = dx * dx + dz * dz;
      obj.visible = distSq < STREAM_RADIUS_SQ;
    }
  }

  private loop = () => {
    if (!this.mounted) return;
    this.animId = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) * 0.001, 0.05);
    this.lastTime = now;

    const t = this.clock.getElapsedTime();

    this.updatePlayer(dt);
    this.updateBots(dt, t);
    this.animateTorches(t);

    if (now - this.lastStreamUpdate > 150) {
      this.lastStreamUpdate = now;
      this.updateStreaming();
    }

    this.checkNpcProximity();
    this.updateCamera();
    this.composer.render();
  };

  private updatePlayer(dt: number) {
    const { dx, dz } = this.joystick;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0.05) {
      const nx = dx / len, nz = dz / len;
      const newX = this.player.position.x + nx * this.playerSpeed * dt;
      const newZ = this.player.position.z + nz * this.playerSpeed * dt;

      // Check collision for X movement
      if (!this.checkCollision(newX, this.player.position.z)) {
        this.player.position.x = Math.max(-CITY_SIZE, Math.min(CITY_SIZE, newX));
      }
      // Check collision for Z movement
      if (!this.checkCollision(this.player.position.x, newZ)) {
        this.player.position.z = Math.max(-CITY_SIZE, Math.min(CITY_SIZE, newZ));
      }

      this.player.rotation.y = Math.atan2(nx, nz);
      const t = performance.now() * 0.005;
      for (let i = 4; i < 6; i++) { const c = this.player.children[i]; if (c) c.rotation.x = Math.sin(t * 4 + (i % 2) * Math.PI) * 0.4; }
      this.callbacks.onPositionUpdate({ x: this.player.position.x, z: this.player.position.z });
    }
  }

  private updateBots(dt: number, t: number) {
    for (const bot of this.bots) {
      const diff = bot.target.clone().sub(bot.mesh.position);
      const dist = diff.length();
      if (dist < 0.8) { if (Math.random() < 0.015) bot.target = this.randomBotTarget(); continue; }
      const dir = diff.normalize();
      bot.mesh.position.x += dir.x * bot.speed * dt;
      bot.mesh.position.z += dir.z * bot.speed * dt;
      bot.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      for (let i = 4; i < 6; i++) { const c = bot.mesh.children[i]; if (c) c.rotation.x = Math.sin(t * 4 * bot.speed + (i % 2) * Math.PI) * 0.35; }
    }
  }

  private animateTorches(t: number) {
    for (const torch of this.torches) {
      const flame = torch.children[0] as THREE.Mesh;
      const inner = torch.children[1] as THREE.Mesh;
      if (flame) {
        flame.scale.y = 1 + Math.sin(t * 8 + torch.id) * 0.25;
        flame.scale.x = 1 + Math.cos(t * 10 + torch.id) * 0.1;
      }
      if (inner) {
        inner.scale.y = 1 + Math.sin(t * 10 + torch.id) * 0.2;
      }
    }
  }

  private checkNpcProximity() {
    const pp = this.player.position;
    let closestId: string | null = null, closestDist = Infinity;
    for (const npc of this.npcs) {
      const d = pp.distanceTo(npc.position);
      if (d < 4 && d < closestDist) { closestDist = d; closestId = npc.def.id; }
    }
    if (closestId !== this.nearNpc) { this.nearNpc = closestId; this.callbacks.onNpcNear(closestId); }
  }

  private updateCamera(instant = false) {
    const pp = this.player.position;
    const target = new THREE.Vector3(pp.x + this.camOffset.x, pp.y + this.camOffset.y, pp.z + this.camOffset.z);
    if (instant) this.camera.position.copy(target);
    else this.camera.position.lerp(target, 0.04);
    this.camera.lookAt(new THREE.Vector3(pp.x, pp.y + 1, pp.z));
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  dispose() { this.stop(); this.canvas.removeEventListener('click', this.handleClick); this.renderer.dispose(); }
}
