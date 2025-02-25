
const CoreTypes = require('src/GameTypes/CoreTypes');
const UIDGenerator = require('src/core/UIDGenerator').UIDGenerator;
const TilingSprite = require('src/GameTypes/TilingSprite');


/**
 * @constructor Projectile
 */
const Projectile = function(position, dimensions, texture, damage) {
	this._UID = UIDGenerator.newUID();
	this.dimensions = dimensions;
	this.spriteObj = this.getSprite(position, texture);
	this.spriteObj.damage = damage;
}
Projectile.prototype = {};

Projectile.prototype.getSprite = function(position, texture) {
	const sprite = new TilingSprite(
		this._UID,
		new CoreTypes.Point(0, 0),
		this.dimensions,
		texture
	);
	sprite.spriteObj.name = 'fireballSprite';
	sprite.spriteObj.anchor.set(0.5);
	sprite.spriteObj.x = position.x.value;
	sprite.spriteObj.y = position.y.value;
	
	return sprite.spriteObj;
}











module.exports = Projectile;