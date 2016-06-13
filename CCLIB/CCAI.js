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


module.exports = CCAI;