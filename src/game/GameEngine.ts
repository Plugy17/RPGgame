import * as THREE from 'three';
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

  constructor(canvas: HTMLCanvasElement, location: LocationConfig, callbacks: GameCallbacks, race: Race = 'human') {
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = false;

    this.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(location.skyColor);
    this.scene.fog = new THREE.Fog(location.fogColor, location.fogNear, location.fogFar);

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

  private setupLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sun.position.set(10, 20, 10);
    this.scene.add(sun);
    const fill = new THREE.HemisphereLight(0x4488ff, 0x336622, 0.5);
    this.scene.add(fill);
  }

  private buildGround(color: string) {
    const geo = new THREE.PlaneGeometry(60, 60, 8, 8);
    const mat = new THREE.MeshLambertMaterial({ color });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  }

  private buildBoundary() {
    // Invisible walls
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
      const m = new THREE.Mesh(trunk, new THREE.MeshLambertMaterial({ color: 0x5c3317 }));
      const top = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 1.2, 7),
        new THREE.MeshLambertMaterial({ color: 0x2d5a27 })
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
    const mat = new THREE.MeshPhongMaterial({ color, shininess: type === 'gold' ? 150 : 30 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.35;
    return mesh;
  }

  private buildPortal() {
    const g = new THREE.Group();
    // Outer ring
    const outer = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.12, 8, 32),
      new THREE.MeshPhongMaterial({ color: 0x7c3aed, emissive: 0x4c1d95, emissiveIntensity: 0.8, shininess: 100 })
    );
    g.add(outer);
    // Inner disc
    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(1.0, 32),
      new THREE.MeshBasicMaterial({ color: 0x5b21b6, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    g.add(inner);
    // Glow ring
    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.06, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.4 })
    );
    g.add(glow);
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
      // Add simple houses
      for (let i = 0; i < 4; i++) {
        const hx = -12 + i * 7;
        const house = this.makeHouse(new THREE.Vector3(hx, 0, -12));
        this.scene.add(house);
      }
    } else if (location.id === 'forest') {
      for (let i = 0; i < 8; i++) {
        const tree = this.createResourceMesh('wood', 0);
        tree.position.set(-18 + i * 5, 0, -16);
        tree.scale.setScalar(1.5 + Math.random());
        this.scene.add(tree);
      }
    } else if (location.id === 'mines') {
      // Rocks scattered
      for (let i = 0; i < 10; i++) {
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.6, 0),
          new THREE.MeshLambertMaterial({ color: 0x4a4040 })
        );
        rock.position.set(-15 + i * 3.5, 0.3, -14);
        this.scene.add(rock);
      }
    }
  }

  private makeHouse(pos: THREE.Vector3): THREE.Group {
    const g = new THREE.Group();
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2, 2),
      new THREE.MeshLambertMaterial({ color: 0xd4a76a })
    );
    walls.position.y = 1;
    g.add(walls);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2, 1.5, 4),
      new THREE.MeshLambertMaterial({ color: 0x8b2500 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 2.75;
    g.add(roof);
    g.position.copy(pos);
    return g;
  }

  private buildPlayer(race: Race): THREE.Group {
    const raceDef = RACES.find(r => r.id === race) ?? RACES[0];
    const sc = raceDef.bodyScale;
    const g = new THREE.Group();

    // Torso
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * sc.x, 0.18 * sc.x, 0.75 * sc.y, 6),
      new THREE.MeshPhongMaterial({ color: 0x2a4a7a, shininess: 80 })
    );
    body.position.y = 0.75;
    g.add(body);

    // Chest plate
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.44 * sc.x, 0.3 * sc.y, 0.26 * sc.z),
      new THREE.MeshPhongMaterial({ color: 0x4a6a9a, shininess: 100 })
    );
    chest.position.set(0, 0.82, 0.06);
    g.add(chest);

    // Pauldrons
    for (const sx of [-0.32 * sc.x, 0.32 * sc.x]) {
      const pSize = raceDef.isBulky ? 0.16 : 0.1;
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(pSize, 5, 5),
        new THREE.MeshPhongMaterial({ color: raceDef.isBulky ? 0x8a6a2a : 0xfbbf24, shininess: 100 })
      );
      p.position.set(sx, 1.05, 0);
      g.add(p);
    }

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshPhongMaterial({ color: raceDef.skinColor, shininess: 60 })
    );
    head.position.y = 1.3;
    g.add(head);

    // Elf ears
    if (raceDef.hasEars) {
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.03, 0.18, 3),
          new THREE.MeshPhongMaterial({ color: raceDef.skinColor })
        );
        ear.position.set(side * 0.22, 1.37, 0);
        ear.rotation.z = side * -0.5;
        g.add(ear);
      }
    }

    // Undead glow
    if (race === 'undead') {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 8, 8),
        new THREE.MeshPhongMaterial({ color: 0xc8b8a8, transparent: true, opacity: 0.25, emissive: 0x112211, emissiveIntensity: 0.3 })
      );
      glow.position.y = 1.3;
      g.add(glow);
    }

    // Arms
    for (const ax of [-0.32 * sc.x, 0.32 * sc.x]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.45, 5),
        new THREE.MeshPhongMaterial({ color: 0x2a4a7a, shininess: 60 })
      );
      arm.position.set(ax, 0.65, 0);
      g.add(arm);
    }

    // Legs
    for (const lx of [-0.1 * sc.x, 0.1 * sc.x]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.45, 5),
        new THREE.MeshPhongMaterial({ color: 0x1e3a5f, shininess: 60 })
      );
      leg.position.set(lx, 0.25, 0);
      g.add(leg);
      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.12 * sc.x, 0.12, 0.16),
        new THREE.MeshPhongMaterial({ color: race === 'undead' ? 0x3a3a3a : 0x4a3a2a, shininess: 40 })
      );
      boot.position.set(lx, 0.06, 0.02);
      g.add(boot);
    }

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
        const helm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.26, 0.27, 0.18, 8),
          new THREE.MeshPhongMaterial({ color: new THREE.Color(headItem.color), shininess: 100 })
        );
        helm.position.y = 1.48;
        this.player.add(helm);
        this.equipMeshes.head = helm;
      }

      // Add weapon
      const weaponIId = equipment.weapon;
      const weaponInv = weaponIId ? inventory.find(i => i.instanceId === weaponIId) : null;
      const weaponItem = weaponInv ? ITEMS[weaponInv.itemId] : null;
      if (weaponItem) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.6, 0.05),
          new THREE.MeshPhongMaterial({ color: new THREE.Color(weaponItem.color), shininess: 180 })
        );
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

    this.updatePlayer(dt);
    this.updatePortal(now);
    this.checkProximity();
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
  };

  private updatePlayer(dt: number) {
    const { dx, dz } = this.joystick;
    const len = Math.sqrt(dx * dx + dz * dz);
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
      // Leg bob animation — legs are at indices 8 and 9 (after torso, chest, pauldrons, head, ears/glow, arms)
      const t = performance.now() * 0.005;
      const children = this.player.children;
      // Find leg meshes by checking positions near ground
      for (let i = children.length - 4; i < children.length - 2; i++) {
        if (children[i]) children[i].rotation.x = Math.sin(t * 4 + (i % 2) * Math.PI) * 0.4;
      }
      this.callbacks.onPositionUpdate({ x: this.player.position.x, z: this.player.position.z });
    }
  }

  private updatePortal(now: number) {
    if (!this.portalMesh) return;
    this.portalMesh.rotation.y = now * 0.001;
    const scale = 1 + Math.sin(now * 0.002) * 0.05;
    this.portalMesh.scale.setScalar(scale);
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
  }

  dispose() {
    this.stop();
    this.renderer.dispose();
  }
}
