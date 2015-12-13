define([
     "funcs",
     "jquery"
], function(f, $) {
    "use strict";

    var Cigarette = f.CreateClass("Cigarette", {});

    Cigarette.prototype.init = function() {
         this.x = 100;
         this.y = 100;
         this.width = 32;
         this.height = 5;
         this.collisionRadius = this.width / 2;
         this.burned = 0;

         this.ashStep = 0.1;
         this.ashCoeff = 0;
         this.ashVector = 1;
    };

    Cigarette.prototype.draw = function(ctx) {
        var x = this.x, y = this.y;
        var burnedPx = this.width - this.width / 4;
        burnedPx = Math.min( burnedPx, burnedPx * this.burned / 100 );

        ctx.save();
        ctx.translate(-this.width/2, -this.height/2);
        ctx.lineWidth = this.height;

        // белая часть
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.moveTo(x, y + this.height);
        ctx.lineTo(x + this.width - burnedPx, y + this.height);
        ctx.closePath();
        ctx.stroke();

        // фильтр
        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.moveTo(x, y + this.height);
        ctx.lineTo(x + this.width / 4, y + this.height);
        ctx.closePath();
        ctx.stroke();

        // углоек
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.moveTo(x + this.width - burnedPx, y + this.height);
        ctx.lineTo(x + this.width - burnedPx + this.height / 2, y + this.height);
        ctx.closePath();
        ctx.stroke();

        // пепел
        var ashx;
        if ( this.burned > this.height / 2 ) {
            ctx.beginPath();
            ctx.strokeStyle = "gray";
            ashx = x + this.width - burnedPx + this.height / 2;
            ctx.moveTo(ashx, y + this.height);
            ctx.lineTo(ashx + burnedPx / 2, y + this.height);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();

        // дым
        this.drawSmoke(ctx, x + this.width - burnedPx - this.width / 3);

        this.burned++;
        if ( this.burned >= 100 ) {
            this.burned = 0;
        }
    };

    Cigarette.prototype.drawSmoke = function(ctx, x) {
        var coeff = this.ashCoeff;
        var stepW = this.height;

        this.drawSmokeLine(ctx, x, coeff * stepW);
        this.drawSmokeLine(ctx, x, -1 * coeff * stepW);

        this.ashCoeff += (this.ashStep * this.ashVector);
        if ( this.ashCoeff >= 1 || this.ashCoeff <= -1) {
            this.ashVector *= -1;
        }
    };

    Cigarette.prototype.drawSmokeLine = function(ctx, x, a) {

        ctx.save();
        ctx.strokeStyle = "rgba(175, 175, 175, .7)";
        var stepH = this.height * 2;

        var y = this.y;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
            x - a, y - stepH,
            x + a, y - 2 * stepH,
            x + a /3, y - 3 * stepH
        );
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    };

    return Cigarette;
});
