
const NetworkObject = require( "./NetworkObject" );

class Component extends NetworkObject {

	constructor( entity/*, props = {}*/ ) {

		super();

		const entityDescriptors = this.constructor.entityDescriptors;

		entity[ this.constructor.name ] = this;

		if ( entityDescriptors )
			Object.defineProperties( entity,
				Object.entries( Object.getOwnPropertyDescriptors( this.constructor.prototype ) )
					.filter( ( [ name ] ) => entityDescriptors.includes( name ) )
					.reduce( ( descriptors, [ descriptorName, descriptor ] ) =>
						Object.assign( descriptors, { [ descriptorName ]: descriptor } ), {} ) );

	}

	static get requires() {

		return [];

	}

	static get conflicts() {

		return [];

	}

}

module.exports = Component;
