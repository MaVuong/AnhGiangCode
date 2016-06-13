var CCAI = require('./CCAI');
var CCPlayer = require('./CCPlayer');
var CCBullet = require('./CCBullet');
var CCVector = require('./CCVector');

function getMapAround(location) {
    var cx = location % 10;
    var cy = Math.floor(location / 10);

    var arrayGet = [];
    arrayGet.push(location - 10 - 1);
    arrayGet.push(location - 10);
    arrayGet.push(location - 10 + 1);
    arrayGet.push(location - 1);
    arrayGet.push(location);
    arrayGet.push(location + 1);
    arrayGet.push(location + 10 - 1);
    arrayGet.push(location + 10);
    arrayGet.push(location + 10 + 1);
    var rtArray = [];
    for (var i = 0; i < 9; i++) {// chi co 9 phan tu theo 3x3 thoi
        var num_validate = arrayGet[i];
        var cvx = num_validate % 10;
        var cvy = Math.floor(num_validate / 10);
        var distance = Math.sqrt(Math.pow(cvx - cx, 2) + Math.pow(cvy - cy, 2));
        if (num_validate >= 0 && num_validate <= 99 && distance < 2) {
            rtArray.push(num_validate);
        }
    }
    return rtArray;
}
function logObject(obj) {
    console.log("info :x=%s , y=%s, w=%s, h=%s", obj.x, obj.y, obj.w, obj.h);
}


function distace2Object(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

//x,y to zoneId
function MapConvertUnit(x, y) {
    var cv_x = Number(x) + 1500;
    var cv_y = Number(y) + 1000;
    var xp = Math.floor(cv_x / 300);// map tam thoi co kich thuco la 3000,2000
    var yp = Math.floor(cv_y / 200);
    var index = Math.floor(yp * 10 + xp);
    if (index > 99 || xp > 9 || yp > 9 || index < 0) {
        console.log("convert to Unit error, xp=%s yp=%s index=%s", xp, yp, index);
        return -1;
    } else {
        return index;
    }
}

function CCRoom(idroom) {
    this.idNumber = "" + idroom;
    this.countUser = 0;
    this.PLAYLIST = {}; //tank list

    this.count_Bullet = 0;
    this.listArrBullet = {};

    this.listArrOBJ = null;// Object chuong ngai vat
    this.listArrFree = null; //list of free zones to generate random items
    this.listArrUnit = null;  //list of zones
    this.listArrFrePosition = null;   //free positions
    this.idAI = -1;
    this.BOOTAILIST = [];     //machine tank list
    this.lifeTimeSC = 0;
    this.lastPosAdd = null;
}
CCRoom.prototype.getCountUser = function () {
    var numbercount = 0;
    for (var user in this.PLAYLIST) {
        numbercount = numbercount + 1;
    }
    return numbercount;
}
CCRoom.prototype.getCountUserSocket = function () {
    var numbercount = 0;
    for (var user in this.PLAYLIST) {
        var player_check = this.PLAYLIST[user];
        if (player_check.type == 1) {
            numbercount = numbercount + 1;
        }

    }
    return numbercount;
}

CCRoom.prototype.ClearAll = function () {
    this.listArrOBJ = null;// Object chuong ngai vat
    this.listArrFree = null;
    this.listArrUnit = null;
    this.listArrFrePosition = null;
    this.BOOTAILIST = null;
    this.lastPosAdd = null;
}

CCRoom.prototype.RemovePlayerIfNeed = function (playerid) {
    delete this.PLAYLIST[playerid];
}

CCRoom.prototype.AddPlayer = function (player) {
    this.PLAYLIST[player.numberID] = player;

    var countFree = this.listArrFrePosition.length;
    var rd = Math.floor(Math.random() * countFree); //get a random zoneId
    if (rd >= countFree) { //can not happen ?
        console.log("loi roi oi lay random add player vao position m_free");
        rd = countFree - 1;
    }

    var objFree = this.listArrFrePosition[rd]; //free position
    logObject(objFree);// luu y: do luoi ve o client luon luon la boi so cua df_cell_draw_width=20 nen o day vi tri x,y cung phai la boi so cua 20
    player.pos.x = Number(objFree.x);
    player.pos.y = Number(objFree.y);
    this.lastPosAdd = objFree; //store last position the tank added
    player.mySpeed = 80;
    console.log("-----Finish AddPlayer");
    // se while cho den khi tim duoc vi tri thic hop, neu khong tim dc thi dat bien status da no ra khoi server
    // thang moi vao thi trong thoi gian 2s se dc bao ve va co hien tuong nhay nhay
    console.log("----------------->rd: %s vi tri x=%s y=%s", rd, objFree.x, objFree.y);
}

CCRoom.prototype.loadMapAndAI = function () {
    fs = require('fs')
    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync('./Map/mapgame1.json', 'utf8'));
    this.listArrOBJ = obj.mapObstacle;
    console.log(this.listArrOBJ.length);
    this.listArrFree = obj.mapFreeRect; //free zone to gen items
    this.listArrUnit = obj.Unit;
    this.listArrFrePosition = obj.ArrFreePos;
    console.log("MAP %s IS LOADED-->", this.idNumber);


    /*
     //chi danh cho test map ma thoi
     var m_free=this.listArrFrePosition.length;
     for (var kf = 0; kf < m_free; kf++) {
     var tmp_pos_free=this.listArrFrePosition[kf];
     //console.log("FUCK AKLL: %s :%s    --   %s",kf,tmp_pos_free.x,tmp_pos_free.y);
     var arr_Ob_arroundme=this.getAllObstacbesAroundMe(tmp_pos_free.x,tmp_pos_free.y);
     var tmp_length_arround=arr_Ob_arroundme.length;
     for (var iar = 0; iar < tmp_length_arround; iar++) {
     var tmp_obs=arr_Ob_arroundme[iar];

     var dtX=Math.abs(tmp_pos_free.x-tmp_obs.x);
     var dtY=Math.abs(tmp_pos_free.y-tmp_obs.y);
     var kcW=14+tmp_obs.w/2;
     var kcH=14+tmp_obs.h/2;

     if (dtX<kcW&&dtY<kcH) {
     console.log("co va cham roi %s %s",tmp_pos_free.x,tmp_pos_free.y);
     }
     }
     }
     */


}


/*
 * update position: tank, AI, bullet
 * for (tank)
 * check collision with:
 * other tank/AI/Obtacles/map/ --> change direction (not the same)
 * bullet --> reduce,.../
 *
 *
 */
CCRoom.prototype.updateFrameStep = function (dttime) {

    var arrtankZone = [];
    var arrBulletZone = [];
    var arrItemZone = [];
    /// khoi tao 3 mang Object
    for (var i = 0; i < 100; i++) {
        arrtankZone.push([]); //arrtankZone[[],[],[] ....,[]]
        arrBulletZone.push([]);
        arrItemZone.push([]);
    }


    //update tank positions and push tanks into their right zones
    for (var tankid  in this.PLAYLIST) {
        var tankObj = this.PLAYLIST[tankid];

        //update position before push into right zone
        tankObj.updatePosition(dttime);
        var indexcv = MapConvertUnit(tankObj.pos.x, tankObj.pos.y);
        tankObj.zoneid = indexcv;
        if (indexcv >= 0) {
            var tankzoneitem = arrtankZone[indexcv];
            tankzoneitem.push(tankObj);  //push tank into the right zoneId
        }

    }


    //update bullet position and push the bullet into the right zones
    for (var b_name in this.listArrBullet) {
        var bl = this.listArrBullet[b_name];
        bl.updatePosition(dttime);


        var indexcv = MapConvertUnit(bl.pos.x, bl.pos.y);
        bl.zoneid = indexcv;
        if (indexcv >= 0) {
            var bulletZoneItem = arrBulletZone[indexcv];
            bulletZoneItem.push(bl);  //push bullet into the right zoneId
        }

        /*
         */
    }


    //update tank-bullet and Obstacle-bullet collision

    for (var b_name in this.listArrBullet) {
        var bl = this.listArrBullet[b_name];

        bl.checkCollisionWithMapEdge();

        //update collision with around obtacles
        var arr_Obs_arround = this.getAllObstacbesAroundMe(bl.pos.x, bl.pos.y);
        for (var i = 0; i < arr_Obs_arround.length; i++) {
            bl.checkCollisionWithObstacle(arr_Obs_arround[i]);
        }

        //update collision with around tank
        var arrAroundZones = getMapAround(bl.zoneid); //all around zoneIds
        for (var i = 0; i < arrAroundZones.length; i++) {// max la 0-9 thoi
            var tankArr = arrtankZone[arrAroundZones[i]];  //get tank in zoneId
            for (var j = 0; j < tankArr.length; j++) {
                if (bl.checkCollisionWithTank(tankArr[j])) {
                    var shooter = this.PLAYLIST[bl.idplayer];
                    shooter.score++;
                    this.shooter = shooter;
                }
            }
        }

    }


    this.UpdateAIController(arrtankZone);
    var pack_removebullet = [];
    var pack_send_client_bullet = [];

    for (var tankid  in this.PLAYLIST) {// update thong tin xu ly cac xe tank
        var tankObj_tmp = this.PLAYLIST[tankid];
        if (!tankObj_tmp.isRemove) {
            //collision with wall --> set the collision = true

            tankObj_tmp.isCollisder = false;
            tankObj_tmp.checkCollisionWithMapEdge();

            var firestatus = tankObj_tmp.updateGunRotationAndFire(dttime);
            if (firestatus === 1) {
                this.createNewBullet(tankObj_tmp);
            }

            var arr_Obs_arround = this.getAllObstacbesAroundMe(tankObj_tmp.pos.x, tankObj_tmp.pos.y);

            var ARR_OBS_PACK = [];
            for (var idobj = 0; idobj < arr_Obs_arround.length; idobj++) {// lay ra cac Obs xung quanh no va kt va cham
                var tmpObs = arr_Obs_arround[idobj];
                var distance = distace2Object(tankObj_tmp.pos, tmpObs);
                if (distance < 400) {
                    ARR_OBS_PACK.push({
                        x: tmpObs.x,
                        y: tmpObs.y,
                        w: tmpObs.w,
                        h: tmpObs.h,
                        id: tmpObs.id
                    });

                    //kiem tra va cham o day luon
                    tankObj_tmp.checkCollisionWithObstacle(tmpObs);
                }
            }


            var arrIndexArrount_tank = getMapAround(tankObj_tmp.zoneid); //all around zoneIds

            //get all bullet around me
            for (var i_t = 0; i_t < arrIndexArrount_tank.length; i_t++) {// max la 0-9 thoi
                var zonde_bullet_tmp = arrBulletZone[arrIndexArrount_tank[i_t]];  //get all bullets in zoneId

                for (var i_t_z = 0; i_t_z < zonde_bullet_tmp.length; i_t_z++) {
                    var buller_in_zone = zonde_bullet_tmp[i_t_z];//get bullet
                    if (bl.isRemove) {
                        pack_removebullet.push(b_name);
                    } else {
                        pack_send_client_bullet.push({
                            x: Number(bl.pos.x),
                            y: Number(bl.pos.y),
                            opp: bl.opacity,
                            id: bl.numberID
                        });
                    }
                }
            }


            //update tanks in around zones
            var ARR_TANK_PACK = [];

            for (var i_t = 0; i_t < arrIndexArrount_tank.length; i_t++) {// max la 0-9 thoi
                var id_zone_tmpx = arrIndexArrount_tank[i_t];// tu 0-9 ==> get a zoneId
                var zonde_tank_tmp = arrtankZone[id_zone_tmpx];  //get tank in zoneId

                for (var i_t_z = 0; i_t_z < zonde_tank_tmp.length; i_t_z++) {
                    var tank_in_zone = zonde_tank_tmp[i_t_z];//get tank

                    //check the collision with this tank, if have, adjust the position
                    if (distace2Object(tankObj_tmp.pos, tank_in_zone) < 100) {
                        tankObj_tmp.checkCollisionWithOtherTank(tank_in_zone);
                    }

                    var strspPush = "";
                    if (tankObj_tmp.isCollisder) {//tank hien tai dang va cham, khong gui thong tin ve speed, MVStatus, tankstatus c
                        //cua cac tank khac
                        strspPush = "";
                    } else {
                        strspPush = tank_in_zone.mySpeed + "|" + tank_in_zone.MVSTT + "|" + tank_in_zone.tangstt;
                    }

                    ARR_TANK_PACK.push({
                        x: Number(tank_in_zone.pos.x).toFixed(2) + "",
                        y: Number(tank_in_zone.pos.y).toFixed(2) + "",
                        id: tank_in_zone.numberID + "",
                        r: Number(tank_in_zone.r).toFixed(2) + "",
                        //typeTank:player_tmp.typeTank,
                        lbdisplay: tank_in_zone.lbdisplay,
                        level: tank_in_zone.level + "",
                        score: tank_in_zone.score + "",
                        sp: strspPush,
                        gR: tank_in_zone.gunRotation + ""
                    });
                }
            }

            if (tankObj_tmp.isCollisder) {
                tankObj_tmp.changeDir();
            }
            tankObj_tmp.pack_bullet = pack_send_client_bullet;
            tankObj_tmp.pack_player = ARR_TANK_PACK;
            tankObj_tmp.pack_obs = ARR_OBS_PACK;

        }
    }

    var maxCount = pack_removebullet.length;
    for (var i = 0; i < maxCount; i++) {
        var iddelete = pack_removebullet[i];
        console.log("iddelete: %s", iddelete);
        delete this.listArrBullet[iddelete];
    }
    pack_removebullet = [];


    this.lifeTimeSC = this.lifeTimeSC + dttime;

    if (this.lifeTimeSC > 2) {
        this.lifeTimeSC = 0;
        this.ManagerAI();
    }


    arrtankZone = [];
    arrBulletZone = [];
    arrItemZone = [];

}


CCRoom.prototype.UpdateAIController = function (arrtankzone) {

    for (var ai_id in this.BOOTAILIST) {
        var boot_tmp = this.BOOTAILIST[ai_id];
        if (boot_tmp.player.isCollisder) {
            boot_tmp.changeDir();
        } else {

            boot_tmp.UpdateState();
        }

        if (boot_tmp.player.isShooted){
            boot_tmp.shootTarget(boot_tmp.player.shooter);
            boot_tmp.player.isShooted = false;
            boot_tmp.player.shooter = null;
        } else {
            var zoneIdArr = getMapAround(this.player.zoneId); //all around zoneIds
            var arr_Obs_arround = this.getAllObstacbesAroundMe(this.player.pos.x, this.player.pos.y);

            boot_tmp.shootClosestTank(zoneIdArr, arrtankzone, arr_Obs_arround);
        }
    }
    /*
     cach 1 kiem tra xem co chuong ngai vat tren duong di cua vien dan khong bang cach giai phuong trinh duong thang cat duong thang
     cach 2 la ban 1 phat thu xem co trung muc tieu hay khong, khong trung thi thoi ko ban nua


     quy tac la uu tien ban tank dang ban minh truoc , 2 la neu bi 2 tank dong thoi ban thi ban lai tank gan nhat


     */
    arrtankzone = [];// da test roi khong sao ca
}


CCRoom.prototype.ManagerAI = function () {
    return;
    var cplay = this.getCountUser();
    if (cplay > 40 || cplay == 0) {
        return;
    }
    var countAddAI = 5;
    if (cplay > 30) {
        countAddAI = 2;
    } else if (countAddAI > 20) {
        countAddAI = 3;
    } else if (countAddAI > 10) {
        countAddAI = 4;
    }
    countAddAI = 2;
    var countFree = this.listArrFrePosition.length;
    for (var i_ad = 0; i_ad < countAddAI; i_ad++) {

        var x_ai = -2000;
        var y_ai = -2000;

        var m_free = this.listArrFrePosition.length;

        var demw = 10;
        while (demw > 0) {
            var rd = Math.floor(Math.random() * countFree);
            if (rd >= countFree) {
                console.log(" ===+ERROR === AI random add player vao position m_free");
                rd = countFree - 1;
            }
            var xposFreeAdd = this.listArrFrePosition[rd];
            var getthisPos = true;
            for (var iplayname in this.PLAYLIST) {
                var play_check = this.PLAYLIST[iplayname];
                var player_check_distance = distace2Object(play_check.pos, xposFreeAdd);
                if (player_check_distance < 200) {
                    getthisPos = false;
                    break;
                }
            }
            if (getthisPos) {
                x_ai = Number(xposFreeAdd.x);
                y_ai = Number(xposFreeAdd.y);
                break;
            }
            demw = demw - 1;
        }


        if (x_ai == -2000 || y_ai == -2000) {
            console.log("add new AI but not have free position");
            break;
        } else {
            this.idAI = this.idAI - 1;
            if (this.idAI < -1000000) {
                this.idAI = -1;
            }
            var idset = "" + this.idAI;

            var player_ai = new CCPlayer(idset);
            player_ai.lbdisplay = "";
            var ai_tmp = new CCAI(player_ai);
            ai_tmp.id = idset;
            player_ai.type = -3;
            player_ai.pos.x = x_ai;
            player_ai.pos.y = y_ai;

            ai_tmp.setBeginLevel();
            console.log("Add new AI :%s pos: %s , %s", idset, x_ai, y_ai);

            this.PLAYLIST[idset] = player_ai;
            this.BOOTAILIST[idset] = ai_tmp;

        }


    }
}


CCRoom.prototype.createNewBullet = function (tankfire) {
    this.count_Bullet++;
    if (this.count_Bullet > 1000000) {
        this.count_Bullet = 1;
    }
    var gocban = tankfire.gunRotation;
    var xbegin = tankfire.pos.x;
    var ybegin = tankfire.pos.y;
    var diembanbandau = new CCVector(xbegin, ybegin);
    var new_bullet = new CCBullet(tankfire.numberID, this.count_Bullet);

    new_bullet.setMoveDir(gocban, diembanbandau);
    this.listArrBullet[new_bullet.numberID] = new_bullet;
}

CCRoom.prototype.getAllObstacbesAroundMe = function (x, y) {
    var p2unit = MapConvertUnit(x, y);// convert thanh vi tri don vi 0-99
    var arrIndexArrount = getMapAround(p2unit);//lay ra cac don vi xung quanh no
    var maxIAr = arrIndexArrount.length;
    var AllObjectRT = [];
    for (var ir = 0; ir < maxIAr; ir++) {
        var indexOfU = arrIndexArrount[ir];// lay ra thu tu cua array unit
        var groupUnit = this.listArrUnit[indexOfU];// lay ra tu group va add no vao allObject ==> get the zone
        var maxLUnit = groupUnit.length;
        for (var iu = 0; iu < maxLUnit; iu++) {
            AllObjectRT.push(groupUnit[iu]);
        }
    }
    return AllObjectRT;
}

module.exports = CCRoom;