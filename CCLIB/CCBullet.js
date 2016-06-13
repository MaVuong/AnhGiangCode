var CCVector = require('./CCVector');
var common = require('./common');

function CCBullet(id_player, id_bullet) {
    this.numberID = "" + id_bullet;
    this.idplayer = id_player;
    this.pos = {};
    this.lengthMove = 0;
    this.r = 5;
    this.gocdichuyen = 0;// tinh bang radian
    this.speed = 400;//velocity
    this.isNew = true;
    this.opacity = 1;
    this.isRemove = false;
    this.zoneId = 0;
}

CCBullet.prototype.setMoveDir = function (goc_degree, beginPos) {
    this.gocdichuyen = (goc_degree * 3.141592) / 180;
    this.pos = beginPos;
}
CCBullet.prototype.updatePosition = function (delta_time) {
    // if (this.isNew) {
    // 	this.isNew=false;
    // 	return;
    // }
    if (this.isRemove) {
        return;
    }

    var lengtMV = delta_time * this.speed; //canh huyen
    this.lengthMove = this.lengthMove + lengtMV; //moved distance
    var newX = this.pos.x + lengtMV * Math.cos(this.gocdichuyen);
    var newY = this.pos.y + lengtMV * Math.sin(this.gocdichuyen);
    this.pos.x = Math.round(newX);
    this.pos.y = Math.round(newY);
    if (this.lengthMove > 150) {
        var tile = this.lengthMove - 150;
        this.opacity = 1 - tile * 0.01;
        if (this.opacity < 0) {
            this.opacity = 0;
        }
    }
    if (this.lengthMove > 300) {
        this.isRemove = true;
    }
}


//check if collision happen, if yes, return the delta_overlap otherwise return 0
CCBullet.prototype.checkCollisionWithObstacle = function (obstacle) {
    var dtX = Math.abs(this.pos.x - obstacle.x);
    var dtY = Math.abs(this.pos.y - obstacle.y);
    var kcW = obstacle.w / 2;
    var kcH = obstacle.h / 2;

    if (dtX < kcW && dtY < kcH) {
        this.isRemove = true;
    }
}

//check if collision happen, if yes, return the delta_overlap otherwise return 0
CCBullet.prototype.checkCollisionWithTank = function (tank) {
    var dtX = Math.abs(this.pos.x - tank.pos.x);
    var dtY = Math.abs(this.pos.y - tank.pos.y);
    var distance = common.distace2Object(this.pos, tank.pos);
    var kcW = distance / 2;
    var kcH = distance / 2;

    if (dtX < kcW && dtY < kcH) {
        this.isRemove = true;
        tank.hp--;
        tank.isShooted = true;
        if (tank.hp = 0) {
            tank.isRemove = true;
        }

        return true;
    }
    return false;
}

CCBullet.prototype.checkCollisionWithMapEdge = function () {
    if (this.pos.x < -1450 || this.pos.x > 1450 || this.pos.y < -950 || this.pos.y > 950) {
        this.isRemove = true;
    }

}


module.exports = CCBullet;