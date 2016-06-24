/**
 * Created by giangngo on 6/14/2016.
 */

module.exports = {

    calcAngle: function (sourcePos, targetPos) {
        var dy = targetPos.y - sourcePos.y;
        var dx = targetPos.x - sourcePos.x;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        if (theta < 0) {
            theta = 360 + theta;
        } // range [0, 360)
        return theta;
    },

    distace2Object: function (obj1, obj2) {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
    },


    lineRectIntersec: function (x1, y1, x2, y2, x, y, w, h) {
        var test1 = lineIntersect(x1, y1, x2, y2, x - w / 2, y - h / 2, x - w / 2, y + h / 2);
        var test2 = lineIntersect(x1, y1, x2, y2, x - w / 2, y - h / 2, x + w / 2, y - h / 2);
        var test3 = lineIntersect(x1, y1, x2, y2, x - w / 2, y + h / 2, x + w / 2, y + h / 2);
        var test4 = lineIntersect(x1, y1, x2, y2, x + w / 2, y + h / 2, x + w / 2, y - h / 2);
        return (test1 || test2 || test3 || test4);
    }
};


function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (x === undefined || y === undefined) {
        return false;
    } else {
        if (x1 >= x2) {
            if (!(x2 <= x && x <= x1)) {
                return false;
            }
        } else {
            if (!(x1 <= x && x <= x2)) {
                return false;
            }
        }
        if (y1 >= y2) {
            if (!(y2 <= y && y <= y1)) {
                return false;
            }
        } else {
            if (!(y1 <= y && y <= y2)) {
                return false;
            }
        }
        if (x3 >= x4) {
            if (!(x4 <= x && x <= x3)) {
                return false;
            }
        } else {
            if (!(x3 <= x && x <= x4)) {
                return false;
            }
        }
        if (y3 >= y4) {
            if (!(y4 <= y && y <= y3)) {
                return false;
            }
        } else {
            if (!(y3 <= y && y <= y4)) {
                return false;
            }
        }
    }
    return true;
}


