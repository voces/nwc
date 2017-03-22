
const LayerObject = require( "../index" );

class Entity extends LayerObject {

	constructor() {

		super();

	}

}

console.log( LayerObject );

let o = new Entity( );
o.x = 12;

Object.defineProperty( o, "y", { value: 6, enumerable: true, configurable: true, writable: true } );

// predict = true;
LayerObject.layer = 1;

Object.defineProperty( o, "z", { value: 3, enumerable: true, configurable: true, writable: true } );

LayerObject.layer = 0;
// predict = false;

console.log( o, o.x, o.y, o.z );

LayerObject.layer = 1;
// predict = true;

console.log( o, o.x, o.y, o.z );

console.log( o instanceof LayerObject, o instanceof Entity );

// console.log( Object.getOwnPropertyNames( o.__below.__above ), Object.getOwnPropertyNames( o.__below ) );

LayerObject.layer = 2;

o.x = 4;

console.log( "===== Last =====" );
console.log( o );
console.log( o.__layer );
console.log( o.__layers );
