
const networkProperty = require( "./networkProperty" );

	// hasFirstCapReg = /^[A-Z]/,
	// hasFirstCap = word => hasFirstCapReg.test( word );

// let Entity;
// setImmediate( () => Entity = require( "./Entity" ) );

class NetworkObject {

	constructor() {

		Object.defineProperties( this, {
			defineProperty: { enumerable: false, value: ( ...args ) => networkProperty( this, ...args ) },
			_networkProperties: { enumerable: false, value: {} }
		} );

	}

	//TODO: Use JSONPath to defeat circular references
	state( /*processed = new Map()*/ ) {

		const state = {};

		let empty = true;
		for ( let prop in this ) {

			let value;

			if ( this._networkProperties && this._networkProperties[ prop ] )
				value = this._networkProperties[ prop ].state();
			// else if ( this[ prop ] instanceof Object && this[ prop ] instanceof Entity )
			// 	value = { _class: "Entity", _id: this[ prop ]._id };
			else if ( this[ prop ] instanceof Object && this[ prop ].state instanceof Function )
				value = this[ prop ].state();
			else
				 value = this[ prop ];

			if ( value !== undefined ) {

				state[ prop ] = value;
				empty = false;

			}

			if ( value instanceof Object && value._class === undefined )
				value._class = value.constructor.name;

		}

		// console.log( "\n===== NetworkObject.state() 1 ======" );
		// console.log( this );
		//
		// console.log( "\n===== NetworkObject.state() 2 ======" );
		// // console.log( JSON.stringify( state, null, "  " ) );
		// console.log( state );

		if ( empty ) return undefined;

		return Object.assign( state, { _class: this.constructor.name } );

	}

	sync( state ) {

		for ( let prop in state )
			if ( prop[ 0 ] !== "_" ) {

				if ( this._networkProperties[ prop ] )
					this._networkProperties[ prop ].sync( state[ prop ] );
				else if ( this[ prop ] instanceof Object && this[ prop ].sync instanceof Function )
					this[ prop ].sync( state[ prop ] );
				else
					this[ prop ] = state[ prop ];

			}

	}

}

Object.defineProperties( NetworkObject, {
	defineProperty: { value: ( ...args ) => networkProperty( ...args ) }
} );

module.exports = NetworkObject;
