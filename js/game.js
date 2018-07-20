Game = {}; 
var W;
var H;
var SCORE = 0;

W = 1250;
H = 570;

 
function rand(num) {
  return Math.floor(Math.random() * num)
};

Game.Load = function(game) {
};
Game.Load.prototype = {
  preload: function() {
   
    game.stage.backgroundColor = '#90d3e4';


    label = game.add.text(
      W / 5,
      H / 5,
      'loading...',
      {
        font: '30px Arial',
        fill: '#fff'
      }
    );
    label.anchor.setTo(0.5, 0.5);

    game.load.image('bg', 'images/azmi1.png');
    game.load.image('player', 'images/haqqi.png');
    game.load.image('fire', 'images/panah.png');
    game.load.image('bonus', 'images/hadiah.png');
    game.load.image('pixel', 'images/hati.png');
    game.load.image('bullet', 'images/musuh.png')
    game.load.image('enemy', 'images/Rida.png');
    game.load.audio('hit', 'sounds/aw.wav');
    game.load.audio('fire', 'sounds/klk.wav');
    game.load.audio('exp', 'sounds/dor.wav');
    game.load.audio('bonus', 'sounds/bonus.wav');
  },
  create: function() {
    game.state.start('Intro');
  }
};

Game.Intro = function(game) {};
Game.Intro.prototype = {
  create: function() {
    
    game.add.sprite(0, 0, 'bg');
    
    this.cursor = game.input.keyboard.createCursorKeys();
     this.add.image(1250, 550, 'azmi1');
  },
  update: function() {
    if (this.cursor.up.isDown) {
      game.state.start('Play');
    }
  }
};

var DEBUG_XPOS;
var DEBUG_YPOS;
var DEBUG_Y_STEP = 20;
var STARTED_DEBUG_XPOS = 8;
var STARTED_DEBUG_YPOS = 40;


function echoDebug(txt, val) {
  game.debug.text(txt + ': ' + val, DEBUG_XPOS, DEBUG_YPOS+=20);
}

var M_NUMBER = 80;

Game.Play = function(game) {};
Game.Play.prototype = {
  create: function() {
   
    this.fireTime = 0;
    this.bonusTime = 0;
    this.enemyTime = 0;
    this.bulletTime = 0;
    this.lives = 3;
    this.evolution = 1;
    this.playerY = H - 70;
    SCORE = 0;

    this.maxNEnemy = 30;
    this.maxNFire = 25;
    this.maxNBonus = 3;
    this.maxNBullet = 25;


    this.cursor = game.input.keyboard.createCursorKeys();

    this.enemies = game.add.group();
    this.enemies.createMultiple(this.maxNEnemy, 'enemy');
    this.enemies.setAll('outOfBoundsKill', true);

    this.fires = game.add.group();
    this.fires.createMultiple(this.maxNFire, 'fire');
    this.fires.setAll('outOfBoundsKill', true);

    this.bonuses = game.add.group();
    this.bonuses.createMultiple(this.maxNBonus, 'bonus');
    this.bonuses.setAll('outOfBoundsKill', true);

    this.bullets = game.add.group();
    this.bullets.createMultiple(this.maxNBullet, 'bullet');
    this.bullets.setAll('outOfBoundsKill', true);

    this.player = game.add.sprite(W / 2, this.playerY, 'player');
    game.physics.arcade.enableBody(this.player);
    this.player.body.collideWorldBounds = true;

    this.hitSound = game.add.audio('hit');
    this.fireSound = game.add.audio('fire');
    this.expSound = game.add.audio('exp');
    this.bonusSound = game.add.audio('bonus');

    this.emitter = game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;

    this.livesText = game.add.text(
      W - 25,
      10,
      this.lives,
      {
        font: '30px Arial',
        fill: '#fff'
      }
    );

    this.scoreText = game.add.text(
      10,
      10,
      "0",
      {
        font: '30px Arial',
        fill: '#fff'
      }
    );
  },
  render: function() {
    this.updateDebug();
  },
  updateDebug: function() {
    DEBUG_XPOS = STARTED_DEBUG_XPOS;
    DEBUG_YPOS = STARTED_DEBUG_YPOS;
    
  },
  summonEnemy: function() {
    var enemy = this.enemies.getFirstExists(false);

    if (enemy) {
      game.physics.arcade.enableBody(enemy);
      enemy.reset(rand(W / enemy.width - 1) * enemy.width + 3, -enemy.height);
      enemy.body.velocity.y = 300;

      this.enemyTime = game.time.now + 250;
    }
  },
  killEnemy: function() {
    this.enemies.forEachAlive(function(enemy) {
      if (enemy.y >= H + M_NUMBER) {
        enemy.kill();
      }
    });
  },
  summonBullet: function() {
    var bullet = this.bullets.getFirstExists(false);

    if (bullet) {
      game.physics.arcade.enableBody(bullet);
      bullet.reset(rand(W - bullet.width-1)*bullet.width +3, -bullet.height);
      bullet.body.velocity.y = 100;

      this.bulletTime = game.time.now + 250;
      }
  },
  killBullet: function() {
    this.bullets.forEachAlive(function(bullet) {
      if (bullet.y >= H + M_NUMBER) {
        bullet.kill();
      }
    });
  },
  summonBonus: function() {
    var bonus = this.bonuses.getFirstExists(false);

    if (bonus) {
      bonus.reset(rand(W - bonus.width) + bonus.width / 2, -bonus.height / 2);
      game.physics.arcade.enableBody(bonus);
      bonus.body.velocity.y = 150;
      bonus.anchor.setTo(0.5, 0.5);
      this.game.add.tween(bonus).to({ angle: 360 }, 3500, Phaser.Easing.Linear.None).start();

      this.bonusTime = game.time.now + 5000;
    }
  },
  killBonus: function() {
    this.bonuses.forEachAlive(function(bonus) {
      if (bonus.y >= H + M_NUMBER) {
        bonus.kill();
      }
    });
  },
  killFire: function() {
    this.fires.forEachAlive(function(fire) {
      if (fire.y <= -M_NUMBER) {
        fire.kill();
      }
    });
  },
  update: function() {
    this.player.body.velocity.x = 0;

    if (this.cursor.left.isDown) {
      this.player.body.velocity.x = -350;

    } else if (this.cursor.right.isDown) {
      this.player.body.velocity.x = 350;
    }

    if (this.cursor.up.isDown) {
      this.fire();
    }

    if (this.game.time.now > this.enemyTime) {
      this.summonEnemy();
    }

    if (this.game.time.now > this.bulletTime) {
      this.summonBullet();
    }

    if (this.game.time.now > this.bonusTime) {
      this.summonBonus(); 
    }

    this.killFire();
    this.killEnemy();
    this.killBullet();
    this.killBonus();

    game.physics.arcade.overlap(this.player, this.enemies, this.playerHit, null, this);
    game.physics.arcade.overlap(this.fires, this.enemies, this.enemyHit, null, this);
    game.physics.arcade.overlap(this.player, this.bonuses, this.takeBonus, null, this);
  },
  playerHit: function(player, enemy) {

    enemy.kill();

    this.hitSound.play('', 0, 0.2);

    this.lives -= 1;
    this.livesText.setText(this.lives);
    if (this.lives == 0) {
      this.clear();
      game.state.start('Over');
    }

    this.evolution = 1;

    game.add.tween(player)
      .to({ y: this.playerY + 20 }, 100, Phaser.Easing.Linear.None)
      .to({ y: this.playerY }, 100, Phaser.Easing.Linear.None).start();
  },
  takeBonus: function(player, bonus) {
    
    bonus.kill();

    this.bonusSound.play('', 0, 0.1);

    this.evolution += 1;

    this.updateScore(100);
  },
  enemyHit: function(fire, enemy) {

    fire.kill();

    enemy.kill();

    this.expSound.play('', 0, 0.1);

    this.emitter.x = enemy.x + enemy.width / 2;
    this.emitter.y = enemy.y + enemy.height / 2;
    this.emitter.start(true, 300, null, 10);

    this.updateScore(10);
  },
  fire: function() {

    if (this.game.time.now > this.fireTime) {
      this.fireTime = game.time.now + 300;
      this.fireSound.play('', 0, 0.1);

      if (this.evolution == 1) {
        this.oneFire(this.player.x + this.player.width / 2, this.player.y);

      } else if (this.evolution == 2) {
        this.oneFire(this.player.x + this.player.width * 1 / 4, this.player.y);
        this.oneFire(this.player.x + this.player.width * 3 / 4, this.player.y);

      } else {
        this.oneFire(this.player.x, this.player.y);
        this.oneFire(this.player.x + this.player.width / 2, this.player.y);
        this.oneFire(this.player.x + this.player.width, this.player.y);
      }

      this.game.add.tween(this.player)
        .to({ y: this.playerY + 5 }, 50, Phaser.Easing.Linear.None)
        .to({ y: this.playerY }, 50, Phaser.Easing.Linear.None).start();
    }
  },
  oneFire: function(x, y) {
    var fire = this.fires.getFirstExists(false);

    if (fire) {
      game.physics.arcade.enableBody(fire);
      fire.reset(x - fire.width / 2, y - fire.height);
      fire.body.velocity.y = -500;  
    }
  },
  updateScore: function(n) {
    SCORE += n;
    this.scoreText.setText(SCORE);
  },
  clear: function() {
    this.lives = 3;
    this.evolution = 1;
  }
};

Game.Over = function(game) {};
Game.Over.prototype = {
  create: function() {

    game.add.audio('dead').play('', 0, 0.2);

    label = game.add.text(
      W / 2,
      H / 2,
      'MOHON MAAF, SILAHKAN COBA LAGI\n\nSCORE: ' + SCORE + '\n\nJika Mau Main Lagi Tekan Tanda Panah Atas \n',
      {
        font: '30px Arial',
        fill: '#fff',
        align: 'center'
      }
    );
    label.anchor.setTo(0.5, 0.5);

    this.time = this.game.time.now + 800;

    this.cursor = game.input.keyboard.createCursorKeys();
  },
  update: function() {
    if (this.game.time.now > this.time && this.cursor.up.isDown) {
      game.state.start('Play');
    }
  }
};

var game = new Phaser.Game(W, H, Phaser.AUTO, 'gameContainer');
game.state.add('Load', Game.Load);
game.state.add('Intro', Game.Intro);
game.state.add('Play', Game.Play);
game.state.add('Over', Game.Over);
game.state.start('Load');
