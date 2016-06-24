var common = require('./common');
function CCAI(player_s) {
    this.player = player_s;
    this.id = null;


    this.countStep = 0;
    this.nextCountStep = 0;
}
CCAI.prototype.setBeginLevel = function () {
    var beginR = Math.floor(Math.random() * 10) + 1;

    var speed = 30 + beginR * 2;
    var hpmax = beginR * 10 + 100;
    var hpcur = hpmax - Math.floor(Math.random() * 30);
    var score = Math.floor(Math.random() * 100) + beginR * 5;


    this.player.level = beginR;
    this.player.mySpeed = speed;
    this.player.score = score;
}


CCAI.prototype.UpdateState = function () {
    this.countStep = this.countStep + 1;

    if (this.nextCountStep > 100) {
        if (this.countStep >= this.nextCountStep) {
            this.nextCountStep = 0;
            this.countStep = 0;
            var crstt = this.player.MVSTT % 2;
            this.player.MVSTT = Math.floor(Math.random() * 4) + 1;
            if (this.player.MVSTT < 1) {
                this.player.MVSTT = 4;
            }
            if (this.player.MVSTT > 4) {
                this.player.MVSTT = 1;
            }
            var dirnew = this.player.MVSTT % 2;
            if (crstt == dirnew) {// ti le di tien hoac lui chi bang 1/4 thoi
                this.player.MVSTT = Math.floor(Math.random() * 4) + 1;
                if (this.player.MVSTT < 1) {
                    this.player.MVSTT = 4;
                }
                if (this.player.MVSTT > 4) {
                    this.player.MVSTT = 1;
                }
            }
        }
    } else {
        this.nextCountStep = Math.floor(Math.random() * 300) + 100;
    }

}

CCAI.prototype.shootClosestTank = function (arrtankzone, zoneIdArr, obstacleArr) {

    var minDistance = 300;
    var target = null;

    for (var i = 0; i < zoneIdArr.length; i++) {
        var tankArr = arrtankzone[zoneIdArr[i]];  //get tank in zoneId

        for (var j = 0; j < tankArr.length; j++) {
            var tank = tankArr[j];//get tank

            if (this.player.numberID !== tank.numberID) {

                //get distance
                var distance = common.distace2Object(this.player.pos, tank.pos);
                //console.log('this '+ this.player.numberID+ ' closest ' + tank.numberID +' '+distance);
                if (distance < minDistance) {
                    //check if there is obstacle between this boot and the tank
                    var intersect = false;
                    var k = 0;

                    while (k < obstacleArr.length && !intersect) {
                        if (common.lineRectIntersec(this.player.pos.x, this.player.pos.y, tank.pos.x, tank.pos.y,
                                obstacleArr[k].x, obstacleArr[k].y, obstacleArr[k].w, obstacleArr[k].h)) {
                            intersect = true;
                        }
                        k++;
                    }

                    if (!intersect) {
                        minDistance = distance;
                        target = tank;
                    }
                }

            }

        }
    }
    if (target !== null && minDistance < 100) {
        console.log('AI shoot target ' + target.numberID);
        this.shootTarget(target);
    }

}

CCAI.prototype.shootTarget = function (target) {


    console.log(this.player.numberID + " | " + this.player.pos.x);

    var sourcePos = this.player.pos;
    var targetPos = target.pos;
    var angle = common.calcAngle(sourcePos, targetPos);
    this.player.changeRotationGun(angle);
}


module.exports = CCAI;