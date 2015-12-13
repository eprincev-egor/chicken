define([
"funcs",
"jquery"
], function(f, $) {
    "use strict";

    var Chicken = f.CreateClass("Chicken", {});
    var COLOR_MAIN = "#fbd84a",
        COLOR_FOOTS = "#ff9933";

    Chicken.prototype.init = function() {
        this.x = f.getWindowSize().width / 10;
        this.y = 142;
        this.r = 30;
        this.coeff = 1;
        this.step = 0.1;
        this.vector = 1;

        this.wingCoeff = 1;
        this.wingStep = 0.3;
        this.wingVector = 1;
    };

    Chicken.prototype.getCollisionCircles = function() {
        var x = this.x,
            r = this.r,
            y = this.y - r * 1.65;

        return [
            // голова
            {x: x, y: y - r, collisionRadius: r * 0.7},
            // тело
            {x: x, y: y, collisionRadius: r},
            // ноги
            {x: x, y: y + r*1.3, collisionRadius: r * 0.7}
        ];
    };

    Chicken.prototype.draw = function(ctx) {
        var x = this.x,
            y = this.y,
            r = this.r,
            coeff = this.coeff,
            wingCoeff = this.wingCoeff;

        ctx.save();
        ctx.translate(0, -r * 1.65);

        // крыло на заднем плане
        ctx.beginPath();
        ctx.strokeStyle = COLOR_FOOTS;
        ctx.fillStyle = COLOR_MAIN;
        ctx.lineWidth = 2;
        ctx.moveTo(x - r / 4, y - r / 2);
        ctx.bezierCurveTo(
            x + r, y - r/3,
            x + r * wingCoeff, y + r / 4,
            x - r * 1.6 - r * coeff * 0.2, y + r * 0.6 * wingCoeff
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // тело
        ctx.beginPath();
        ctx.fillStyle = COLOR_MAIN;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // голова
        ctx.beginPath();
        ctx.arc(x, y - r, r * 0.7, -Math.PI, Math.PI);
        ctx.closePath();
        ctx.fill();

        // клюв
        ctx.beginPath();
        ctx.fillStyle = COLOR_FOOTS;
        ctx.beginPath();
        ctx.moveTo(x + r - r/2, y - r - r/2);
        ctx.lineTo(x + r, y - r - r/3);
        ctx.lineTo(x + r * 0.7, y - r);
        ctx.closePath();
        ctx.fill();

        // глаз
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.arc(x + r * 0.2, y - r * 1.3, r * 0.2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // зрачок
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.arc(x + r * 0.3, y - r * 1.3, r * 0.1, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // левая нога
        ctx.beginPath();
        ctx.strokeStyle = COLOR_FOOTS;
        ctx.lineWidth = r/4;
        ctx.moveTo(x - r * 0.4, y + r * 0.9);
        ctx.lineTo(x - coeff * r / 2, y + r * 1.65);
        ctx.closePath();
        ctx.stroke();

        // правая нога
        ctx.beginPath();
        ctx.strokeStyle = COLOR_FOOTS;
        ctx.lineWidth = r/4;
        ctx.moveTo(x + r * 0.4, y + r * 0.9);
        ctx.lineTo(x + coeff * r / 2, y + r * 1.65);
        ctx.closePath();
        ctx.stroke();

        // крыло на переднем плане
        ctx.beginPath();
        ctx.strokeStyle = COLOR_FOOTS;
        ctx.fillStyle = COLOR_MAIN;
        ctx.lineWidth = 2;
        ctx.moveTo(x - r / 4, y - r / 2);
        ctx.bezierCurveTo(
            x + r, y - r/3,
            x + r * wingCoeff, y + r / 4,
            x - r * 1.2 + r * coeff * 0.2, y + r * 0.8 * wingCoeff
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    };

    Chicken.prototype.go = function() {
        this._go = true;
        this.coeff += this.step * this.vector;

        if ( this.coeff > 1 || this.coeff < -1 ) {
            this.vector *= -1;
        }
    };

    Chicken.prototype.stop = function() {
        this._go = false;
        this.coeff = 1;
    };

    Chicken.prototype.flitter = function() {
        this._wing = true;
        this.wingCoeff += this.wingStep * this.wingVector;

        if ( this.wingCoeff > 1 || this.wingCoeff < -1 ) {
            this.wingVector *= -1;
        }
    };

    Chicken.prototype.stopFlitter = function() {
        this._wing = false;
        this.wingCoeff = 1;
    };

    return Chicken;
});
