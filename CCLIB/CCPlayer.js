var CCVector = require('./CCVector');

function CCPlayer(id) {
    this.numberID = "" + id;
    this.pos = new CCVector(0, 0);
    this.r = 0;
    this.w = 25;
    this.h = 22;
    this.r_target = 0;
    this.tangstt = 0;
    this.name = "USR_" + id;
    this.level = 1;
    this.hp = 10;
    var beginR = Math.floor(Math.random() * 4) + 1;
    this.MVSTT = beginR; //move status 1, 2, 3,4
    this.mySpeed = 30;//30-80
    this.lbdisplay = "";
    this.score = 0;

    this.gunRotation = beginR * 90 - 90; //0, 90, 180, 270
    this.gunRTarget = 0;
    this.gunstt = -1; // don't need to rotate
    this.isShooted = false;
    this.shooter = null;
    this.roomID = "";
    this.zoneid = 0;

    this.pack_bullet = [];
    this.pack_player = [];
    this.pack_items = [];
    this.pack_obs = [];
    this.type = 1;// 1 la player binh thuong, -1 la Boot
    this.isCollisder = false;
}

CCPlayer.prototype.changeRotationGun = function (newroation) {
    if (Math.abs(this.gunRotation) > 360) {
        this.gunRotation = this.gunRotation % 360;
    }
    this.gunRotation = Math.round(this.gunRotation);
    if (this.gunRotation < 0) {
        this.gunRotation = this.gunRotation + 360;
    }

    var hieukhoangcach = this.gunRotation - newroation;
    if (hieukhoangcach > 0) {
        if (Math.abs(hieukhoangcach) > 180) {
            var hieukc2 = 360 - Math.abs(hieukhoangcach);
            this.gunRTarget = hieukc2;
        } else {
            this.gunRTarget = -Math.abs(hieukhoangcach);
        }
    } else {
        if (Math.abs(hieukhoangcach) > 180) {
            var hieukc2 = 360 - Math.abs(hieukhoangcach);
            this.gunRTarget = -hieukc2;
        } else {
            this.gunRTarget = Math.abs(hieukhoangcach);
        }
    }

    if (this.gunRTarget > 0) {
        this.gunstt = 1;
    } else {
        this.gunstt = 2;
    }
    if (Math.abs(this.gunRTarget) < 5) {
        this.gunRotation = newroation;
        this.gunstt = 0;
    }
    //console.log("this.gunRotation : "+this.gunRotation +" this.gunRTarget : "+this.gunRTarget);
    //console.log("newroation: "+newroation+" this.gunstt: "+this.gunstt);


}
CCPlayer.prototype.updateGunRotationAndFire = function (dttime) {
    if (this.gunstt < 0) { //don't rotate
        return 0;
    }
    var giatrilon = Math.abs(this.gunRotation);
    if (giatrilon > 720) { //270?
        console.log("loi dat vi tri nong sung roi");
    }
    if (this.gunstt > 0) {
        var dt_rt = Math.round(300 * dttime);

        if (this.gunstt == 1) {//quay xuoi chieu
            var goctamthoi = this.gunRTarget - dt_rt; //this.gunRTarget: left angle to rotate to the target
            if (goctamthoi < 0) {
                this.gunRotation = this.gunRotation + this.gunRTarget; //this.gunRotation current angle
                this.gunRTarget = 0;
                this.gunstt = 0;// fire
            } else {
                this.gunRTarget = goctamthoi; //left angle to rotate
                this.gunRotation = this.gunRotation + dt_rt; //current angle
            }
        } else { //quay nguoc chieu
            var goctamthoi = this.gunRTarget + dt_rt;
            if (goctamthoi > 0) {//stop rotating
                this.gunRotation = this.gunRotation + this.gunRTarget; //current angle
                this.gunRTarget = 0; //stop rotate
                this.gunstt = 0;// fire
            } else { //continute to rotating
                this.gunRTarget = goctamthoi; //
                this.gunRotation = this.gunRotation - dt_rt;
            }
        }

    }

    if (this.gunstt == 0) { //=0 fire, =-1 do nothing, =1, 2 continute to rotate
        //fire
        //console.log("Fire ksjdklasdjlaskjdlask");
        this.gunstt = -1;
        return 1;
    } else {
        return 0;
    }


}
CCPlayer.prototype.chuanhoagoc = function (huongquay) {
    if (Math.round(this.r_target) != 0) { //in rotating --> do nothing
        return;
    }
    var pt1 = this.MVSTT % 2;
    var pt2 = huongquay % 2;
    if (pt2 == pt1) { //same axis --> no rotating
        this.MVSTT = huongquay;
        return;
    }

    var goctoi = 0;
    if (this.MVSTT == 1) {//0
        if (huongquay == 2) {
            goctoi = 90;
        } else {
            goctoi = -90;
        }
    } else if (this.MVSTT == 2) {//90
        if (huongquay == 3) {
            goctoi = 90;
        } else {
            goctoi = -90;
        }
    } else if (this.MVSTT == 3) {//180
        if (huongquay == 2) {
            goctoi = -90;
        } else {
            goctoi = 90;
        }
    } else if (this.MVSTT == 4) {//270
        if (huongquay == 3) {
            goctoi = -90;
        } else {
            goctoi = 90;
        }
    }
    this.r_target = goctoi;
    this.tangstt = 2;
    this.MVSTT = huongquay;
}
CCPlayer.prototype.updatePosition = function (df_movetime) {


    if (this.r_target > 0) { // tank is rotating
        var goctru = Math.round(df_movetime * 320); // angle has rotated in one frame
        this.r_target = this.r_target - goctru; //angle left to final position
        if (this.r_target < 5) { //< 5O stop rotate
            this.r_target = 0;
            this.tangstt = 0;		//don' rotate
        } else {
            this.r = this.r + goctru; //current angle of tank
        }
    } else if (this.r_target < 0) {
        var goctru = Math.round(df_movetime * 320);
        var lastTG = this.r_target;
        this.r_target = this.r_target + goctru;
        if (this.r_target > -5) {
            this.tangstt = 0;
            this.r_target = 0;
        } else {
            this.r = this.r - goctru; //current angle of tank
        }
    }


    if (this.tangstt > 0) {  //need to stop rotate before moving
        return;
    }
    if (this.MVSTT == 1) { //x-axis forward
        this.pos.x += this.mySpeed * df_movetime;
        this.r = 0;
    }
    else if (this.MVSTT == 2) //y-axis forward
    {
        this.pos.y += this.mySpeed * df_movetime;
        this.r = 90;
    }
    else if (this.MVSTT == 3) //x-axis backward
    {
        this.pos.x -= this.mySpeed * df_movetime;
        this.r = 0;
    }
    else if (this.MVSTT == 4) //y-axis backward
    {
        this.pos.y -= this.mySpeed * df_movetime;
        this.r = 90;
    }
}
//collision happen, adjust the position
function collisderLimitPos(dtlimit) {
    if (this.tangstt > 0) {
        return;
    }
    if (this.MVSTT == 1) {
        this.pos.x -= dtlimit;
    }
    else if (this.MVSTT == 2) {
        this.pos.y -= dtlimit;
    }
    else if (this.MVSTT == 3) {
        this.pos.x += dtlimit;
    }
    else if (this.MVSTT == 4) {
        this.pos.y += dtlimit;
    }
}

CCPlayer.prototype.checkCollisionWithMapEdge = function () {
    if (this.pos.x < -1450) {
        this.pos.x = -1450;
        this.isCollisder = true;
    } else if (this.pos.x > 1450) {
        this.pos.x = 1450;
        this.isCollisder = true;
    }

    if (this.pos.y < -950) {
        this.pos.y = -950;
        this.isCollisder = true;
    } else if (this.pos.y > 950) {
        this.pos.y = 950;
        this.isCollisder = true;
    }
}

CCPlayer.prototype.changeDir = function () {
    var huong = 1;
    var randomNumber = Math.random() >= 0.5;
    if (randomNumber) {
        huong = -1;
    }
    this.MVSTT = this.MVSTT + huong;
    if (this.MVSTT < 1) {
        this.MVSTT = 4;
    }
    if (this.MVSTT > 4) {
        this.MVSTT = 1;
    }
    this.countStep = 0;
}

//check if collision happen, if yes, return the delta_overlap otherwise return 0
CCPlayer.prototype.checkCollisionWithObstacle = function (obstacle) {
    var dtX = Math.abs(this.pos.x - obstacle.x);
    var dtY = Math.abs(this.pos.y - obstacle.y);
    var kcW = this.w / 2 + obstacle.w / 2;
    var kcH = this.h / 2 + obstacle.h / 2;

    if (dtX < kcW && dtY < kcH) {
        this.isCollisder = true;
        var overlapDistance = (this.MVSTT % 2 === 1) ? kcW - dtX : kcH - dtY;
        collisderLimitPos(overlapDistance);
    }
}

//check if collision with other tank happen, if yes, return the delta_overlap otherwise return 0
CCPlayer.prototype.checkCollisionWithOtherTank = function (tank) {
    var dtX = Math.abs(this.pos.x - tank.pos.x);
    var dtY = Math.abs(this.pos.y - tank.pos.y);
    var kcW = this.w / 2 + tank.w / 2;
    var kcH = this.h / 2 + tank.h / 2;

    if (dtX < kcW && dtY < kcH) {
        this.isCollisder = true;
        var overlapDistance = (this.MVSTT % 2 === 1) ? kcW - dtX : kcH - dtY;
        collisderLimitPos(overlapDistance);
    }
}


module.exports = CCPlayer;