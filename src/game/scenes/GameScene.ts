import Phaser from "phaser";
import { TN } from "../theme";
import { AchievementTracker, type AchievementDef } from "../systems/Achievements";

const PLAYER_SPEED = 280;
const BULLET_SPEED = 420;
const FIRE_COOLDOWN_MS = 220;

type BugType = "bug" | "bug-yellow" | "bug-magenta";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private bullets!: Phaser.Physics.Arcade.Group;
  private bugs!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  private score = 0;
  private lives = 3;
  private wave = 1;
  private bugsRemaining = 0;
  private lastFired = 0;
  private rapidUntil = 0;
  private spawnTimer?: Phaser.Time.TimerEvent;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;

  private touchLeft = false;
  private touchRight = false;
  private touchFire = false;

  private achievements = new AchievementTracker();
  private bugsKilled = 0;

  constructor() {
    super("Game");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(TN.bg);
    this.drawGrid();

    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.bugsKilled = 0;
    this.rapidUntil = 0;

    this.player = this.physics.add.sprite(width / 2, height - 56, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 30,
      runChildUpdate: true,
    });

    this.bugs = this.physics.add.group();
    this.powerups = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.scoreText = this.add
      .text(16, 12, "SCORE 0", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#c0caf5",
      })
      .setDepth(20)
      .setScrollFactor(0);

    this.livesText = this.add
      .text(16, 32, "LIVES 3", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#f7768e",
      })
      .setDepth(20)
      .setScrollFactor(0);

    this.waveText = this.add
      .text(width - 16, 12, "WAVE 1", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#7dcfff",
      })
      .setOrigin(1, 0)
      .setDepth(20)
      .setScrollFactor(0);

    this.toastText = this.add
      .text(width / 2, 64, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#9ece6a",
        backgroundColor: "#24283b",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.physics.add.overlap(this.bullets, this.bugs, this.hitBug, undefined, this);
    this.physics.add.overlap(this.player, this.bugs, this.playerHit, undefined, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, undefined, this);

    this.createTouchControls();
    this.startWave();
  }

  update(time: number) {
    if (!this.player.active) return;

    let vx = 0;
    if (this.cursors.left?.isDown || this.keyA.isDown || this.touchLeft) vx -= PLAYER_SPEED;
    if (this.cursors.right?.isDown || this.keyD.isDown || this.touchRight) vx += PLAYER_SPEED;
    this.player.setVelocityX(vx);

    const wantsFire =
      this.keySpace.isDown || this.cursors.up?.isDown || this.touchFire;
    if (wantsFire) this.tryFire(time);

    this.bugs.getChildren().forEach((obj) => {
      const bug = obj as Phaser.Physics.Arcade.Image;
      if (bug.y > this.scale.height + 20) {
        bug.destroy();
        this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
        this.damagePlayer();
        this.checkWaveClear();
      }
    });

    this.bullets.getChildren().forEach((obj) => {
      const b = obj as Phaser.Physics.Arcade.Image;
      if (b.active && b.y < -20) b.destroy();
    });
  }

  private tryFire(time: number) {
    const cooldown = time < this.rapidUntil ? FIRE_COOLDOWN_MS * 0.45 : FIRE_COOLDOWN_MS;
    if (time < this.lastFired + cooldown) return;
    this.lastFired = time;

    const bullet = this.bullets.get(
      this.player.x,
      this.player.y - 20,
      "bullet",
    ) as Phaser.Physics.Arcade.Image | null;
    if (!bullet) return;
    bullet.setActive(true).setVisible(true);
    bullet.setVelocityY(-BULLET_SPEED);
    bullet.setVelocityX(0);
  }

  private startWave() {
    this.waveText.setText(`WAVE ${this.wave}`);
    const count = 6 + this.wave * 2;
    this.bugsRemaining = count;

    let spawned = 0;
    this.spawnTimer?.remove(false);
    this.spawnTimer = this.time.addEvent({
      delay: Math.max(280, 700 - this.wave * 40),
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

  private spawnBug() {
    const types: BugType[] = ["bug", "bug-yellow", "bug-magenta"];
    const key = types[Phaser.Math.Between(0, types.length - 1)];
    const x = Phaser.Math.Between(28, this.scale.width - 28);
    const bug = this.bugs.create(x, -20, key) as Phaser.Physics.Arcade.Image;
    const speed = 60 + this.wave * 18 + Phaser.Math.Between(0, 30);
    bug.setVelocityY(speed);
    bug.setData("hp", key === "bug-magenta" ? 2 : 1);
    bug.setData("points", key === "bug-yellow" ? 15 : key === "bug-magenta" ? 25 : 10);
  }

  private hitBug: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, bugObj) => {
    const bullet = bulletObj as Phaser.Physics.Arcade.Image;
    const bug = bugObj as Phaser.Physics.Arcade.Image;
    bullet.destroy();

    const hp = (bug.getData("hp") as number) - 1;
    if (hp > 0) {
      bug.setData("hp", hp);
      bug.setTint(0xffffff);
      this.time.delayedCall(80, () => bug.clearTint());
      return;
    }

    const points = bug.getData("points") as number;
    bug.destroy();
    this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
    this.score += points;
    this.bugsKilled += 1;
    this.scoreText.setText(`SCORE ${this.score}`);

    if (this.bugsKilled === 1) {
      this.showAchievement(this.achievements.tryUnlock("first_bug"));
    }
    if (this.score >= 100) {
      this.showAchievement(this.achievements.tryUnlock("score_100"));
    }

    if (Phaser.Math.FloatBetween(0, 1) < 0.12) {
      this.spawnPowerup(bug.x, bug.y);
    }

    this.checkWaveClear();
  };

  private playerHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, bugObj) => {
    const bug = bugObj as Phaser.Physics.Arcade.Image;
    bug.destroy();
    this.bugsRemaining = Math.max(0, this.bugsRemaining - 1);
    this.damagePlayer();
    this.checkWaveClear();
  };

  private damagePlayer() {
    this.lives -= 1;
    this.livesText.setText(`LIVES ${Math.max(0, this.lives)}`);
    this.cameras.main.flash(120, 247, 118, 142, false);
    this.player.setTint(TN.red);
    this.time.delayedCall(150, () => this.player.clearTint());

    if (this.lives <= 0) {
      this.spawnTimer?.remove(false);
      this.scene.start("GameOver", { score: this.score, wave: this.wave });
    }
  }

  private checkWaveClear() {
    if (this.bugsRemaining > 0) return;
    if (this.bugs.countActive(true) > 0) return;
    this.wave += 1;
    this.time.delayedCall(900, () => this.startWave());
  }

  private spawnPowerup(x: number, y: number) {
    const p = this.powerups.create(x, y, "powerup") as Phaser.Physics.Arcade.Image;
    p.setVelocityY(90);
  }

  private collectPowerup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_player, orbObj) => {
    const orb = orbObj as Phaser.Physics.Arcade.Image;
    orb.destroy();
    this.rapidUntil = this.time.now + 5000;
    this.showAchievement(this.achievements.tryUnlock("hotfix_used"));
    this.flashToast("HOTFIX: rapid fire 5s");
  };

  private showAchievement(def: AchievementDef | null) {
    if (!def) return;
    this.flashToast(`ACHIEVEMENT UNLOCKED — ${def.title}`);
  }

  private flashToast(msg: string) {
    this.toastText.setText(msg);
    this.toastText.setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 2200,
      duration: 400,
    });
  }

  private createTouchControls() {
    const { width, height } = this.scale;
    const zoneH = 90;
    const y = height - zoneH / 2;

    const mkZone = (x: number, w: number, label: string, on: () => void, off: () => void) => {
      const zone = this.add
        .rectangle(x, y, w, zoneH, TN.panel, 0.35)
        .setStrokeStyle(1, TN.border, 0.6)
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(15);
      this.add
        .text(x, y, label, {
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#7982a9",
        })
        .setOrigin(0.5)
        .setDepth(16)
        .setScrollFactor(0);
      zone.on("pointerdown", on);
      zone.on("pointerup", off);
      zone.on("pointerout", off);
    };

    const third = width / 3;
    mkZone(third / 2, third - 8, "◀", () => (this.touchLeft = true), () => (this.touchLeft = false));
    mkZone(width / 2, third - 8, "FIRE", () => (this.touchFire = true), () => (this.touchFire = false));
    mkZone(width - third / 2, third - 8, "▶", () => (this.touchRight = true), () => (this.touchRight = false));
  }

  private drawGrid() {
    const g = this.add.graphics();
    g.lineStyle(1, TN.blue, 0.06);
    for (let x = 0; x < this.scale.width; x += 40) {
      g.lineBetween(x, 0, x, this.scale.height);
    }
    for (let y = 0; y < this.scale.height; y += 40) {
      g.lineBetween(0, y, this.scale.width, y);
    }
  }
}
