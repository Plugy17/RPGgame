import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';
import type { Race } from '../data/classes';
import { RACES } from '../data/classes';

export class MenuScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private heroGroup: THREE.Group;
  private particles: THREE.Points;
  private pedestal: THREE.Group;
  private animId = 0;
  private mounted = false;
  private pointerX = 0;
  private pointerY = 0;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private glowMaterials: THREE.MeshPhongMaterial[] = [];
  private clock = new THREE.Clock();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 2.2, 5);

    this.scene = new THREE.Scene();

    // Ambient + dramatic lighting
    const ambient = new THREE.AmbientLight(0x223344, 0.8);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfbbf24, 2.0);
    keyLight.position.set(3, 8, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4a9eff, 1.5);
    rimLight.position.set(-5, 3, -4);
    this.scene.add(rimLight);

    const spotLight = new THREE.SpotLight(0xfbbf24, 4, 15, Math.PI / 5, 0.3);
    spotLight.position.set(0, 10, 4);
    spotLight.target.position.set(0, 0, 0);
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);

    // Post-processing: Bloom
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.8, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.pedestal = this.buildPedestal();
    this.scene.add(this.pedestal);

    this.heroGroup = this.buildHero('human');
    this.heroGroup.position.y = 1.2;
    this.scene.add(this.heroGroup);

    this.particles = this.buildParticles();
    this.scene.add(this.particles);

    this.addPointerListeners(canvas);
  }

  private buildPedestal(): THREE.Group {
    const g = new THREE.Group();

    // Main octagonal platform
    const baseGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.35, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a40,
      metalness: 0.3,
      roughness: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0;
    g.add(base);

    // Raised center pedestal
    const topGeo = new THREE.CylinderGeometry(1.0, 1.2, 0.15, 8);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a55,
      metalness: 0.5,
      roughness: 0.5,
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.25;
    g.add(top);

    // Glowing rune circles
    for (let i = 0; i < 3; i++) {
      const runeGeo = new THREE.TorusGeometry(0.8 - i * 0.2, 0.025, 6, 48);
      const runeMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x4a9eff : i === 1 ? 0xfbbf24 : 0xc084fc,
        transparent: true,
        opacity: 0.7,
      });
      const rune = new THREE.Mesh(runeGeo, runeMat);
      rune.rotation.x = -Math.PI / 2;
      rune.position.y = 0.35;
      rune.userData.isGlow = true;
      g.add(rune);
    }

    // Magical energy pillars
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.5,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(
        Math.cos(angle) * 1.25,
        0.75,
        Math.sin(angle) * 1.25
      );
      pillar.userData.isGlow = true;
      g.add(pillar);
    }

    // Central glow light
    const glowLight = new THREE.PointLight(0x4a9eff, 2, 5);
    glowLight.position.y = 0.8;
    g.add(glowLight);

    return g;
  }

  private buildHero(race: Race): THREE.Group {
    const raceDef = RACES.find(r => r.id === race) ?? RACES[0];
    const sc = raceDef.bodyScale;
    const g = new THREE.Group();

    // Create glowing material for magical details
    const createGlowMaterial = (color: number, emissiveColor: number) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.8,
        metalness: 0.7,
        roughness: 0.3,
      });
      this.glowMaterials.push(mat);
      return mat;
    };

    // === DETAILED LOW-POLY BODY ===

    // Torso with segmented armor
    const torsoGeo = new THREE.CylinderGeometry(0.28 * sc.x, 0.22 * sc.x, 0.9 * sc.y, 8);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f,
      metalness: 0.4,
      roughness: 0.6,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.25;
    g.add(torso);

    // Chest plate with magical glow
    const chestGeo = new THREE.BoxGeometry(0.55 * sc.x, 0.4 * sc.y, 0.32 * sc.z);
    const chestMat = createGlowMaterial(0x2a4a7a, 0x4a9eff);
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, 0.4, 0.08);
    g.add(chest);

    // Glowing rune on chest
    const runeChestGeo = new THREE.RingGeometry(0.06, 0.12, 6);
    const runeChestMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const runeChest = new THREE.Mesh(runeChestGeo, runeChestMat);
    runeChest.position.set(0, 0.42, 0.25);
    runeChest.userData.isGlow = true;
    g.add(runeChest);

    // Belt with magical buckle
    const beltGeo = new THREE.TorusGeometry(0.25 * sc.x, 0.04, 6, 16);
    const beltMat = createGlowMaterial(0x8a6a2a, 0xfbbf24);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0;
    g.add(belt);

    // === HEAD AND HELMET ===

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 6);
    const neckMat = new THREE.MeshStandardMaterial({ color: raceDef.skinColor, roughness: 0.8 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.y = 0.78;
    g.add(neck);

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: raceDef.skinColor, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.98;
    g.add(head);

    // Eyes with magical glow
    for (const side of [-1, 1]) {
      const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
      const eyeMat = createGlowMaterial(0x4a9eff, 0x4a9eff);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.08, 1.0, 0.18);
      g.add(eye);
    }

    // Helmet
    const helmGeo = new THREE.SphereGeometry(0.26, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmMat = createGlowMaterial(0x8a6a2a, 0xfbbf24);
    const helm = new THREE.Mesh(helmGeo, helmMat);
    helm.position.y = 1.05;
    g.add(helm);

    // Helmet wings
    for (const side of [-1, 1]) {
      const wingGeo = new THREE.ConeGeometry(0.06, 0.35, 4);
      const wingMat = createGlowMaterial(0xfbbf24, 0xfbbf24);
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(side * 0.3, 1.22, 0);
      wing.rotation.z = side * -0.45;
      g.add(wing);
    }

    // Helmet crest glow
    const crestGeo = new THREE.BoxGeometry(0.02, 0.15, 0.25);
    const crestMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.8 });
    const crest = new THREE.Mesh(crestGeo, crestMat);
    crest.position.set(0, 1.28, 0);
    crest.userData.isGlow = true;
    g.add(crest);

    // === SHOULDERS / PAULDRONS ===

    for (const sx of [-0.35 * sc.x, 0.35 * sc.x]) {
      const pauldronSize = raceDef.isBulky ? 0.2 : 0.14;
      const pauldronGeo = new THREE.SphereGeometry(pauldronSize, 8, 8);
      const pauldronMat = createGlowMaterial(
        raceDef.isBulky ? 0x6a4a1a : 0xfbbf24,
        raceDef.isBulky ? 0xfbbf24 : 0xfbbf24
      );
      const pauldron = new THREE.Mesh(pauldronGeo, pauldronMat);
      pauldron.position.set(sx, 0.72, 0);
      g.add(pauldron);

      // Spikes on pauldrons
      for (let i = 0; i < 3; i++) {
        const spikeGeo = new THREE.ConeGeometry(0.02, 0.1, 4);
        const spikeMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 });
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.set(sx, 0.82 + i * 0.02, 0.08 + i * 0.03);
        spike.rotation.x = -0.3;
        spike.userData.isGlow = true;
        g.add(spike);
      }
    }

    // === ARMS ===

    for (const ax of [-0.32 * sc.x, 0.32 * sc.x]) {
      // Upper arm
      const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.3, 6);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.set(ax, 0.55, 0);
      g.add(arm);

      // Bracers with glow
      const bracerGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 6);
      const bracerMat = createGlowMaterial(0x6a5a3a, 0xfbbf24);
      const bracer = new THREE.Mesh(bracerGeo, bracerMat);
      bracer.position.set(ax, 0.38, 0);
      g.add(bracer);

      // Gauntlets
      const gauntGeo = new THREE.BoxGeometry(0.1, 0.08, 0.12);
      const gauntMat = createGlowMaterial(0x8a7a5a, 0xfbbf24);
      const gaunt = new THREE.Mesh(gauntGeo, gauntMat);
      gaunt.position.set(ax, 0.28, 0);
      g.add(gaunt);
    }

    // === LEGS ===

    for (const lx of [-0.12 * sc.x, 0.12 * sc.x]) {
      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.35, 6);
      const thighMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const thigh = new THREE.Mesh(thighGeo, thighMat);
      thigh.position.set(lx, -0.2, 0);
      g.add(thigh);

      // Knee with glow
      const kneeGeo = new THREE.SphereGeometry(0.07, 6, 6);
      const kneeMat = createGlowMaterial(0x6a5a3a, 0xfbbf24);
      const knee = new THREE.Mesh(kneeGeo, kneeMat);
      knee.position.set(lx, -0.35, 0.02);
      g.add(knee);

      // Shin
      const shinGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.35, 6);
      const shinMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.3, roughness: 0.6 });
      const shin = new THREE.Mesh(shinGeo, shinMat);
      shin.position.set(lx, -0.55, 0);
      g.add(shin);

      // Boots with glow
      const bootGeo = new THREE.BoxGeometry(0.14 * sc.x, 0.12, 0.22);
      const bootMat = createGlowMaterial(0x4a3a2a, 0xfbbf24);
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(lx, -0.78, 0.04);
      g.add(boot);
    }

    // === WEAPON: MAGICAL SWORD ===

    const swordGroup = new THREE.Group();

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.05, 0.95, 0.03);
    const bladeMat = createGlowMaterial(0xe8e8f0, 0x4a9eff);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.47;
    swordGroup.add(blade);

    // Blade edge glow
    const edgeGeo = new THREE.BoxGeometry(0.01, 0.9, 0.01);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.9 });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(0.03, 0.47, 0);
    edge.userData.isGlow = true;
    swordGroup.add(edge);

    // Guard
    const guardGeo = new THREE.BoxGeometry(0.28, 0.05, 0.05);
    const guardMat = createGlowMaterial(0xfbbf24, 0xfbbf24);
    const guard = new THREE.Mesh(guardGeo, guardMat);
    swordGroup.add(guard);

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.1;
    swordGroup.add(handle);

    // Pommel glow
    const pommelGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const pommelMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.9 });
    const pommel = new THREE.Mesh(pommelGeo, pommelMat);
    pommel.position.y = -0.2;
    pommel.userData.isGlow = true;
    swordGroup.add(pommel);

    swordGroup.position.set(0.45 * sc.x, 0.3, 0);
    swordGroup.rotation.z = -0.25;
    g.add(swordGroup);

    // === CAPE ===

    const capeGeo = new THREE.PlaneGeometry(0.55, 0.9, 8, 8);
    const capeMat = new THREE.MeshStandardMaterial({
      color: race === 'orc' ? 0x5a2a0a : race === 'undead' ? 0x2a2a3a : 0xcc2233,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 0.3, -0.22);
    cape.rotation.x = 0.1;
    g.add(cape);

    // === SHIELD ON BACK ===

    const shieldGeo = new THREE.CircleGeometry(0.3, 12);
    const shieldMat = createGlowMaterial(0x1e4aaf, 0x4a9eff);
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 0.35, -0.26);
    shield.rotation.y = Math.PI;
    g.add(shield);

    // Shield emblem
    const emblemGeo = new THREE.RingGeometry(0.08, 0.15, 6);
    const emblemMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.set(0, 0.36, -0.27);
    emblem.rotation.y = Math.PI;
    emblem.userData.isGlow = true;
    g.add(emblem);

    // === RACE-SPECIFIC FEATURES ===

    if (raceDef.hasEars) {
      for (const side of [-1, 1]) {
        const earGeo = new THREE.ConeGeometry(0.03, 0.2, 3);
        const earMat = new THREE.MeshStandardMaterial({ color: raceDef.skinColor });
        const ear = new THREE.Mesh(earGeo, earMat);
        ear.position.set(side * 0.24, 1.08, 0);
        ear.rotation.z = side * -0.5;
        g.add(ear);
      }
    }

    if (race === 'undead') {
      const undeadGlow = new THREE.Mesh(
        headGeo.clone(),
        new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.3 })
      );
      undeadGlow.position.y = 0.98;
      undeadGlow.scale.setScalar(1.05);
      undeadGlow.userData.isGlow = true;
      g.add(undeadGlow);
    }

    return g;
  }

  updateRace(race: Race) {
    this.scene.remove(this.heroGroup);
    this.heroGroup = this.buildHero(race);
    this.heroGroup.position.y = 1.2;
    this.scene.add(this.heroGroup);
  }

  private buildParticles(): THREE.Points {
    const count = 200;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Mix of gold and blue particles
      const isGold = Math.random() > 0.5;
      colors[i * 3]     = isGold ? 0.98 : 0.29;
      colors[i * 3 + 1] = isGold ? 0.75 : 0.62;
      colors[i * 3 + 2] = isGold ? 0.14 : 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
    });

    return new THREE.Points(geo, mat);
  }

  private addPointerListeners(canvas: HTMLCanvasElement) {
    const handler = (e: MouseEvent | TouchEvent) => {
      const x = e instanceof MouseEvent ? e.clientX : e.touches[0]?.clientX ?? 0;
      const y = e instanceof MouseEvent ? e.clientY : e.touches[0]?.clientY ?? 0;
      this.pointerX = (x / window.innerWidth - 0.5) * 2;
      this.pointerY = (y / window.innerHeight - 0.5) * 2;
    };
    canvas.addEventListener('mousemove', handler as EventListener);
    canvas.addEventListener('touchmove', handler as EventListener, { passive: true });
  }

  start() { this.mounted = true; this.loop(); }
  stop() { this.mounted = false; cancelAnimationFrame(this.animId); }

  private loop = () => {
    if (!this.mounted) return;
    this.animId = requestAnimationFrame(this.loop);

    const t = this.clock.getElapsedTime();

    // Smooth camera follow
    this.camera.position.x += (this.pointerX * 0.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (2.2 - this.pointerY * 0.3 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0.8, 0);

    // Hero idle breathing
    const breathe = Math.sin(t * 1.8) * 0.02;
    this.heroGroup.position.y = 1.2 + breathe;
    this.heroGroup.rotation.y = Math.sin(t * 0.4) * 0.2 + this.pointerX * 0.15;

    // Scale for subtle breathing effect
    this.heroGroup.scale.y = 1 + breathe * 0.2;

    // Pedestal rune rotation
    const runes = this.pedestal.children.filter(c => c.userData.isGlow);
    runes.forEach((rune, i) => {
      if (rune instanceof THREE.Mesh && rune.geometry instanceof THREE.TorusGeometry) {
        rune.rotation.z = t * (0.3 + i * 0.1) * (i % 2 === 0 ? 1 : -1);
      }
    });

    // Animate glow materials
    this.glowMaterials.forEach(mat => {
      mat.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.2;
    });

    // Particle rotation
    this.particles.rotation.y = t * 0.03;
    this.particles.rotation.x = Math.sin(t * 0.1) * 0.05;

    this.composer.render();
  };

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  dispose() {
    this.stop();
    this.glowMaterials.forEach(mat => mat.dispose());
    this.renderer.dispose();
  }
}
