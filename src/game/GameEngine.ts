import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';
import type { LocationConfig } from '../data/locations';
import { ITEMS } from '../data/items';
import type { Race } from '../data/classes';
import { RACES } from '../data/classes';
import type { Equipment } from '../store/gameStore';
import { playSfx } from '../audio/sfx';

export interface JoystickInput {
  dx: number;
  dz: number;
}

export interface ResourceObject {
  id: string;
  type: string;
  mesh: THREE.Mesh;
  collected: boolean;
  position: THREE.Vector3;
}

export interface GameCallbacks {
  onResourceNear: (id: string | null) => void;
  onPortalNear: (near: boolean) => void;
  onPortalEnter: () => void;
  onPositionUpdate: (pos: { x: number; z: number }) => void;
}

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private player: THREE.Group;
  private resources: ResourceObject[] = [];
  private portalMesh: THREE.Group | null = null;
  private portalPosition = new THREE.Vector3(18, 0, 0);
  private animId = 0;
  private mounted = false;
  private joystick: JoystickInput = { dx: 0, dz: 0 };
  private callbacks: GameCallbacks;
  private playerSpeed = 4.5;
  private lastTime = 0;
  private nearResource: string | null = null;
  private nearPortal = false;
  private camOffset = new THREE.Vector3(0, 7, 10);
  private currentEquipment: Record<string, string | null> = {};
  private equipMeshes: { head?: THREE.Mesh; weapon?: THREE.Mesh } = {};
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private clock = new THREE.Clock();
  private glowMaterials: THREE.MeshStandardMaterial[] = [];
  private collisionBoxes: { box: THREE.Box3; position: THREE.Vector3; size: THREE.Vector3 }[] = [];
  private playerCollider = new THREE.Vector3(0.4, 1.8, 0.4);
  private environmentObjects: THREE.Object3D[] = [];

  constructor(canvas: HTMLCanvasElement, location: LocationConfig, callbacks: GameCallbacks, race: Race = 'human') {
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(location.skyColor);
    this.scene.fog = new THREE.Fog(location.fogColor, location.fogNear, location.fogFar);

    // Post-processing: Bloom
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.6, 0.4, 0.85
    );
    this.composer.addPass(this.bloomPass);

    this.setupLights();
    this.buildGround(location.groundColor);
    this.buildBoundary();
    this.buildResources(location.resources);
    this.buildPortal();
    this.buildEnvironment(location);
    this.player = this.buildPlayer(race);
    this.scene.add(this.player);
    this.updateCamera(true);
  }

  private createGlowMaterial(color: number, emissiveColor: number): THREE.MeshStandardMaterial {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: emissiveColor,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.3,
    });
    this.glowMaterials.push(mat);
    return mat;
  }

  private setupLights() {
    this.scene.add(new THREE.AmbientLight(0x223344, 0.6));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);
    const fill = new THREE.HemisphereLight(0x4488ff, 0x336622, 0.5);
    this.scene.add(fill);
  }

  private buildGround(color: string) {
    const geo = new THREE.PlaneGeometry(60, 60, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Decorative grass tufts
    for (let i = 0; i < 30; i++) {
      const bladeGeo = new THREE.ConeGeometry(0.02, 0.1 + Math.random() * 0.15, 3);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1),
        roughness: 0.9,
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(
        (Math.random() - 0.5) * 50,
        0.05,
        (Math.random() - 0.5) * 50
      );
      blade.rotation.set(
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3
      );
      this.scene.add(blade);
    }
  }

  private buildBoundary() {
    const wallGeo = new THREE.BoxGeometry(60, 8, 0.5);
    const wallMat = new THREE.MeshBasicMaterial({ visible: false });
    const walls = [
      { pos: new THREE.Vector3(0, 4, -30) },
      { pos: new THREE.Vector3(0, 4, 30) },
    ];
    const wallSide = new THREE.BoxGeometry(0.5, 8, 60);
    walls.forEach(w => {
      const m = new THREE.Mesh(wallGeo, wallMat);
      m.position.copy(w.pos);
      this.scene.add(m);
    });
    [new THREE.Vector3(-30, 4, 0), new THREE.Vector3(30, 4, 0)].forEach(p => {
      const m = new THREE.Mesh(wallSide, wallMat);
      m.position.copy(p);
      this.scene.add(m);
    });
  }

  private buildResources(spawns: LocationConfig['resources']) {
    const colors: Record<string, number> = {
      wood: 0x6b3a2a, ore: 0x708090, gold: 0xffd700, herb: 0x228b22,
    };
    spawns.forEach(spawn => {
      for (let i = 0; i < spawn.count; i++) {
        const id = `res_${spawn.type}_${i}_${spawn.x}_${spawn.z}`;
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetZ = (Math.random() - 0.5) * 4;
        const mesh = this.createResourceMesh(spawn.type, colors[spawn.type] ?? 0xffffff);
        const pos = new THREE.Vector3(spawn.x + offsetX, 0, spawn.z + offsetZ);
        mesh.position.copy(pos);
        this.scene.add(mesh);
        this.resources.push({ id, type: spawn.type, mesh, collected: false, position: pos });
      }
    });
  }

  private createResourceMesh(type: string, color: number): THREE.Mesh {
    let geo: THREE.BufferGeometry;
    if (type === 'wood') {
      const trunk = new THREE.CylinderGeometry(0.12, 0.16, 1.2, 6);
      const m = new THREE.Mesh(trunk, new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.9 }));
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 1.2, 7),
        new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 })
      );
      top.position.y = 1.4;
      m.position.y = 0.6;
      const g = new THREE.Group() as unknown as THREE.Mesh;
      (g as unknown as THREE.Group).add(m, top);
      return g;
    } else if (type === 'ore' || type === 'gold') {
      geo = new THREE.DodecahedronGeometry(0.35, 0);
    } else {
      geo = new THREE.SphereGeometry(0.2, 6, 6);
    }
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: type === 'gold' ? 0.8 : 0.3,
      roughness: type === 'gold' ? 0.2 : 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.35;
    return mesh;
  }

  private buildPortal() {
    const g = new THREE.Group();
    // Outer ring with glow
    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.12, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x4c1d95,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.3,
      })
    );
    g.add(outer);
    // Inner disc with magical swirl
    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 32),
      new THREE.MeshBasicMaterial({
        color: 0x5b21b6,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
    );
    g.add(inner);
    // Glow ring
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.06, 8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xc4b5fd,
        transparent: true,
        opacity: 0.4,
      })
    );
    g.add(glow);
    // Magical particles around portal
    for (let i = 0; i < 12; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.6 })
      );
      const angle = (i / 12) * Math.PI * 2;
      particle.position.set(Math.cos(angle) * 1.6, Math.sin(angle) * 0.5, Math.sin(angle) * 0.3);
      particle.userData = { angle, speed: 0.5 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
      g.add(particle);
    }
    g.position.copy(this.portalPosition);
    g.position.y = 1.2;
    this.scene.add(g);
    this.portalMesh = g;

    // Point light for glow
    const light = new THREE.PointLight(0x7c3aed, 2, 6);
    light.position.copy(this.portalPosition);
    light.position.y = 1.2;
    this.scene.add(light);
  }

  private buildEnvironment(location: LocationConfig) {
    if (location.id === 'village') {
      // Detailed village houses with glow windows
      const housePositions = [
        { x: -12, z: -12 }, { x: -5, z: -12 }, { x: 2, z: -12 }, { x: 9, z: -12 },
        { x: -12, z: 12 }, { x: -5, z: 12 }, { x: 2, z: 12 }, { x: 9, z: 12 },
      ];
      for (const hp of housePositions) {
        const house = this.makeDetailedHouse(new THREE.Vector3(hp.x, 0, hp.z));
        this.scene.add(house);
        this.environmentObjects.push(house);
      }
      // Village center well
      const well = this.makeWell(new THREE.Vector3(0, 0, 0));
      this.scene.add(well);
      this.environmentObjects.push(well);
      // Fence posts
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.8, 4),
          new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 0.9 })
        );
        post.position.set(Math.cos(angle) * 14, 0.4, Math.sin(angle) * 14);
        this.scene.add(post);
      }
    } else if (location.id === 'forest') {
      // Detailed trees
      for (let i = 0; i < 12; i++) {
        const tree = this.makeDetailedTree();
        tree.position.set(-18 + (i % 6) * 6, 0, -16 + Math.floor(i / 6) * 6);
        tree.scale.setScalar(1.2 + Math.random() * 0.8);
        this.scene.add(tree);
        this.environmentObjects.push(tree);
      }
      // Glowing mushrooms
      for (let i = 0; i < 8; i++) {
        const mush = this.makeGlowingMushroom();
        mush.position.set(
          (Math.random() - 0.5) * 30,
          0,
          (Math.random() - 0.5) * 30
        );
        this.scene.add(mush);
      }
    } else if (location.id === 'mines') {
      // Detailed rocks with crystal formations
      for (let i = 0; i < 8; i++) {
        const rock = this.makeDetailedRock();
        rock.position.set(-15 + i * 4, 0.3, -14);
        rock.scale.setScalar(0.8 + Math.random() * 0.6);
        this.scene.add(rock);
        this.environmentObjects.push(rock);
      }
      // Glowing crystals
      for (let i = 0; i < 5; i++) {
        const crystal = this.makeGlowingCrystal();
        crystal.position.set(
          -12 + i * 5 + (Math.random() - 0.5) * 2,
          0.2,
          -10 + (Math.random() - 0.5) * 4
        );
        this.scene.add(crystal);
      }
    }
  }

  private makeDetailedHouse(pos: THREE.Vector3): THREE.Group {
    const g = new THREE.Group();
    g.position.copy(pos);

    // Stone walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9, metalness: 0.05 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 2.2), wallMat);
    walls.position.y = 1;
    walls.castShadow = true;
    g.add(walls);

    // Wooden roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: 0.8 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 1.5, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.75;
    roof.castShadow = true;
    g.add(roof);

    // Glowing windows
    const windowMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.7,
    });
    for (const wx of [-0.6, 0.6]) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), windowMat);
      win.position.set(wx, 1.0, 1.12);
      win.userData.isGlow = true;
      g.add(win);
    }

    // Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.9 });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8), doorMat);
    door.position.set(0, 0.5, 1.12);
    g.add(door);

    // Collision box
    this.collisionBoxes.push({
      box: new THREE.Box3(
        new THREE.Vector3(pos.x - 1.3, 0, pos.z - 1.1),
        new THREE.Vector3(pos.x + 1.3, 3.5, pos.z + 1.1)
      ),
      position: pos.clone(),
      size: new THREE.Vector3(2.6, 3.5, 2.2),
    });

    return g;
  }

  private makeWell(pos: THREE.Vector3): THREE.Group {
    const g = new THREE.Group();
    g.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a6a7a, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), stoneMat);
    base.position.y = 0.25;
    g.add(base);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x5a5a6a, roughness: 0.8 });
    for (let i = 0; i < 2; i++) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6), pillarMat);
      pillar.position.set(i === 0 ? -0.5 : 0.5, 1.0, 0);
      g.add(pillar);
    }

    // Cross beam
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), pillarMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 1.6, 0);
    g.add(beam);

    // Glowing water
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.5,
    });
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.35;
    water.userData.isGlow = true;
    g.add(water);

    return g;
  }

  private makeDetailedTree(): THREE.Group {
    const g = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 1.5, 5), trunkMat);
    trunk.position.y = 0.75;
    g.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8 });
    const leaf1 = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 6), leafMat);
    leaf1.position.y = 1.5;
    g.add(leaf1);
    const leaf2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 6), leafMat);
    leaf2.position.y = 2.0;
    g.add(leaf2);

    return g;
  }

  private makeGlowingMushroom(): THREE.Group {
    const g = new THREE.Group();
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.2, 5), stemMat);
    stem.position.y = 0.1;
    g.add(stem);

    const capMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x4a9eff : 0x22cc66,
      transparent: true,
      opacity: 0.8,
    });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 5, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    cap.position.y = 0.2;
    cap.userData.isGlow = true;
    g.add(cap);

    const light = new THREE.PointLight(0x4a9eff, 0.5, 2);
    light.position.y = 0.3;
    g.add(light);

    return g;
  }

  private makeDetailedRock(): THREE.Group {
    const g = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4040, roughness: 0.9 });
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.3, 0), rockMat);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    g.add(rock);
    return g;
  }

  private makeGlowingCrystal(): THREE.Group {
    const g = new THREE.Group();
    const crystalMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.7,
    });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.15 + Math.random() * 0.1), crystalMat);
    crystal.position.y = 0.2;
    crystal.userData.isGlow = true;
    g.add(crystal);

    const light = new THREE.PointLight(0x4a9eff, 0.8, 3);
    light.position.y = 0.3;
    g.add(light);

    return g;
  }

  private buildPlayer(race: Race): THREE.Group {
    const raceDef = RACES.find(r => r.id === race) ?? RACES[0];
    const sc = raceDef.bodyScale;
    const g = new THREE.Group();

    // === DETAILED LOW-POLY CHARACTER ===

    // Torso with segmented armor
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      metalness: 0.4,
      roughness: 0.6,
    });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * sc.x, 0.18 * sc.x, 0.75 * sc.y, 8), torsoMat);
    torso.position.y = 0.75;
    torso.castShadow = true;
    g.add(torso);

    // Chest plate with magical glow
    const chestMat = this.createGlowMaterial(0x2a4a7a, 0x4a9eff);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.44 * sc.x, 0.3 * sc.y, 0.26 * sc.z), chestMat);
    chest.position.set(0, 0.82, 0.06);
    g.add(chest);

    // Glowing rune on chest
    const runeChestMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const runeChest = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.08, 6), runeChestMat);
    runeChest.position.set(0, 0.84, 0.2);
    runeChest.userData.isGlow = true;
    g.add(runeChest);

    // Belt with magical buckle
    const beltMat = this.createGlowMaterial(0x8a6a2a, 0xfbbf24);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.22 * sc.x, 0.03, 6, 16), beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.45;
    g.add(belt);

    // Pauldrons with glow
    for (const sx of [-0.32 * sc.x, 0.32 * sc.x]) {
      const pSize = raceDef.isBulky ? 0.16 : 0.12;
      const pauldronMat = this.createGlowMaterial(
        raceDef.isBulky ? 0x8a6a2a : 0xfbbf24,
        0xfbbf24
      );
      const p = new THREE.Mesh(new THREE.SphereGeometry(pSize, 6, 6), pauldronMat);
      p.position.set(sx, 1.05, 0);
      g.add(p);

      // Spikes on pauldrons
      for (let i = 0; i < 3; i++) {
        const spikeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 });
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.08, 4), spikeMat);
        spike.position.set(sx, 1.12 + i * 0.02, 0.06 + i * 0.03);
        spike.rotation.x = -0.3;
        spike.userData.isGlow = true;
        g.add(spike);
      }
    }

    // Head with detail
    const headMat = new THREE.MeshStandardMaterial({ color: raceDef.skinColor, roughness: 0.7 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), headMat);
    head.position.y = 1.3;
    head.castShadow = true;
    g.add(head);

    // Eyes with magical glow
    for (const side of [-1, 1]) {
      const eyeMat = this.createGlowMaterial(0x4a9eff, 0x4a9eff);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
      eye.position.set(side * 0.08, 1.32, 0.18);
      g.add(eye);
    }

    // Helmet with glow
    const helmMat = this.createGlowMaterial(0x8a6a2a, 0xfbbf24);
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      helmMat
    );
    helm.position.y = 1.38;
    g.add(helm);

    // Helmet crest glow
    const crestMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.8 });
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.12, 0.2), crestMat);
    crest.position.set(0, 1.55, 0);
    crest.userData.isGlow = true;
    g.add(crest);

    // Elf ears
    if (raceDef.hasEars) {
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.03, 0.18, 3),
          new THREE.MeshStandardMaterial({ color: raceDef.skinColor })
        );
        ear.position.set(side * 0.24, 1.37, 0);
        ear.rotation.z = side * -0.5;
        g.add(ear);
      }
    }

    // Undead glow
    if (race === 'undead') {
      const undeadGlow = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.25 })
      );
      undeadGlow.position.y = 1.3;
      undeadGlow.userData.isGlow = true;
      g.add(undeadGlow);
    }

    // Arms with bracers
    for (const ax of [-0.32 * sc.x, 0.32 * sc.x]) {
      const armMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.3, 5), armMat);
      arm.position.set(ax, 0.65, 0);
      g.add(arm);

      // Bracer with glow
      const bracerMat = this.createGlowMaterial(0x6a5a3a, 0xfbbf24);
      const bracer = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.1, 5), bracerMat);
      bracer.position.set(ax, 0.48, 0);
      g.add(bracer);
    }

    // Legs with greaves
    for (const lx of [-0.1 * sc.x, 0.1 * sc.x]) {
      const thighMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.3, 5), thighMat);
      thigh.position.set(lx, 0.25, 0);
      g.add(thigh);

      // Knee with glow
      const kneeMat = this.createGlowMaterial(0x6a5a3a, 0xfbbf24);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.06, 5, 5), kneeMat);
      knee.position.set(lx, 0.1, 0.02);
      g.add(knee);

      // Shin
      const shinMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.25, 5), shinMat);
      shin.position.set(lx, -0.05, 0);
      g.add(shin);

      // Boots with glow
      const bootMat = this.createGlowMaterial(0x4a3a2a, 0xfbbf24);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.12 * sc.x, 0.12, 0.16), bootMat);
      boot.position.set(lx, -0.2, 0.02);
      g.add(boot);
    }

    // === MAGICAL SWORD ===
    const swordGroup = new THREE.Group();

    // Blade
    const bladeMat = this.createGlowMaterial(0xe8e8f0, 0x4a9eff);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.02), bladeMat);
    blade.position.y = 0.35;
    swordGroup.add(blade);

    // Blade edge glow
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.9 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.65, 0.008), edgeMat);
    edge.position.set(0.025, 0.35, 0);
    edge.userData.isGlow = true;
    swordGroup.add(edge);

    // Guard
    const guardMat = this.createGlowMaterial(0xfbbf24, 0xfbbf24);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.04), guardMat);
    swordGroup.add(guard);

    // Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 5), handleMat);
    handle.position.y = -0.08;
    swordGroup.add(handle);

    // Pommel glow
    const pommelMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.9 });
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 5, 5), pommelMat);
    pommel.position.y = -0.15;
    pommel.userData.isGlow = true;
    swordGroup.add(pommel);

    swordGroup.position.set(0.4 * sc.x, 0.5, 0);
    swordGroup.rotation.z = -0.25;
    g.add(swordGroup);

    // === CAPE ===
    const capeMat = new THREE.MeshStandardMaterial({
      color: race === 'orc' ? 0x5a2a0a : race === 'undead' ? 0x2a2a3a : 0xcc2233,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7, 6, 6), capeMat);
    cape.position.set(0, 0.5, -0.18);
    cape.rotation.x = 0.1;
    g.add(cape);

    // === SHIELD ON BACK ===
    const shieldMat = this.createGlowMaterial(0x1e4aaf, 0x4a9eff);
    const shield = new THREE.Mesh(new THREE.CircleGeometry(0.25, 10), shieldMat);
    shield.position.set(0, 0.5, -0.22);
    shield.rotation.y = Math.PI;
    g.add(shield);

    // Shield emblem
    const emblemMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const emblem = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.12, 6), emblemMat);
    emblem.position.set(0, 0.51, -0.23);
    emblem.rotation.y = Math.PI;
    emblem.userData.isGlow = true;
    g.add(emblem);

    return g;
  }

  setJoystick(input: JoystickInput) {
    this.joystick = input;
  }

  updateEquipment(equipment: Equipment, inventory: Array<{ instanceId: string; itemId: string; quantity: number }>) {
    const headIId = equipment.head;
    const headInv = headIId ? inventory.find(i => i.instanceId === headIId) : null;
    const headItem = headInv ? ITEMS[headInv.itemId] : null;

    if (JSON.stringify(equipment) !== JSON.stringify(this.currentEquipment)) {
      this.currentEquipment = { ...equipment };

      // Remove old equip meshes
      if (this.equipMeshes.head) {
        this.player.remove(this.equipMeshes.head);
        this.equipMeshes.head = undefined;
      }
      if (this.equipMeshes.weapon) {
        this.player.remove(this.equipMeshes.weapon);
        this.equipMeshes.weapon = undefined;
      }

      // Add helmet
      if (headItem) {
        const helmMat = this.createGlowMaterial(
          new THREE.Color(headItem.color).getHex(),
          new THREE.Color(headItem.color).getHex()
        );
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.18, 8), helmMat);
        helm.position.y = 1.48;
        this.player.add(helm);
        this.equipMeshes.head = helm;
      }

      // Add weapon
      const weaponIId = equipment.weapon;
      const weaponInv = weaponIId ? inventory.find(i => i.instanceId === weaponIId) : null;
      const weaponItem = weaponInv ? ITEMS[weaponInv.itemId] : null;
      if (weaponItem) {
        const weaponMat = this.createGlowMaterial(
          new THREE.Color(weaponItem.color).getHex(),
          new THREE.Color(weaponItem.color).getHex()
        );
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), weaponMat);
        blade.position.set(0.4, 0.9, 0);
        blade.rotation.z = -0.3;
        this.player.add(blade);
        this.equipMeshes.weapon = blade;
      }
    }
  }

  collectResource(id: string) {
    const res = this.resources.find(r => r.id === id);
    if (!res || res.collected) return;
    res.collected = true;
    playSfx('gather');
    // Bounce animation then hide
    const startY = res.mesh.position.y;
    let t = 0;
    const anim = () => {
      t += 0.08;
      res.mesh.position.y = startY + Math.sin(t * Math.PI) * 0.5;
      if (t < 1) requestAnimationFrame(anim);
      else res.mesh.visible = false;
    };
    anim();
  }

  private updateCamera(instant = false) {
    const pp = this.player.position;
    const target = new THREE.Vector3(pp.x + this.camOffset.x, pp.y + this.camOffset.y, pp.z + this.camOffset.z);
    if (instant) {
      this.camera.position.copy(target);
    } else {
      this.camera.position.lerp(target, 0.06);
    }
    this.camera.lookAt(new THREE.Vector3(pp.x, pp.y + 0.8, pp.z));
  }

  start() {
    this.mounted = true;
    this.lastTime = performance.now();
    this.clock.start();
    this.loop();
  }

  stop() {
    this.mounted = false;
    cancelAnimationFrame(this.animId);
  }

  private loop = () => {
    if (!this.mounted) return;
    this.animId = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) * 0.001, 0.05);
    this.lastTime = now;

    const t = this.clock.getElapsedTime();

    this.updatePlayer(dt, t);
    this.updatePortal(now, t);
    this.animateGlow(t);
    this.checkProximity();
    this.updateCamera();
    this.composer.render();
  };

  private animateGlow(t: number) {
    this.glowMaterials.forEach(mat => {
      mat.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.2;
    });
  }

  private updatePlayer(dt: number, t: number) {
    const { dx, dz } = this.joystick;
    const len = Math.sqrt(dx * dx + dz * dz);

    // Idle breathing animation
    const breathe = Math.sin(t * 1.8) * 0.008;
    this.player.position.y = breathe;
    this.player.scale.y = 1 + breathe * 0.15;

    if (len > 0.05) {
      const nx = dx / len;
      const nz = dz / len;
      this.player.position.x += nx * this.playerSpeed * dt;
      this.player.position.z += nz * this.playerSpeed * dt;
      // Clamp to arena
      this.player.position.x = Math.max(-26, Math.min(26, this.player.position.x));
      this.player.position.z = Math.max(-26, Math.min(26, this.player.position.z));
      // Face direction
      const angle = Math.atan2(nx, nz);
      this.player.rotation.y = angle;
      // Leg bob animation
      const children = this.player.children;
      for (let i = children.length - 4; i < children.length - 2; i++) {
        if (children[i]) children[i].rotation.x = Math.sin(t * 4 + (i % 2) * Math.PI) * 0.4;
      }
      this.callbacks.onPositionUpdate({ x: this.player.position.x, z: this.player.position.z });
    }
  }

  private updatePortal(now: number, t: number) {
    if (!this.portalMesh) return;
    this.portalMesh.rotation.y = now * 0.001;
    const scale = 1 + Math.sin(now * 0.002) * 0.05;
    this.portalMesh.scale.setScalar(scale);

    // Animate portal particles
    this.portalMesh.children.forEach((child: THREE.Object3D) => {
      const data = child.userData as { angle?: number; speed?: number; offset?: number };
      if (data.angle !== undefined) {
        const yOffset = Math.sin(t * (data.speed ?? 1) + (data.offset ?? 0)) * 0.3;
        child.position.y = yOffset;
      }
    });
  }

  private checkProximity() {
    const pp = this.player.position;

    // Check resources
    let closestId: string | null = null;
    let closestDist = Infinity;
    for (const res of this.resources) {
      if (res.collected) continue;
      const d = pp.distanceTo(res.position);
      if (d < 2.2 && d < closestDist) {
        closestDist = d;
        closestId = res.id;
      }
    }
    if (closestId !== this.nearResource) {
      this.nearResource = closestId;
      this.callbacks.onResourceNear(closestId);
    }

    // Check portal
    const portalDist = pp.distanceTo(this.portalPosition);
    const isNear = portalDist < 3;
    if (isNear !== this.nearPortal) {
      this.nearPortal = isNear;
      this.callbacks.onPortalNear(isNear);
    }
    if (portalDist < 1.8) {
      this.callbacks.onPortalEnter();
    }
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  dispose() {
    this.stop();
    this.renderer.dispose();
    this.composer.dispose();
  }
}