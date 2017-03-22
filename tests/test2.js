
const LayerObject = require( "../index" );

class LayerArray extends Array {}

Object.setPrototypeOf( LayerArray, LayerObject );
LayerArray.prototype.toString = Array.prototype.toString;

let a = new LayerArray();

a.push( 0, 1 );

console.log( "push( 0, 1 ); length:", a.length );

LayerObject.layer = 1;

console.log( "layer = 1; length:", a.length );

a.push( 2 );

console.log( "push( 2 ); a:", a );

LayerObject.layer = 0;

console.log( "layer = 0; a:", a );

LayerObject.layer = 1;

a.splice( 0, 2 );

console.log( "splice( 0, 2 ); a:", a );
console.log( "a[ 1 ]:", a[ 1 ] );
console.log( "a[ 2 ]:", a[ 2 ] );

LayerObject.layer = 0;

console.log( "===== Keys =====" );
console.log( Object.keys( a.__layers[ 0 ] ) );
console.log( Object.keys( a.__layers[ 1 ] ) );

console.log( "===== Last =====" );
console.log( a );
console.log( a.__layers );
