define([
"funcs",
"jquery"
], function(f, $) {
    "use strict";

    var Egg = f.CreateClass("Egg", {});

    Egg.prototype.init = function() {
        this.x = 300;
        this.y = 300;
        this.r = 15;
        this.collisionRadius = 10;
    };

    Egg.prototype.draw = function(ctx) {
        var x = this.x,
            y = this.y,
            r = this.r;

        ctx.save();
        ctx.translate(-r, 0);
        ctx.fillStyle = "#ffffff";
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
            x + r/7, y - r,
            x + r * 1.9, y - r/6,
            x + r * 1.7, y
        );
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
            x + r/7, y + r,
            x + r * 1.9, y + r/6,
            x + r * 1.7, y - r / 20
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    return Egg;
});
