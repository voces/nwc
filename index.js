
// NOTE: NetworkObject offers sequential, non-collapsing prediction
//		 Sequential means each prediction builds off previous predictions
//		 Non-collapsing means previous predictions do not collapse latter predictions

// const Alea = require("alea");

let layer = 0, useOffset = false, layerOffset = 0,

	layerSetsToCheck = [];

const layerSets = {},
	DELETED = {},
	EMPTY_PROP_FUNC = { value: () => {} };

function checkLayerSets() {

	for ( let i = 0, layerSet; layerSet = layerSetsToCheck[ i ]; i ++ )
		if ( layerSet.length === 0 )
			delete layerSets[ layerSet.layer ];

	layerSetsToCheck = [];

}

function Layer( BaseClass ) {

	const NewClass = new Proxy( class extends BaseClass {

		constructor( SubClass, top, argumentsList ) {

			super( ...( argumentsList || [] ) );

			Object.setPrototypeOf( this, SubClass.prototype );

			Object.defineProperty( this, "__layer", { value: layer, configurable: true } );
			Object.defineProperty( this, "__above", { value: undefined, configurable: true } );
			Object.defineProperty( this, "__deleted", EMPTY_PROP_FUNC );

			if ( top ) {

				Object.defineProperty( top, "__above", { value: this, configurable: true } );
				Object.defineProperty( this, "__below", { value: top, configurable: true } );

				Object.defineProperty( this, "__layers", { value: top.__layers } );

			} else
				Object.defineProperty( this, "__below", { value: undefined, configurable: true } );

			if ( this instanceof Array && top )
				this.length = top.length;

			if ( layerSets[ layer ] === undefined ) {

				layerSets[ layer ] = [];
				layerSets[ layer ].layer = layer;

			}

			layerSets[ layer ].push( this );

		}

	}, {

		construct: ( Layer, argumentsList, SubClass ) => {

			let top = new Layer( SubClass, undefined, argumentsList ),
				isDeleteDirty = false,
				layersToCheck = [];

			function isNotDeleted( myLayer, property ) {

				if ( property in myLayer )
					return myLayer[ property ] !== DELETED;

				while ( myLayer = myLayer.__below )
					if ( property in myLayer )
						return myLayer[ property ] !== DELETED;

			}

			function checkLayers( ) {

				skip: for ( let i = 0, myLayer; myLayer = layersToCheck[ i ]; i ++ ) {

					for ( let prop in myLayer )
						if ( Object.getOwnPropertyDescriptor( myLayer, prop ).value !== DELETED )
							continue skip;

					if ( myLayer.__above !== undefined )
						Object.defineProperty( myLayer.__above, "__below", { value: myLayer.__below, configurable: true } );

					if ( myLayer.__below !== undefined )
						Object.defineProperty( myLayer.__below, "__above", { value: myLayer.__above, configurable: true } );

					delete layers[ i ].__layers[ layer ];

					const layerSet = layerSets[ myLayer.__layer ];

					layerSet.splice( layerSet.indexOf( myLayer ), 1 );

					if ( layerSetsToCheck.push( layerSet ) === 1 )
						setImmediate( () => checkLayerSets() );

					layersToCheck = [];

				}

			}

			const layers = { 0: top },

			 	p = new Proxy( layers[ 0 ], {
		 			set: ( target, property, value ) => {

						// TODO: check if I should use SubClass or grab the constructor of the top layer
						let myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						myLayer[ property ] = value;

						while ( myLayer = myLayer.__above )
							if ( myLayer.__layer < layer ) {

								delete myLayer[ property ];
								layersToCheck.push( myLayer );
								if ( layersToCheck.length === 1 )
									setImmediate( () => checkLayers() );

							}

						return true;

					},

		 			get: ( target, property ) => {

						let myLayer = layers[ layer ] || top;

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

						const myLayer = layers[ layer ] || top;

						return Object.getPrototypeOf( myLayer );

					},

		 			setPrototypeOf: ( target, prototype ) => {

						const myLayer = layers[ layer ] || ( top = layers[ layer ] = new Layer( SubClass, top ) );

						Object.setPrototypeOf( myLayer, prototype );

					},

		 			isExtensible: () => {

						const myLayer = layers[ layer ] || top;

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

						let myLayer = layers[ layer ] || top;

						if ( property in myLayer ) return true;

						while ( myLayer = myLayer.__below )
							if ( property in myLayer ) return true;

						return false;

					},

		 			deleteProperty: ( target, property ) => {

						const myLayer = layers[ layer ];

						if ( myLayer === undefined ) return true;

						if ( myLayer.__layer === 0 ) delete myLayer[ property ];
						else {

							myLayer[ property ] = DELETED;
							isDeleteDirty = true;

							layersToCheck.push( myLayer );
							if ( layersToCheck.length === 1 )
								setImmediate( () => checkLayers() );

						}

						let workingLayer = myLayer;
						while ( workingLayer = workingLayer.__above )
							if ( workingLayer.__layer < layer ) {

								workingLayer[ property ] = DELETED;

								layersToCheck.push( myLayer );
								if ( layersToCheck.length === 1 )
									setImmediate( () => checkLayers() );

							}

						return true;

					},

		 			ownKeys: () => {

						const myLayer = layers[ layer ] || top;

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

						const myLayer = layers[ layer ] || top;

						myLayer.apply( thisArg, argumentsList );

					}
		 		} );

			Object.defineProperty( top, "__layers", { value: layers } );

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
		sever: {
			value: layer => {

				if ( layer === 0 )
					throw new Error( "Do not attempt to sever the base layer!" );

				const layers = layerSets[ layer ];

				if ( layers === undefined ) return;

				for ( let i = 0; i < layers.length; i ++ ) {

					if ( layers[ i ].__above !== undefined )
						Object.defineProperty( layers[ i ].__above, "__below", { value: layers[ i ].__below, configurable: true } );

					if ( layers[ i ].__below !== undefined )
						Object.defineProperty( layers[ i ].__below, "__above", { value: layers[ i ].__above, configurable: true } );

					delete layers[ i ].__layers[ layer ];

				}

				delete layerSets[ layer ];

			}
		},
		offset: {
			get: () => useOffset,
			set: value => useOffset = value ? true : false
		},
		rebase: { value: Layer },
		DELETED: { value: DELETED }
	} );

	return NewClass;

}

const LayerObject = Layer( Object );

module.exports = LayerObject;
