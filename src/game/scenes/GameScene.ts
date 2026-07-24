import Phaser from "phaser";
import { BALANCE, POWERUP_KEYS, POWERUP_WEIGHTS, type PowerUpKind } from "../balance";
import { TN } from "../theme";
import { AchievementTracker, type AchievementDef } from "../systems/Achievements";
import { audio } from "../systems/Audio";
import { particleCount, shakeDuration, shakeIntensity } from "../systems/Motion";
import { isMuted, toggleMuted } from "../systems/Settings";
import { buildShots, weaponLabel, type WeaponMode } from "../systems/Weapons";
import { hex, makePanel, paintAtmosphere } from "../ui/atmosphere";
import { fadeIn, fadeToScene } from "../ui/transitions";

type BugType = "bug" | "bug-yellow" | "bug-magenta";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private shieldRing!: Phaser.GameObjects.Image;
  private bullets!: Phaser.Physics.Arcade.Group;
  private bugs!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyP!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keyM!: Phaser.Input.Keyboard.Key;

  private score = 0;
  private lives = BALANCE.startLives;
  private wave = 1;
  private bugsRemaining = 0;
  private lastFired = 0;
  private rapidUntil = 0;
  private shieldUntil = 0;
  private weaponUntil = 0;
  private weaponMode: WeaponMode = "single";
  private invincibleUntil = 0;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private paused = false;
  private muted = isMuted();
  private bossActive = false;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private waveBanner!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private muteBtn!: Phaser.GameObjects.Text;

  private touchDir = 0;
  private touchFire = false;
  private movePadCenter = { x: 0, y: 0 };

  private achievements = new AchievementTracker();
  private bugsKilled = 0;

  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    paintAtmosphere(this, { stars: 40, grid: 40 });
    fadeIn(this);
    audio.unlock();

    this.score = 0;
    this.lives = BALANCE.startLives;
    this.wave = 1;
    this.bugsKilled = 0;
    this.rapidUntil = 0;
    this.shieldUntil = 0;
    this.weaponUntil = 0;
    this.weaponMode = "single";
    this.invincibleUntil = 0;
    this.paused = false;
    this.bossActive = false;
    this.muted = isMuted();
    this.touchDir = 0;
    this.touchFire = false;
    this.physics.resume();
    this.time.paused = false;

    this.player = this.physics.add.sprite(width / 2, height - 110, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    this.shieldRing = this.add
      .image(this.player.x, this.player.y, "shield-ring")
      .setDepth(11)
      .setAlpha(0);

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 96,
      runChildUpdate: true,
    });

    this.bugs = this.physics.add.group();
    this.powerups = this.physics.add.group();

    this.sparks = this.add.particles(0, 0, "spark", {
      lifespan: 320,
      speed: { min: 40, max: 160 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.95, end: 0 },
      quantity: 0,
      emitting: false,
      blendMode: "ADD",
    });
    this.sparks.setDepth(12);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyP = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyM = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    this.buildHud();
    this.buildPauseOverlay();
    this.createTouchControls();

    this.physics.add.overlap(this.bullets, this.bugs, this.hitBug, undefined, this);
    this.physics.add.overlap(this.player, this.bugs, this.playerHit, undefined, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, undefined, this);

    this.startWave();
  }

  update(time: number) {
    if (Phaser.Input.Keyboard.JustDown(this.keyP) || Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.togglePause();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyM)) {
      this.applyMute(toggleMuted());
    }

    if (this.paused || !this.player.active) return;

    if (time >= this.weaponUntil && this.weaponMode !== "single") {
      this.weaponMode = "single";
    }

    let vx = 0;
    if (this.cursors.left?.isDown || this.keyA.isDown) vx -= BALANCE.playerSpeed;
    if (this.cursors.right?.isDown || this.keyD.isDown) vx += BALANCE.playerSpeed;
    if (this.touchDir !== 0) vx = this.touchDir * BALANCE.playerSpeed;
    this.player.setVelocityX(vx);

    this.shieldRing.setPosition(this.player.x, this.player.y);
    const shielded = time < this.shieldUntil;
    this.shieldRing.setAlpha(shielded ? 0.75 + 0.25 * Math.sin(time * 0.015) : 0);

    const wantsFire =
      this.keySpace.isDown || this.cursors.up?.isDown || this.touchFire;
    if (wantsFire) this.tryFire(time);

    if (time < this.invincibleUntil && !shielded) {
      this.player.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(time * 0.02)));
    } else if (this.player.alpha !== 1) {
      this.player.setAlpha(1);
      this.player.clearTint();
    }

    this.refreshStatus(time);

    this.bugs.getChildren().forEach((obj) => {
      const bug = obj as Phaser.Physics.Arcade.Image;
      if (!bug.active) return;

      const baseY = bug.getData("baseSpeed") as number;
      const amp = bug.getData("zigAmp") as number;
      const freq = bug.getData("zigFreq") as number;
      const phase = bug.getData("zigPhase") as number;
      bug.setVelocityX(Math.sin(time * freq + phase) * amp);
      bug.setVelocityY(baseY);

      const pad = bug.getData("boss") ? 32 : 16;
      if (bug.x < pad) bug.x = pad;
      if (bug.x > this.scale.width - pad) bug.x = this.scale.width - pad;

      if (bug.y > this.scale.height + 30) {
        const isBoss = !!bug.getData("boss");
        bug.destroy();
        this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
        if (isBoss) this.bossActive = false;
        this.damagePlayer();
        this.checkWaveClear();
      }
    });

    this.bullets.getChildren().forEach((obj) => {
      const b = obj as Phaser.Physics.Arcade.Image;
      if (!b.active) return;
      if (b.y < -30 || b.y > this.scale.height + 30 || b.x < -30 || b.x > this.scale.width + 30) {
        b.destroy();
      }
    });
  }

  private buildHud() {
    const { width } = this.scale;
    makePanel(this, width / 2, 28, width - 20, 44, 18);

    this.scoreText = this.add
      .text(20, 20, "SCORE  0", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "13px",
        color: hex(TN.text),
      })
      .setDepth(20)
      .setScrollFactor(0);

    this.livesText = this.add
      .text(20, 36, this.livesLabel(), {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        color: hex(TN.red),
      })
      .setDepth(20)
      .setScrollFactor(0);

    this.waveText = this.add
      .text(width / 2, 20, "WAVE 1", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "14px",
        color: hex(TN.cyan),
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(20)
      .setScrollFactor(0);

    this.statusText = this.add
      .text(width / 2, 36, "", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "10px",
        color: hex(TN.green),
      })
      .setOrigin(0.5, 0)
      .setDepth(20)
      .setScrollFactor(0);

    const pauseBtn = this.add
      .text(width - 56, 28, "II", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "14px",
        color: hex(TN.muted),
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    pauseBtn.on("pointerup", () => this.togglePause());

    this.muteBtn = this.add
      .text(width - 28, 28, this.muted ? "OFF" : "SND", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "11px",
        color: hex(TN.muted),
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    this.muteBtn.on("pointerup", () => this.applyMute(toggleMuted()));

    this.toastText = this.add
      .text(width / 2, 72, "", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        color: hex(TN.green),
        backgroundColor: "#24283bcc",
        padding: { x: 12, y: 7 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0)
      .setScrollFactor(0);

    this.waveBanner = this.add
      .text(width / 2, this.scale.height * 0.38, "", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "26px",
        color: hex(TN.cyan),
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(25)
      .setAlpha(0)
      .setScrollFactor(0);
  }

  private buildPauseOverlay() {
    const { width, height } = this.scale;
    const dim = this.add.rectangle(width / 2, height / 2, width, height, TN.bg, 0.72);
    const title = this.add
      .text(width / 2, height * 0.4, "PAUSED", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "34px",
        color: hex(TN.cyan),
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const hint = this.add
      .text(width / 2, height * 0.4 + 44, "P / ESC  ·  tap to resume", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "12px",
        color: hex(TN.muted),
      })
      .setOrigin(0.5);

    this.pauseOverlay = this.add.container(0, 0, [dim, title, hint]).setDepth(50).setVisible(false);
    dim.setInteractive();
    dim.on("pointerup", () => this.togglePause());
  }

  private togglePause() {
    this.paused = !this.paused;
    this.pauseOverlay.setVisible(this.paused);
    if (this.paused) {
      this.physics.pause();
      this.time.paused = true;
      this.player.setVelocityX(0);
    } else {
      this.physics.resume();
      this.time.paused = false;
    }
  }

  private applyMute(muted: boolean) {
    this.muted = muted;
    this.muteBtn.setText(muted ? "OFF" : "SND");
    if (!muted) audio.unlock();
    this.flashToast(muted ? "MUTE ON" : "MUTE OFF");
  }

  private livesLabel() {
    const on = "●".repeat(Math.max(0, this.lives));
    const off = "○".repeat(Math.max(0, BALANCE.maxLives - Math.max(0, this.lives)));
    return `LIVES  ${on}${off}`;
  }

  private refreshStatus(time: number) {
    const bits: string[] = [];
    if (time < this.rapidUntil) bits.push("HOTFIX");
    if (time < this.shieldUntil) bits.push("STASH");
    const w = weaponLabel(this.activeWeapon(time));
    if (w) bits.push(w);
    this.statusText.setText(bits.join("  ·  "));
  }

  private activeWeapon(time: number): WeaponMode {
    return time < this.weaponUntil ? this.weaponMode : "single";
  }

  private tryFire(time: number) {
    const cooldown =
      time < this.rapidUntil
        ? BALANCE.fireCooldownMs * BALANCE.rapidFireMultiplier
        : BALANCE.fireCooldownMs;
    if (time < this.lastFired + cooldown) return;
    this.lastFired = time;

    const mode = this.activeWeapon(time);
    const shots = buildShots(mode);
    let spawned = 0;

    for (const spec of shots) {
      const bullet = this.bullets.get(
        this.player.x + spec.offsetX,
        this.player.y + spec.offsetY,
        spec.texture,
      ) as Phaser.Physics.Arcade.Image | null;
      if (!bullet) continue;
      bullet.setActive(true).setVisible(true);
      bullet.setVelocity(spec.vx, spec.vy);
      bullet.setData("pierce", spec.pierce);
      bullet.setData("hitBugs", new Set<Phaser.GameObjects.GameObject>());
      spawned += 1;
    }

    if (spawned > 0) audio.shoot();
  }

  private isBossWave() {
    return this.wave > 0 && this.wave % BALANCE.bossEveryWaves === 0;
  }

  private startWave() {
    this.waveText.setText(`WAVE ${this.wave}`);
    this.bossActive = false;

    if (this.isBossWave()) {
      this.showWaveBanner("MERGE CONFLICT");
      this.waveBanner.setColor(hex(TN.red));
      this.bugsRemaining = 1;
      this.time.delayedCall(500, () => this.spawnBoss());
      return;
    }

    this.waveBanner.setColor(hex(TN.cyan));
    this.showWaveBanner(`WAVE ${this.wave}`);

    const count = BALANCE.waveBaseCount + this.wave * BALANCE.waveCountPerWave;
    this.bugsRemaining = count;

    let spawned = 0;
    this.spawnTimer?.remove(false);
    this.spawnTimer = this.time.addEvent({
      delay: Math.max(
        BALANCE.waveSpawnMinMs,
        BALANCE.waveSpawnBaseMs - this.wave * BALANCE.waveSpawnPerWaveMs,
      ),
      repeat: count - 1,
      callback: () => {
        this.spawnBug();
        spawned += 1;
        if (spawned === count && this.wave >= 3) {
          this.showAchievement(this.achievements.tryUnlock("wave_3"));
        }
      },
    });
  }

  private showWaveBanner(msg: string) {
    this.waveBanner.setText(msg).setAlpha(1).setScale(0.85);
    this.tweens.killTweensOf(this.waveBanner);
    this.tweens.add({
      targets: this.waveBanner,
      scale: 1.05,
      duration: 220,
      yoyo: true,
      hold: 500,
      onComplete: () => {
        this.tweens.add({
          targets: this.waveBanner,
          alpha: 0,
          duration: 280,
        });
      },
    });
  }

  private spawnBug() {
    const types: BugType[] = ["bug", "bug-yellow", "bug-magenta"];
    const key = types[Phaser.Math.Between(0, types.length - 1)];
    const x = Phaser.Math.Between(28, this.scale.width - 28);
    const bug = this.bugs.create(x, -24, key) as Phaser.Physics.Arcade.Image;
    const speed =
      BALANCE.bugBaseSpeed +
      this.wave * BALANCE.bugSpeedPerWave +
      Phaser.Math.Between(0, BALANCE.bugSpeedJitter);

    bug.setData("hp", key === "bug-magenta" ? 2 : 1);
    bug.setData("points", key === "bug-yellow" ? 15 : key === "bug-magenta" ? 25 : 10);
    bug.setData("baseSpeed", speed);
    bug.setData("zigAmp", BALANCE.bugZigzagAmp * Phaser.Math.FloatBetween(0.55, 1.15));
    bug.setData("zigFreq", BALANCE.bugZigzagFreq * Phaser.Math.FloatBetween(0.8, 1.3));
    bug.setData("zigPhase", Phaser.Math.FloatBetween(0, Math.PI * 2));
    bug.setData("boss", false);
    bug.setVelocityY(speed);
  }

  private spawnBoss() {
    const tier = Math.floor(this.wave / BALANCE.bossEveryWaves);
    const boss = this.bugs.create(
      this.scale.width / 2,
      -40,
      "boss-merge",
    ) as Phaser.Physics.Arcade.Image;

    boss.setData("hp", BALANCE.bossHpBase + tier * BALANCE.bossHpPerTier);
    boss.setData("points", BALANCE.bossPoints + tier * 40);
    boss.setData("baseSpeed", BALANCE.bossSpeed);
    boss.setData("zigAmp", BALANCE.bossZigzagAmp);
    boss.setData("zigFreq", BALANCE.bugZigzagFreq * 0.7);
    boss.setData("zigPhase", 0);
    boss.setData("boss", true);
    boss.setVelocityY(BALANCE.bossSpeed);
    this.bossActive = true;
    this.camShake(BALANCE.shakeBoss.duration, BALANCE.shakeBoss.intensity);
  }

  private hitBug: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, bugObj) => {
    const bullet = bulletObj as Phaser.Physics.Arcade.Image;
    const bug = bugObj as Phaser.Physics.Arcade.Image;

    const hitBugs = bullet.getData("hitBugs") as Set<Phaser.GameObjects.GameObject> | undefined;
    if (hitBugs?.has(bug)) return;
    hitBugs?.add(bug);

    let pierce = (bullet.getData("pierce") as number) || 0;
    if (pierce > 0) {
      pierce -= 1;
      bullet.setData("pierce", pierce);
      if (pierce <= 0) bullet.destroy();
    } else {
      bullet.destroy();
    }

    const hp = (bug.getData("hp") as number) - 1;
    if (hp > 0) {
      bug.setData("hp", hp);
      bug.setTint(0xffffff);
      this.time.delayedCall(80, () => {
        if (bug.active) bug.clearTint();
      });
      audio.hit();
      return;
    }

    const points = bug.getData("points") as number;
    const isBoss = !!bug.getData("boss");
    const bx = bug.x;
    const by = bug.y;
    const tint = isBoss
      ? TN.yellow
      : bug.texture.key === "bug-yellow"
        ? TN.yellow
        : bug.texture.key === "bug-magenta"
          ? TN.magenta
          : TN.red;

    bug.destroy();
    this.burst(bx, by, tint);
    this.camShake(
      isBoss ? BALANCE.shakeBoss.duration : BALANCE.shakeKill.duration,
      isBoss ? BALANCE.shakeBoss.intensity : BALANCE.shakeKill.intensity,
    );
    audio.hit();

    this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
    this.score += points;
    this.bugsKilled += 1;
    this.scoreText.setText(`SCORE  ${this.score}`);

    if (isBoss) {
      this.bossActive = false;
      this.showAchievement(this.achievements.tryUnlock("merge_resolved"));
      this.flashToast("MERGE RESOLVED");
      this.spawnPowerup(bx, by, "pierce");
    }

    if (this.bugsKilled === 1) {
      this.showAchievement(this.achievements.tryUnlock("first_bug"));
    }
    if (this.score >= 100) {
      this.showAchievement(this.achievements.tryUnlock("score_100"));
    }

    if (!isBoss && Phaser.Math.FloatBetween(0, 1) < BALANCE.powerupChance) {
      this.spawnPowerup(bx, by);
    }

    this.checkWaveClear();
  };

  private playerHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, bugObj) => {
    if (this.time.now < this.invincibleUntil) return;

    const bug = bugObj as Phaser.Physics.Arcade.Image;
    const isBoss = !!bug.getData("boss");

    if (this.time.now < this.shieldUntil) {
      this.shieldUntil = 0;
      this.invincibleUntil = this.time.now + 600;
      this.burst(this.player.x, this.player.y, TN.cyan);
      this.flashToast("STASH BROKEN");
      audio.hurt();
      if (!isBoss) {
        bug.destroy();
        this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
        this.checkWaveClear();
      }
      return;
    }

    if (!isBoss) {
      bug.destroy();
      this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
    }
    this.damagePlayer();
    this.checkWaveClear();
  };

  private damagePlayer() {
    if (this.time.now < this.invincibleUntil) return;
    if (this.time.now < this.shieldUntil) {
      this.shieldUntil = 0;
      this.invincibleUntil = this.time.now + 600;
      this.burst(this.player.x, this.player.y, TN.cyan);
      this.flashToast("STASH BROKEN");
      audio.hurt();
      return;
    }

    this.lives -= 1;
    this.livesText.setText(this.livesLabel());
    this.invincibleUntil = this.time.now + BALANCE.invincibleMs;

    this.cameras.main.flash(140, 247, 118, 142, false);
    this.camShake(BALANCE.shakeHit.duration, BALANCE.shakeHit.intensity);
    this.player.setTint(TN.red);
    this.burst(this.player.x, this.player.y, TN.red);
    audio.hurt();

    if (this.lives <= 0) {
      this.spawnTimer?.remove(false);
      audio.gameOver();
      this.time.delayedCall(320, () => {
        fadeToScene(this, "GameOver", { score: this.score, wave: this.wave });
      });
    }
  }

  private checkWaveClear() {
    if (this.bugsRemaining > 0) return;
    if (this.bugs.countActive(true) > 0) return;
    if (this.bossActive) return;
    this.wave += 1;
    this.time.delayedCall(BALANCE.waveGapMs, () => this.startWave());
  }

  private pickPowerup(): PowerUpKind {
    const total = POWERUP_WEIGHTS.reduce((s, w) => s + w.weight, 0);
    let roll = Phaser.Math.FloatBetween(0, total);
    for (const entry of POWERUP_WEIGHTS) {
      roll -= entry.weight;
      if (roll <= 0) return entry.kind;
    }
    return "hotfix";
  }

  private spawnPowerup(x: number, y: number, kind?: PowerUpKind) {
    const type = kind ?? this.pickPowerup();
    const p = this.powerups.create(x, y, POWERUP_KEYS[type]) as Phaser.Physics.Arcade.Image;
    p.setData("kind", type);
    p.setVelocityY(BALANCE.powerupFallSpeed);
  }

  private collectPowerup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, orbObj) => {
    const orb = orbObj as Phaser.Physics.Arcade.Image;
    const kind = (orb.getData("kind") as PowerUpKind) || "hotfix";
    orb.destroy();
    audio.powerup();

    if (kind === "hotfix") {
      this.rapidUntil = this.time.now + BALANCE.rapidFireDurationMs;
      this.showAchievement(this.achievements.tryUnlock("hotfix_used"));
      this.flashToast("HOTFIX  ·  rapid fire");
      this.burst(this.player.x, this.player.y - 10, TN.green);
      return;
    }

    if (kind === "stash") {
      this.shieldUntil = this.time.now + BALANCE.shieldDurationMs;
      this.showAchievement(this.achievements.tryUnlock("stash_used"));
      this.flashToast("GIT STASH  ·  shield");
      this.burst(this.player.x, this.player.y - 10, TN.cyan);
      return;
    }

    if (kind === "coffee") {
      if (this.lives < BALANCE.maxLives) {
        this.lives += 1;
        this.livesText.setText(this.livesLabel());
        this.flashToast("COFFEE  ·  +1 life");
      } else {
        this.score += 30;
        this.scoreText.setText(`SCORE  ${this.score}`);
        this.flashToast("COFFEE  ·  +30 pts (max lives)");
      }
      this.showAchievement(this.achievements.tryUnlock("coffee_used"));
      this.burst(this.player.x, this.player.y - 10, TN.yellow);
      return;
    }

    // Weapon power-ups
    if (kind === "twin" || kind === "spread" || kind === "pierce") {
      this.weaponMode = kind;
      this.weaponUntil = this.time.now + BALANCE.weaponDurationMs;
      this.showAchievement(this.achievements.tryUnlock("arsenal"));
      const labels: Record<"twin" | "spread" | "pierce", string> = {
        twin: "TWIN SHOT  ·  dual fire",
        spread: "SPREAD  ·  3-way fan",
        pierce: "PIERCE  ·  through bugs",
      };
      this.flashToast(labels[kind]);
      this.burst(
        this.player.x,
        this.player.y - 10,
        kind === "twin" ? TN.blue : kind === "spread" ? TN.magenta : 0xff9e64,
      );
    }
  };

  private camShake(duration: number, intensity: number) {
    this.cameras.main.shake(shakeDuration(duration), shakeIntensity(intensity));
  }

  private burst(x: number, y: number, tint: number) {
    this.sparks.setParticleTint(tint);
    this.sparks.emitParticleAt(x, y, particleCount(10));
  }

  private showAchievement(def: AchievementDef | null) {
    if (!def) return;
    audio.achievement();
    this.flashToast(`★  ${def.title}`);
  }

  private flashToast(msg: string) {
    this.toastText.setText(msg);
    this.toastText.setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 2000,
      duration: 350,
    });
  }

  private createTouchControls() {
    const { width, height } = this.scale;
    const padY = height - 56;
    const leftX = 56;
    const rightX = width - 56;
    this.movePadCenter = { x: leftX, y: padY };

    const movePad = this.add
      .image(leftX, padY, "touch-pad")
      .setAlpha(0.55)
      .setDepth(15)
      .setScrollFactor(0)
      .setInteractive({ draggable: false });

    const knob = this.add
      .circle(leftX, padY, 14, TN.cyan, 0.35)
      .setStrokeStyle(1, TN.cyan, 0.7)
      .setDepth(16)
      .setScrollFactor(0);

    const firePad = this.add
      .image(rightX, padY, "touch-pad")
      .setAlpha(0.55)
      .setDepth(15)
      .setScrollFactor(0)
      .setInteractive();

    this.add
      .text(rightX, padY, "FIRE", {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: "11px",
        color: hex(TN.green),
      })
      .setOrigin(0.5)
      .setDepth(16)
      .setScrollFactor(0)
      .setAlpha(0.85);

    const updateMove = (pointer: Phaser.Input.Pointer) => {
      const dx = Phaser.Math.Clamp(pointer.x - this.movePadCenter.x, -36, 36);
      knob.setPosition(this.movePadCenter.x + dx, this.movePadCenter.y);
      if (Math.abs(dx) < 8) this.touchDir = 0;
      else this.touchDir = Math.sign(dx);
    };

    const resetMove = () => {
      this.touchDir = 0;
      knob.setPosition(this.movePadCenter.x, this.movePadCenter.y);
    };

    movePad.on("pointerdown", (p: Phaser.Input.Pointer) => updateMove(p));
    movePad.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.isDown) updateMove(p);
    });
    movePad.on("pointerup", resetMove);
    movePad.on("pointerout", resetMove);

    const moveZone = this.add
      .zone(width * 0.22, height - 70, width * 0.44, 140)
      .setInteractive()
      .setDepth(14)
      .setScrollFactor(0);
    moveZone.on("pointerdown", (p: Phaser.Input.Pointer) => updateMove(p));
    moveZone.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.isDown) updateMove(p);
    });
    moveZone.on("pointerup", resetMove);
    moveZone.on("pointerout", resetMove);

    const setFire = (on: boolean) => {
      this.touchFire = on;
      firePad.setAlpha(on ? 0.85 : 0.55);
    };
    firePad.on("pointerdown", () => setFire(true));
    firePad.on("pointerup", () => setFire(false));
    firePad.on("pointerout", () => setFire(false));

    const fireZone = this.add
      .zone(width * 0.78, height - 70, width * 0.44, 140)
      .setInteractive()
      .setDepth(14)
      .setScrollFactor(0);
    fireZone.on("pointerdown", () => setFire(true));
    fireZone.on("pointerup", () => setFire(false));
    fireZone.on("pointerout", () => setFire(false));
  }
}
