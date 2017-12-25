

var canvas = document.getElementById('map')
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
var ctx = canvas.getContext('2d');

var score = document.getElementById('score');

var menu = document.getElementById('menu')

var restart = document.getElementById('restart')

var end_score = document.getElementById('end-score')

var scoreNum = score.getElementsByTagName('span')[0];
// console.log(scoreNum);

var picsnames = ["background.png", "bullet1.png", "bullet2.png", "enemy1.png", "enemy2.png", "enemy3.png", "herofly.png", "loading.gif", "prop.png"];
var picCount = 0;
for (var i = 0; i < picsnames.length; i++) {
    var imgs = new Image();
    imgs.src = "./img/" + picsnames[i];
    imgs.onload = function () {
        picCount++;
        if (picCount == picsnames.length) {
            document.getElementById('loading').style.display = "none";
            main()
        }
    }

}


//创建地图
var bgImage = new Image();
bgImage.src = "./img/background.png"
// console.log(bgImage)
var background = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
    draw: function () {
        var wid = Math.ceil(canvas.width / 320);
        var hei = Math.ceil(canvas.height / 568);
        for (var i = -hei; i < hei; i++) {
            for (var j = 0; j < wid; j++) {
                ctx.drawImage(bgImage, j * 320, i * 568)
            }
        }

    }
}



var heroImg = new Image();
var bulletsImg1 = new Image();
bulletsImg1.src = "./img/bullet1.png"
var bulletsImg2 = new Image();
bulletsImg2.src = "./img/bullet2.png"
heroImg.src = "./img/herofly.png"

var hero = {
    x: canvas.width / 2 - 33,
    y: canvas.height - 82 - 100,
    w: 66,
    h: 82,
    boom: false,
    isDie: false,
    flagI: 0,//延迟爆炸
    i: 0,//图片张数   i=5 ===>isDie
    shotType: 0,//子弹类型   0:单排   1:双排
    shotspeed: 0,
    maxI: 5,

    bullets: [],
    draw: function () {
        if (this.boom) {
            this.flagI++;
            if (this.flagI >= 5) {
                this.i++;
                if (this.i == this.maxI) {
                    gameOver()
                    console.log("我死了")

                    this.isDie = true;
                    console.log(this.isDie)

                }
            }

        }
        if(this.isDie == false){

            ctx.drawImage(heroImg, this.i * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h)
        }
        
    },

    shot: function () {
        if (this.boom) {
            return
        }

        if(this.isDie==true){
            return;
        }
        // console.log(this.isDie)

        if (this.shotspeed == 5) {
            if (this.shotType == 0) {
                var bullet = new Bullets(this.x + this.w / 2 - 3, this.y - 14, 6, 14, bulletsImg1, 1)

            } else {
                var bullet = new Bullets(this.x + this.w / 2 - 24, this.y + 20, 48, 14, bulletsImg2, 2);

            }
            this.bullets.push(bullet);
            this.shotspeed = 0;
        }
        this.shotspeed++;

      
        
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].y <= -this.bullets[i].h) {

                this.bullets.splice(i, 1);
                i--;
            } else {

                this.bullets[i].move();
                this.bullets[i].draw();
            }
            // console.log(this.bullets.length);
        }
    }
}
//===========================================大飞机逻辑================================









canvas.onmousedown = function (event) {
    var x = event.clientX;
    var y = event.clientY;

    if (x < hero.x || x > hero.x + hero.w || y < hero.y || y > hero.y + hero.y + hero.h) {

    } else {
        canvas.onmousemove = function (event) {

            hero.x = event.clientX - hero.w / 2
            hero.y = event.clientY - hero.h / 2
        }
    }
}


canvas.onmouseup = function (evnt) {
    canvas.onmousemove = null;
}






//创建子弹
function Bullets(x, y, w, h, img, hurt) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img
    this.hurt = hurt
}
Bullets.prototype.draw = function () {
    ctx.drawImage(this.img, this.x, this.y, this.w, this.h)
}
Bullets.prototype.move = function () {
    this.y -= 15;
}






var propImg = new Image();
propImg.src = "./img/prop.png"
function Prop(img,x, y, type, speed) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = img.width/2;
    this.h = img.height;
    this.type = type;
    this.speed = speed;
    this.isDie = false;
}
Prop.prototype.draw = function () {
    ctx.drawImage(this.img, this.type * this.w, 0, this.w, this.h, this.x, this.y, this.w, this.h);
}
Prop.prototype.move = function () {
    this.y += this.speed;
}



//random函数
function random(x, y) {
    return parseInt(Math.random() * (y - x + 1) + x)
}

//随机产生补给
var props = [];
function randomProp() {
    var num = random(1, 1000);
    if (num <= 20) {
        var randomX = random(0, canvas.width - 38);
        var randomType = random(0, 1);
        var randomSpeed = random(5, 10);
        var prop = new Prop(propImg,randomX, -68, randomType, randomSpeed,propImg);
        props.push(prop);
    }
    for (var i = 0; i < props.length; i++) {
        if (props[i].y > canvas.y || props[i].isDie == true) {
            props.splice(i, 1);
            i--;
        } else {
            props[i].draw();
            props[i].move();
        }
    }
}
function Enemy(x, y, w, h, img, speed, hp, maxI, score) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.boom = false;
    this.img = img;
    this.speed = speed;
    this.hp = hp;
    this.i = 0;
    this.maxI = maxI;//切换的图片最大张数
    this.isDie = false;
    this.flagI = 0;
    this.score = score;
}

Enemy.prototype.draw = function () {
    if (this.boom) {
        this.flagI++
        if (this.flagI >= 5) {
            this.i++;
            if (this.i == this.maxI) {
                // console.log("haha")
                isDie = true;
            }
        }
    }


    //由于使用精灵图,需要确定图片张数位置
    ctx.drawImage(this.img, this.w * this.i, 0, this.w, this.h, this.x, this.y, this.w, this.h);
}
Enemy.prototype.move = function () {
    //移动y轴,y轴逐渐增大;
    this.y += this.speed;
}
//--------------------------敌机对象创建结束---------------------------------

//图片创建
var enemy1 = new Image();
enemy1.src = "./img/enemy1.png";
var enemy2 = new Image();
enemy2.src = "./img/enemy2.png";
var enemy3 = new Image();
enemy3.src = "./img/enemy3.png";
var enemies = [];

function randomEnemy() {
    var enemyNum = random(0, 500);
    if (enemyNum <= 50) {
        if (enemyNum <= 40) {//小飞机
            //随机位置
            var randomX = random(0, canvas.width - 38);
            //随机速度
            var randomSpeed = random(2, 10);
            //创建飞机
            var enemy = new Enemy(randomX, -34, 38, 34, enemy1, randomSpeed, 2, 5, 100)
            //加入数组
            enemies.push(enemy)
        } else if (enemyNum <= 48) {
            var randomX = random(0, canvas.width - 46);
            //随机速度
            var randomSpeed = random(2, 6);
            //创建飞机
            var enemy = new Enemy(randomX, -64, 46, 64, enemy2, randomSpeed, 10, 6, 200)
            enemies.push(enemy)
        } else {
            var randomX = random(0, canvas.width - 110);
            //随机速度
            var randomSpeed = random(2, 4);
            //创建飞机
            var enemy = new Enemy(randomX, -164, 110, 164, enemy3, randomSpeed, 20, 10, 1000)
            enemies.push(enemy)
        }
    }
    for (var i = 0; i < enemies.length; i++) {
        //判断飞出屏幕清除
        enemies[i].move();
        enemies[i].draw();
        if (enemies[i].y > canvas.height || enemies[i].isDie) {
            enemies.splice(i, 1);
            // console.log("eee")
            i--;
        }



    }
}




//碰撞检验 
function crash(obj1, obj2) {

    var hl1 = obj1.x;
    var hl2 = obj1.x + obj1.w;
    var ht1 = obj1.y;
    var ht2 = obj1.y + obj1.h;



    var el1 = obj2.x;
    var el2 = obj2.x + obj2.w;
    var et1 = obj2.y;
    var et2 = obj2.y + obj2.h;

    if (hl2 < el1 || hl1 > el2 || ht2 < et1 || ht1 > et2) {
        return false;
    } else {
        return true;
    }



}


//碰撞逻辑
var timerID = null;
function justify() {

    //捡装备
    for (var p = 0; p < props.length; p++) {

        var crashProp = crash(hero, props[p])
        if (crashProp == true) {
            props[p].isDie = true;
            //捡到炸弹
            if (props[p].type == 0) {
                for (var die = 0; die < enemies.length; die++) {
                    enemies[die].boom = true;
                    scoreNum.innerText = parseInt(scoreNum.innerText) + parseInt(enemies[die].score)
                    // console.log(enemies.length)
                }
            } else {
                clearTimeout(timerID);
                hero.shotType = 1;
                timerID = setTimeout(function () {
                    hero.shotType = 0
                }, 5000)
            }
        }


    }



    for (var i = 0; i < enemies.length; i++) {
        //打飞机
        for (var j = 0; j < hero.bullets.length; j++) {
            if (enemies[i].boom) {
                break;
            }
            var crashEnmey = crash(hero.bullets[j], enemies[i])
            if (crashEnmey) {
                enemies[i].hp -= hero.bullets[j].hurt
                // console.log(enemies[i].hp)

                if (enemies[i].hp <= 0) {

                    // console.log('hahah');
                    enemies[i].boom = true;
                    console.log(enemies[i].score);
                    scoreNum.innerText = parseInt(scoreNum.innerText) + parseInt(enemies[i].score)


                }
                //子弹不清除会有穿透效果,会导致持续扣血
                hero.bullets.splice(j, 1)
                j--
            }

        }

        //英雄死亡
        if (enemies[i].boom) {
            continue;
        }
        var crashHero = crash(hero, enemies[i])
        if (crashHero) {
            hero.boom = true

        }

    }
}



//====================================作弊======================
// var lie = {
//     shotType:0,
//     shotspeed:0,

//     //方法
//     shotCode:function(){
//         if(this.shotType==1){
//             if(hero.shotType!=1){
//                 hero.shotType=1
//             }
//         }


//     },
//     speedCode:function(){
//         if(this.shotspeed==1){
//             if(hero.shotspeed!=5){
//                 hero.shotspeed=5
//                 console.log('bucuoo')
//             }
//         }


//     },


//     //开关
//     flagOpen:function(){
//         var that = this;
//         document.onkeydown = function (event) {
//             // console.log(event.keyCode);
//             if (event.keyCode == 66&&event.altKey) {
//                 that.shotType =1;
//             }
//             if (event.keyCode == 78&&event.altKey) {
//                 that.shotspeed =1;
//                 console.log('nihao')
//             }
//         }
//     }
// }
//====================================作弊======================











function gameOver() {
    end_score.innerHTML = score.innerHTML;
    menu.style.display = "block";
}

restart.onclick = function () {
    location.href = location.href
}





window.onresize = function() {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    background.draw();
}




function main() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw()//地图加载


    hero.draw()
    hero.shot()


    randomEnemy();
    randomProp();

    //碰撞检验
    justify()


    requestAnimationFrame(main)


}




//作弊代码
function shotLie(func) {
    function deco() {
        hero.shotType = 1
        func()
    }
    return deco
}


function speedLie(func) {
    function deco() {
        hero.shotspeed = 5
        func()
    }
    return deco
}



document.onkeydown = function (event) {
    if (event.keyCode == 66 && event.altKey) {
        main = shotLie(main)
    }
    if (event.keyCode == 78 && event.altKey) {
        main = speedLie(main)
    }
}






