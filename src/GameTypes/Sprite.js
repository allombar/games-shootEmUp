const CoreTypes = require('src/GameTypes/CoreTypes');
 
 /**
 * @constructor Sprite
 * @param position {CoreType.Point}
 */
 const Sprite = function(UID, position, dimensions, texture, rotation) {
	if (typeof PIXI === 'undefined') {
		console.warn('The PIXI lib must be present in the global scope of the page');
		return;
	}
	
	this._UID = UID;
	this.spriteObj = PIXI.Sprite.from(texture);
	this.spriteObj._UID = this._UID;
	this.spriteObj.enteredScreen = false;
	 
	position = position || new CoreTypes.Point()
	
	this.spriteObj.rotation = rotation * Math.PI / 180 || 0;
	this.spriteObj.x = position.x.value;
	this.spriteObj.y = position.y.value;
	this.spriteObj.width = dimensions.x.value;
	this.spriteObj.height = dimensions.y.value;
}
Sprite.prototype = {};

 
 
 
module.exports = Sprite;