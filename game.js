kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0,0,0,1,]
})


const MOVE_SPEED = 250
const ENEMY_SPEED = 20
const JUMP_FORCE = 400
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 400


loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png') 
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-bottom-left', 'ReTPiWY.png')
loadSprite('pipe-bottom-right', 'hj2GK4n.png')
loadSprite('pipe-top-left', 'c1cYSbt.png')
loadSprite('pipe-top-right', 'nqQ79eI.png')
//for level 2 below:
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')


scene("game", ({level, score})=> {
layers(['bg', 'obj', 'ui'], 'obj')

const maps = [ 
    [
    '                                           ',
    '                                           ',
    '                                           ',
    '                                           ',
    '                                           ',
    '                                           ',
    '    %   =*=%=                              ',
    '                                           ',
    '                            ()             ',
    '                   ^    ^   -+             ',
    '===============================     ======='
],

[
    '&                                                  &',
    '&                                                  &',
    '&                                                  &',
    '&                                                  &',
    '&                                                  &',
    '&                                                  &',
    '&        @@@@@@                   x x              &',
    '&                               x x x              &',
    '&                             x x x x x          ()&',
    '&                   z    z  x x x x x x          -+&',
    '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
],

]


const levelCfg ={
width: 20,
height: 20,
'=': [sprite('block'), solid()],
'$': [sprite('coin'), 'coin'],
'%': [sprite('surprise'), solid(), 'coin-surprise'],
'*': [sprite('surprise'), solid(), 'mushroom-surprise'],
'}': [sprite('unboxed'), solid()],
'(': [sprite('pipe-bottom-left'), solid(), scale(0.5),'pipe'], //make pipes same size as other stuff
')': [sprite('pipe-bottom-right'), solid(), scale(0.5), 'pipe'],
'-': [sprite('pipe-top-left'), solid(), scale(0.5)],
'+': [sprite('pipe-top-right'), solid(), scale(0.5)],
'^': [sprite('evil-shroom'), solid(), 'dangerous'],
'#': [sprite('mushroom'), solid(), 'mushroom', body()], // body gives this gravity effect
'!': [sprite('blue-block'), solid(), scale(0.5)],
'&': [sprite('blue-brick'), solid(), scale(0.5)],
'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
'@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
'x': [sprite('blue-steel'), solid(), scale(0.5)],
}

const gameLevel = addLevel(maps[level], levelCfg)

// add the score to the game. this will also allow us to pass onto other levels of the game
const scoreLabel = add([
text(score),
pos(30,6), //put in lefthand corner
layer('ui'),//add to the UI layer.  Everythign so far is on the 'obj' layer as the default as specified in the layers array.
{
    value: score,
}
])

add([text('level ' + parseInt(level +1)),pos(40,6)])

function big() {
    let timer = 0;
    let isBig = false;
  
    return {
      update() {
        if (isBig) {
          timer -= dt(); // kaboom delta time since last frame
          if (timer <= 0) { // if time ran out
            this.smallify(); // make mario small again
          }
        }
      },
  
      isBig() {
        
        return isBig;
      },
  
      smallify() {
        this.scale = vec2(1);
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0;
        isBig = false;
      },
  
      biggify(time) {
        this.scale = vec2(2);
        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
        timer = time;
        isBig = true;
      }
    };
  }
  

//add mario to the game
const player = add([
    sprite('mario'), 
    solid(),
    pos(30,0), //start position
    body(), //make mario fall from top to bottom with gravity. Since blocks are "solid", he will stop when he hits one.
    big(), // add the feature to make mario big or small
    origin('bot') // get rid of anything funny when we use body
])

// any tag of mushroom should be moved on the y axis by 10 (right).
action ('mushroom', (m) => {
    m.move(20,0)
})

player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
        gameLevel.spawn('$', obj.gridPos.sub(0,1)) // put a coin just above the surprise block
        destroy(obj) //destroy the block, leave a spawned coin.
        gameLevel.spawn('}', obj.gridPos.sub(0,0)) // create blank block in place of surprise block

    }

    if (obj.is('mushroom-surprise')) {
        gameLevel.spawn('#', obj.gridPos.sub(0,1)) // put a coin just above the surprise block
        destroy(obj) //destroy the block, leave a spawned coin.
        gameLevel.spawn('}', obj.gridPos.sub(0,0)) // create blank block in place of surprise block

    }
})

player.collides('mushroom', (m) => {
    destroy(m)
    player.biggify(6)
})

player.collides('coin', (c) => {
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
})

    //when user collides with pipe and is pressing down, go to next level and bring score wiht you
    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', {
                level: (level +1) % maps.length,//allow game to keep looping throug levels
                score: scoreLabel.value
            })
        })
    }) 

player.action(() => {
    camPos(player.pos) //have camera position follow the user at all times here)
    if (player.pos.y >= FALL_DEATH){
        go('lose', { score: scoreLabel.value}) 
    }
})

player.collides('dangerous', (d) => {
    if (isJumping){
        destroy(d)
    } else {
    go('lose', {score: scoreLabel.value})//move to end screen
    }
})

player.action(() => {
    if (player.grounded()) {
        isJumping = false
    }
})

action('dangerous', (d) => {
    d.move(-20,0)
})

//UI
keyDown('left', () => {
    player.move(-MOVE_SPEED,0)
})

keyDown('right', () => {
    player.move(MOVE_SPEED,0)
})

keyDown('up', () => {
    if (player.grounded()) {
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE)
    }
})

})

//GAME SETUP
scene('lose', ({score}) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game", {level: 0,score:0})

