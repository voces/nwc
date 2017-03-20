
const networkProperty = require( "./networkProperty" ),
	NetworkObject = require( "./NetworkObject" );

class Entity extends NetworkObject {

	constructor( props = {}, _id ) {

		super();

		//This check is only helpful during development; shouldn't be dependend upon to protect you!
		if ( ! Entity._classes.has( this.constructor.name ) )
			throw new Error( `Class '${this.constructor.name}' extending Entity unknown to Entity! Register the class with 'Entity.registerClass( ${this.constructor.name} )'.` );

		//Hidden variables
		let predictions = 0;

		//Object-level properties
		Object.defineProperties( this, {
			_id: { value: _id || ++ Entity._id, enumerable: true },
			// _class: { value: this.constructor.name, enumerable: true },
			_predictions: {
				get: () => predictions,
				set: value => {

					if ( Math.abs( predictions - value ) <= 1 ) return predictions = value;
					else throw new Error( "Prdiction count should only change by one!" );

				} },
			_predicting: { get: () => predictions > 0 }
		} );

		//Add the new entity to our lists
		if ( networkProperty.predicting ) Entity._predictedInstances.push( this );
		else Entity.instances.push( this );

		//Create the entities' components
		for ( let i = 0; i < this.constructor._components.length; i ++ )
			new this.constructor._components[ i ]( this, props[ this.constructor._components[ i ].name ] );

		this.sync( props );

	}

	static with( ...components ) {

		//A fresh class based on Entity
		const entityClass = class extends Entity {};

		for ( let i = 0; i < components.length; i ++ ) {

			//Conflicts is DIRTY
			//	TODO: make conflict resolution solved by looking at overlapping network properties
			//	NOTE: conflicts from above solution likely hit during development anyways
			if ( components[ i ].conflicts )
				for ( let n = 0; n < components[ i ].conflicts.length; n ++ ) {

					let conflict = components.find( components[ i ].conflicts[ n ] );

					if ( conflict )
						throw `Component ${components[ i ].conflicts[ n ]} conflicts with ${conflict.constructor.name}`;

				}

			//This one makes sense :)
			if ( components[ i ].requires )
				for ( let n = 0; n < components[ i ].requires.length; n ++ )
					if ( ! components.includes( components[ i ].requires[ n ] ) )
						components.push( components[ i ].requires[ n ] );

		}

		Object.defineProperty( entityClass, "_components", {
			get: () => components
		} );

		return entityClass;

	}

	static state( filter ) {

		if ( filter ) return Entity.instances.filter( filter ).map( entity => entity.state() );
		return Entity.instances.map( entity => entity.state() );

	}

	static sync( ...entities ) {

		// console.log( "\n===== Entity.sync() ======" );
		// console.log( entities );

		for ( let i = 0; i < entities.length; i ++ )
			if ( Entity.instances[ entities[ i ]._id ] !== undefined )
				Entity.instances[ entities[ i ]._id ].sync( entities[ i ] );
			else
				new ( Entity._classes.get( entities[ i ]._class ) )( entities[ i ] )/*.sync( entities[ i ] )*/;

	}

	static registerClass( myClass ) {

		if ( Entity._classes.has( myClass.name ) )
			throw new Error( "Class name '${myClass.name}' already registered with Entity!" );

		Entity._classes.set( myClass.name, myClass );

		return myClass;

	}

}

Entity._id = - 1;

Object.defineProperties( Entity, {
	with: { configurable: false, writable: false },
	state: { configurable: false, writable: false },
	sync: { configurable: false, writable: false },
	registerClass: { configurable: false, writable: false },

	instances: { value: [] },
	_predictedInstances: { value: [] },
	_classes: { value: new Map() },
	_components: { value: [] }
} );

module.exports = Entity;

require( "./meta" );
