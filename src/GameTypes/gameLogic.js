/**
 * @ruleSet
 * 
 */

const CoreTypes = require('src/GameTypes/CoreTypes');
const gameConstants = require('src/GameTypes/gameConstants');
const {windowSize, cellSize, gridCoords, occupiedCells, getFoeCell, getRandomFoe} = require('src/GameTypes/gridManager');

const ExplosionSprite = require('src/GameTypes/ExplosionSprite');
const LootSprite = require('src/GameTypes/LootSprite');

const Tween = require('src/GameTypes/Tween');
const TileToggleTween = require('src/GameTypes/TileToggleTween');

const mainSpaceShipCollisionTester = require('src/GameTypes/mainSpaceShipCollisionTester');





const GameRule = function(targetName, action, params, type) {
	this.targetName = targetName;
	this.action = action;
	this.params = params;
	this.type = type;
}
 
const ruleSet = {
	testOutOfScreen : [
		new GameRule('foeSpaceShipSprite', 'trigger', ['foeSpaceShipOutOfScreen', 'target']),
		new GameRule('mainSpaceShipSprite', 'trigger', ['mainSpaceShipOutOfScreen', 'target']),
		new GameRule('fireballSprite', 'trigger', ['fireballOutOfScreen', 'target'])
	],
	mainSpaceShipTestCollision : [
		new GameRule('lootSprite', 'trigger', ['mainSpaceShipPowerUp',  'mainSpaceShipSprite', 'referenceObj'], 'powerUp'),
		new GameRule('mainSpaceShipSprite', 'trigger', ['mainSpaceShipDamaged', 'mainSpaceShipSprite', 'referenceObj'], 'hostile')
		
	],
	foeSpaceShipTestCollision : [new GameRule('foeSpaceShipSprite', 'trigger', ['foeSpaceShipDamaged', 'fireballSprite', 'referenceObj'])],
}

const handleFoeSpaceShipDamaged = function(
		gameLoop,
		foeSpaceShipsRegister,
		foeSpaceShipsTweensRegister,
		fireballsRegister,
		fireballsTweensRegister,
		damagedFoeSpaceShip,
		explodedFireball,
		mainSpaceShipSprite,
		loadedAssets
	) {
	
	if (damagedFoeSpaceShip.hasShield) {
		activateShield(
			gameLoop,
			{
				x : damagedFoeSpaceShip.x,
				y : damagedFoeSpaceShip.y,
				width : 0,
				height : 0
			},
			loadedAssets
		);
	}

	damagedFoeSpaceShip.lifePoints -= explodedFireball.damage;
	
	createSmallExplosion(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	);
	
	if (damagedFoeSpaceShip.lifePoints === 0)
		 handleFoeSpaceShipDestroyed(
			 gameLoop,
			foeSpaceShipsRegister,
			foeSpaceShipsTweensRegister,
			fireballsRegister,
			fireballsTweensRegister,
			damagedFoeSpaceShip,
			explodedFireball,
			mainSpaceShipSprite,
			loadedAssets
		);
	
	removeFireBallFromStage(
		gameLoop,
		fireballsRegister,
		fireballsTweensRegister,
		explodedFireball
	)
}

const handleFoeSpaceShipDestroyed = function(
		gameLoop,
		foeSpaceShipsRegister,
		foeSpaceShipsTweensRegister,
		fireballsRegister,
		fireballsTweensRegister,
		damagedFoeSpaceShip,
		explodedFireball,
		mainSpaceShipSprite,
		loadedAssets
	) {
	
	createGreenExplosion(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	);
	
	// foeSpaceShipSprite removal from the gameLoop & scene
	let spritePos = foeSpaceShipsRegister.indexOf(damagedFoeSpaceShip);
	foeSpaceShipsRegister.splice(spritePos, 1);
	gameLoop.removeTween(foeSpaceShipsTweensRegister[spritePos]);
	foeSpaceShipsTweensRegister.splice(spritePos, 1);
	
	spritePos = gameLoop.stage.children.indexOf(damagedFoeSpaceShip);
	gameLoop.stage.children.splice(spritePos, 1);
	
	if (Math.random() <= damagedFoeSpaceShip.lootChance) {
		handleLoot(
			gameLoop,
			damagedFoeSpaceShip,
			mainSpaceShipSprite,
			loadedAssets
		);
	}
	
	// prepare to load more foeSpaceShips
	occupiedCells[damagedFoeSpaceShip.cell.x][damagedFoeSpaceShip.cell.y] = false;
	
	gameLoop.trigger('foeSpaceShipDestroyed');
}

const removeFireBallFromStage = function(
		gameLoop,
		fireballsRegister,
		fireballsTweensRegister,
		explodedFireball
	) {
	let spritePos = fireballsRegister.indexOf(explodedFireball);
	fireballsRegister.splice(spritePos, 1);
	gameLoop.removeTween(fireballsTweensRegister[spritePos]);
	fireballsTweensRegister.splice(spritePos, 1);
	
	spritePos = gameLoop.stage.children.indexOf(explodedFireball);
	gameLoop.stage.children.splice(spritePos, 1);
}

const handleLoot = function(
		gameLoop,
		damagedFoeSpaceShip,
		mainSpaceShipSprite,
		loadedAssets
	) {
	
	const lootSprite = createLoot(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	);
	
	const mainSpaceShipCollisionTest = new mainSpaceShipCollisionTester(mainSpaceShipSprite, lootSprite, 'powerUp');
	gameLoop.pushCollisionTest(mainSpaceShipCollisionTest);
}



const handleMainSpaceShipDamaged = function(
		gameLoop,
		damagedMainSpaceShip,
		loadedAssets,
		statusBarSprite,
		currentLevelText
	) {
		
	damagedMainSpaceShip.lifePoints--;
	statusBarSprite.tilePosition.x -= 470;

	activateShield(
		gameLoop,
		damagedMainSpaceShip,
		loadedAssets
	);

	createSmallExplosion(
		gameLoop,
		{
			x : damagedMainSpaceShip.x + damagedMainSpaceShip.width / 2,
			y : damagedMainSpaceShip.y + damagedMainSpaceShip.height / 1.8,
			width : damagedMainSpaceShip.width / 2,
			height : 0
		},
		loadedAssets
	);
	
	if (damagedMainSpaceShip.lifePoints === 0)
		 handleMainSpaceShipDestroyed(
			gameLoop,
			damagedMainSpaceShip,
			loadedAssets,
			statusBarSprite,
			currentLevelText
		);
}



const handleMainSpaceShipDestroyed = function(
		gameLoop,
		damagedMainSpaceShip,
		loadedAssets,
		statusBarSprite,
		currentLevelText
	) {
	// damagedMainSpaceShip removal from the gameLoop & scene
	let spritePos = gameLoop.stage.children.indexOf(damagedMainSpaceShip);
	gameLoop.stage.children.splice(spritePos, 1);
	spritePos = gameLoop.stage.children.indexOf(statusBarSprite);
	gameLoop.stage.children.splice(spritePos, 1);
	spritePos = gameLoop.stage.children.indexOf(currentLevelText);
	gameLoop.stage.children.splice(spritePos, 1);
	
	createYellowExplosion(
		gameLoop,
		damagedMainSpaceShip,
		loadedAssets
	);
}

const handlePowerUp = function(
		gameState,
		gameLoop,
		lootSprite,
		mainSpaceShipSprite,
		statusBarSprite
	) {
	
	const tween = CoreTypes.disposableTweensRegister.findObjectByValue('lootSprite', lootSprite).lootTween;
	gameLoop.removeTween(tween);
	const spritePos = gameLoop.stage.children.indexOf(lootSprite);
	gameLoop.stage.children.splice(spritePos, 1);
	
	
	switch(lootSprite.lootType) {
		case 'medikit':
			if (mainSpaceShipSprite.lifePoints < gameConstants.mainSpaceShipLifePoints[gameState.currentLevel]) {
				mainSpaceShipSprite.lifePoints++;
				statusBarSprite.tilePosition.x += 470;
			}
			break;
		default:
			break;
	}
}


const handleFoeSpaceShipOutOfScreen = function(
		gameLoop,
		spaceShipSprite,
		foeSpaceShipsRegister,
		foeSpaceShipsTweensRegister
	) {
	let spritePos = foeSpaceShipsRegister.indexOf(spaceShipSprite);
	foeSpaceShipsRegister.splice(spritePos, 1);
	gameLoop.removeTween(foeSpaceShipsTweensRegister[spritePos]);
	foeSpaceShipsTweensRegister.splice(spritePos, 1);
	
	spritePos = gameLoop.stage.children.indexOf(spaceShipSprite);
	gameLoop.stage.children.splice(spritePos, 1);
}



const handleFireballOutOfScreen = function(
		gameLoop,
		fireballSprite,
		fireballsRegister,
		fireballsTweensRegister
	) {
	let spritePos = fireballsRegister.indexOf(fireballSprite);
	fireballsRegister.splice(spritePos, 1);
	gameLoop.removeTween(fireballsTweensRegister[spritePos]);
	fireballsTweensRegister.splice(spritePos, 1);
	
	spritePos = gameLoop.stage.children.indexOf(fireballSprite);
	gameLoop.stage.children.splice(spritePos, 1);
}



const handleDisposableSpriteAnimationEnded = function(gameLoop, sprite) {
	let spritePos = CoreTypes.disposableSpritesRegister.indexOf(sprite);
	CoreTypes.disposableSpritesRegister.splice(spritePos, 1);
	
	spritePos = gameLoop.stage.children.indexOf(sprite);
	gameLoop.stage.children.splice(spritePos, 1);
}



const createSmallExplosion = function(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	) {
	const explosionDimensions = new CoreTypes.Dimension(32, 32);
	const startPosition = new CoreTypes.Point(
		damagedFoeSpaceShip.x + getRandomExplosionOffset(damagedFoeSpaceShip.width),		// ExplosionSprite has a 0.5 anchor
		damagedFoeSpaceShip.y + damagedFoeSpaceShip.height - getRandomExplosionOffset(damagedFoeSpaceShip.height) - 84								// WARNING: magic number : the mainSpaceShip's sprite doesn't occupy the whole height of its container
	);
	const explosion = new ExplosionSprite(
		startPosition,
		explosionDimensions,
		loadedAssets[2].impactTilemap,
	);
	const explosionTween = new TileToggleTween(
		windowSize,
		explosion.spriteObj,
		CoreTypes.TweenTypes.add,
		new CoreTypes.Point(0, 32),
		1,
		false,
		4,
		30,
		'invert',
		true
	);
	gameLoop.pushTween(explosionTween);
	gameLoop.stage.addChild(explosion.spriteObj);
	CoreTypes.disposableSpritesRegister.push(explosion.spriteObj);
}

const createGreenExplosion = function(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	) {
	const explosionDimensions = new CoreTypes.Dimension(64, 64);
	const startPosition = new CoreTypes.Point(
		damagedFoeSpaceShip.x + getRandomExplosionOffset(damagedFoeSpaceShip.width / 4),		// ExplosionSprite has a 0.5 anchor
		damagedFoeSpaceShip.y - getRandomExplosionOffset(damagedFoeSpaceShip.height / 8)
	);
	
	const explosion = new ExplosionSprite(
		startPosition,
		explosionDimensions,
		loadedAssets[2].greenExplosionTilemap,
	);
	explosion.spriteObj.scale.set(1.5, 1.5);
	const explosionTween = new TileToggleTween(
		windowSize,
		explosion.spriteObj,
		CoreTypes.TweenTypes.add,
		new CoreTypes.Point(64, 0),
		1,
		false,
		12,
		7,
		'invert',
		true
	);
	gameLoop.pushTween(explosionTween);
	gameLoop.stage.addChild(explosion.spriteObj);
	CoreTypes.disposableSpritesRegister.push(explosion.spriteObj);
}

const createYellowExplosion = function(
		gameLoop,
		damagedFoeSpaceShip,
		loadedAssets
	) {
	const explosionDimensions = new CoreTypes.Dimension(64, 64);
	const startPosition = new CoreTypes.Point(
		damagedFoeSpaceShip.x + damagedFoeSpaceShip.width / 2 + getRandomExplosionOffset(damagedFoeSpaceShip.width / 4),		// ExplosionSprite has a 0.5 anchor
		damagedFoeSpaceShip.y + damagedFoeSpaceShip.height / 2 - getRandomExplosionOffset(damagedFoeSpaceShip.height / 8)
	);
	
	const explosion = new ExplosionSprite(
		startPosition,
		explosionDimensions,
		loadedAssets[2].yellowExplosionTilemap,
	);
	explosion.spriteObj.scale.set(2, 2);
	const explosionTween = new TileToggleTween(
		windowSize,
		explosion.spriteObj,
		CoreTypes.TweenTypes.add,
		new CoreTypes.Point(64, 0),
		1,
		false,
		12,
		7,
		'invert',
		true
	);
	gameLoop.pushTween(explosionTween);
	gameLoop.stage.addChild(explosion.spriteObj);
	CoreTypes.disposableSpritesRegister.push(explosion.spriteObj);
}


const activateShield = function(
		gameLoop,
		spaceShip,
		loadedAssets
	) {
	
	let shieldDimensions, zoom = 1;
	shieldDimensions = new CoreTypes.Dimension(200, 200);

	const startPosition = new CoreTypes.Point(
		spaceShip.x + spaceShip.width / 2,
		spaceShip.y + spaceShip.height / 2
	);
	const shield = new ExplosionSprite(
		startPosition,
		shieldDimensions,
		loadedAssets[2].shieldTilemap,
	);
	shield.spriteObj.name = 'shieldSprite';
	shield.spriteObj.zoom = zoom;
	
	const shieldTween = new TileToggleTween(
		windowSize,
		shield.spriteObj,
		CoreTypes.TweenTypes.add,
		new CoreTypes.Point(0, 200),
		1,
		false,
		6,
		15,
		'invert',
		true
	);
	gameLoop.pushTween(shieldTween);
	gameLoop.stage.addChild(shield.spriteObj);
	CoreTypes.disposableSpritesRegister.push(shield.spriteObj);
}

const createLoot = function(
		gameLoop,
		foeSpaceShip,
		loadedAssets
	) {
	
	const lootType = gameConstants.lootSpritesTextures[getRandomLootType()];
	
	let lootDimensions = new CoreTypes.Dimension(64, 64);
	const startPosition = new CoreTypes.Point(
		foeSpaceShip.x,
		foeSpaceShip.y
	);
	const loot = new LootSprite(
		startPosition,
		lootDimensions,
		loadedAssets[2][lootType + 'Tilemap'],
		lootType
	);
	
	const lootTween = new Tween(
		windowSize,
		loot.spriteObj,
		CoreTypes.TweenTypes.add,
		new CoreTypes.Point(0, 7),
		.1
	);
	gameLoop.pushTween(lootTween);
	gameLoop.stage.addChild(loot.spriteObj);
	
	CoreTypes.disposableTweensRegister.push({
		lootSprite : loot.spriteObj,
		lootTween : lootTween
	});
	
	return loot.spriteObj;
}





const shouldChangeLevel = function (gameState, foeSpaceShipsRegister, currentLevelText, addFoeSpaceShips) {
	if (foeSpaceShipsRegister.length === 1 && gameState.currentLevel < 6) {
		gameState.currentLevel++;
		currentLevelText.text = gameState.currentLevel;
		addFoeSpaceShips();
	}
}


function getRandomLootType() {
	return Math.floor(Math.random() * .9); // shall be Math.floor(Math.random() * lootTypesCount)
}

function getRandomExplosionOffset(shipDimension) {
	return Math.round((Math.random() - .5) * shipDimension / 2);
}





module.exports = {
	ruleSet,
	handleFoeSpaceShipDamaged,
	handleFoeSpaceShipOutOfScreen,
	handleMainSpaceShipDamaged,
	handleFireballOutOfScreen,
	handleDisposableSpriteAnimationEnded,
	shouldChangeLevel,
	handlePowerUp
};