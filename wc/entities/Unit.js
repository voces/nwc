
const Entity = require.main.require( "./core/Entity" ),

	Mobility = require.main.require( "./wc/components/Mobility" );

class Unit extends Entity.with( Mobility ) {

	constructor( props = {} ) {

		super( props );

	}

	static defaults( props ) {

		if ( props.scale === undefined ) props.scale = 1;

	}

}

Object.defineProperties( Unit, {
	all: { get: () => Entity.instances.filter( e => e instanceof Unit ) }
} );

// NOTE: normally we have to register entities, but they are lazily registered in index.js
// Entity.registerClass( Unit );

module.exports = Unit;
