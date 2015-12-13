define([
    "funcs",
    "jquery"
], function(f, $) {
    "use strict";

    var Block = f.CreateClass("Block");

    Block.prototype.init = function(img) {
        this.x = 0;
        this.y = 0;
        this.img = img;
        this.width = img.width;
        this.height = img.height;
    };

    Block.prototype.draw = function(ctx) {
        ctx.drawImage(this.img, this.x, this.y);
    };

    return Block;
});
