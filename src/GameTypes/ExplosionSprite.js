

const CoreTypes = require('src/GameTypes/CoreTypes');
const UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;
const Sprite = require('src/GameTypes/Sprite');
const TilingSprite = require('src/GameTypes/TilingSprite');


/**
 * @constructor ExplosionSprite
 * 
 */
 const ExplosionSprite = function(position, dimensions, texture) {
	 this._UID = UIDGenerator.newUID();
	 this.dimensions = dimensions;
	 this.spriteObj = this.getSprite(position, texture);
 }
 ExplosionSprite.prototype = {};
 
 ExplosionSprite.prototype.getSprite = function(position, texture) {
	const sprite = new TilingSprite(
		this._UID,
		new CoreTypes.Point(0, 0),
		this.dimensions,
		texture
	);
	sprite.spriteObj.anchor.set(0.5);
	sprite.spriteObj.name = 'explosionSprite';
	sprite.spriteObj.x = position.x.value;
	sprite.spriteObj.y = position.y.value;
	
	return sprite.spriteObj;
 }

 
 
 
 
 module.exports = ExplosionSprite;