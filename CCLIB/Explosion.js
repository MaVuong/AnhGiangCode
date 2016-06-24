var CCVector = require('./CCVector');


function Explosion(x, y, hp, id) {
    this.numberID = "" + id;
    this.pos = new CCVector(x,y);
    this.hp = hp;
    this.zoneId = null;
}


module.exports = Explosion;