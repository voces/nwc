
// NOTE: NetworkObject offers sequential, non-collapsing prediction
//		 Sequential means each prediction builds off previous predictions
//		 Non-collapsing means previous predictions do not collapse latter predictions

// const Alea = require("alea");

let layer = 0, useOffset = false, layerOffset = 0;

const DELETED = "!__DELETED__!!",
	EMPTY_PROP_FUNC = { value: () => {} };

function layerConstructor( SubClass, top ) {

	Object.setPrototypeOf( this, SubClass.prototype );

	Object.defineProperty( this, "__layer", { value: layer, configurable: true } );
	Object.defineProperty( this, "__above", { value: undefined, configurable: true } );
	Object.defineProperty( this, "__deleted", EMPTY_PROP_FUNC );

	if ( top ) {

		Object.defineProperty( top, "__above", { value: this, configurable: true } );
		Object.defineProperty( this, "__below", { value: top, configurable: true } );

	} else {

		Object.defineProperty( this, "__below", { value: undefined, configurable: true } );

	}

	if ( this instanceof Array && top )
		this.length = top.length;

}

function Layer( BaseClass ) {

	const NewClass = new Proxy( class extends BaseClass {

		constructor( SubClass, top, argumentsList ) {

			super( ...( argumentsList || [] ) );

			layerConstructor.apply( this, [ SubClass, top ] );

		}

	}, {

		construct: ( Layer, argumentsList, SubClass ) => {

			let top = new Layer( SubClass, undefined, argumentsList ),
				isDeleteDirty = false;

			Object.defineProperty( top, "__layers", { get: () => layers } );

			const layers = { 0: top },

			 	p = new Proxy( layers[ 0 ], {
		 			set: ( target, property, value ) => {

						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						myLayer[ property ] = value;

						while ( myLayer = myLayer.__above )
							if ( myLayer.__layer < layer )
								delete myLayer[ property ];

						return true;

					},

		 			get: ( target, property ) => {

						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						if ( property in myLayer ) {

							const value = myLayer[ property ];

							if ( value === DELETED ) return undefined;
							return value;

						}

						while ( myLayer = myLayer.__below )
							if ( property in myLayer ) {

								const value = myLayer[ property ];
								if ( value === DELETED ) return undefined;
								return value;

							}

					},

		 			defineProperty: ( target, property, descriptor ) => {

						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						const result = Object.defineProperty( myLayer, property, descriptor );

						while ( myLayer = myLayer.__above )
							if ( myLayer.__layer < layer )
								Object.deleteProperty( myLayer, property );

						return result;

					},

					//Do I need to somehow merge the prototypes? Would that break equality checks?
		 			getPrototypeOf: () => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						return Object.getPrototypeOf( myLayer );

					},

		 			setPrototypeOf: ( target, prototype ) => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						Object.setPrototypeOf( myLayer, prototype );

					},

		 			isExtensible: () => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						return Object.isExtensible( myLayer );

					},

		 			preventExtensions: () => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						return Object.preventExtensions( myLayer );

					},

		 			getOwnPropertyDescriptor: ( target, property ) => {

						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						if ( property in myLayer )
							return Object.getOwnPropertyDescriptor( myLayer, property );

						while ( myLayer = myLayer.__below )
							if ( property in myLayer )
								return Object.getOwnPropertyDescriptor( myLayer, property );

					},

		 			has: ( target, property ) => {

						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						if ( property in myLayer ) return true;

						while ( myLayer = myLayer.__below )
							if ( property in myLayer ) return true;

						return false;

					},

		 			deleteProperty: ( target, property ) => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						// const result = delete myLayer[ property ];
						if ( myLayer.__layer === 0 ) delete myLayer[ property ];
						else {

							myLayer[ property ] = DELETED;
							isDeleteDirty = true;

						}

						let workingLayer = myLayer;
						while ( workingLayer = workingLayer.__above )
							if ( workingLayer.__layer < layer )
								delete workingLayer[ property ];

						return true;

					},

		 			ownKeys: () => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						const keys = Object.keys( layers[ 0 ] );

						let workingLayer = layers[ 0 ];
						while ( ( workingLayer = workingLayer.__above ) && workingLayer.__below !== myLayer )
							keys.push( ...Object.keys( workingLayer ) );

						keys.push( "__layer", "__above", "__below", "__layers", "__deleted", "length" );

						if ( ! isDeleteDirty )
							return Array.from( new Set( keys ) );

						return Array.from( new Set( keys ) ).filter( key => {

							const descriptor = Object.getOwnPropertyDescriptor( p, key );
							if ( descriptor.get !== undefined ) return true;

							return isNotDeleted( myLayer, key );

						} );

					},
					//Apply recurses into other properties, so no need to trace up or down
		 			apply: ( target, thisArg, argumentsList ) => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						myLayer.apply( thisArg, argumentsList );

					}
		 		} );

			function isNotDeleted( myLayer, property ) {

				if ( property in myLayer )
					return myLayer[ property ] !== DELETED;

				while ( myLayer = myLayer.__below )
					if ( property in myLayer )
						return myLayer[ property ] !== DELETED;

			}

			return p;

		}
	} );

	Object.defineProperties( NewClass, {
		layer: {
			get: () => layer,
			set: value => {

				if ( value === undefined || value === 0 ) {

					layer = 0;
					layerOffset = 0;

				} else {

					layer = value;

					if ( useOffset ) {

						if ( layerOffset !== 0 )
							layer += "-" + layerOffset;

						++ layerOffset;

					}

				}

			}
		},
		offset: {
			get: () => useOffset,
			set: value => useOffset = value ? true : false
		},
		rebase: { value: Layer }
	} );

	return NewClass;

}

const LayerObject = Layer( Object );

module.exports = LayerObject;
