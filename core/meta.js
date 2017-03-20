
const Entity = require( "./Entity" ),
	networkProperty = require( "./networkProperty" );

class Meta extends Entity {

	constructor() {

		super();

		Object.defineProperties( this, {
			time: {
				enumerable: true,
				get: () => networkProperty.time,
				set: value => networkProperty.time = value
			},
			// seed: {
			// 	enumerable: true,
			// 	get: () => networkProperty.seed,
			// 	set: value => networkProperty.seed = value
			// },
			predicting: {
				enumerable: true,
				get: () => networkProperty.predicting || undefined,
				set: value => networkProperty.predicting = value
			},
			entityId: {
				enumerable: true,
				get: () => Entity._id,
				set: value => Entity._id = value
			}
		} );

	}

}

Entity.registerClass( Meta );

module.exports = new Meta();
