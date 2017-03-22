
const LayerObject = require( "../index" );

class Test extends LayerObject.rebase( Array ) {}
class Test2 extends LayerObject {}

const test = new Test( 1, 2 );
const test2 = new Test2( );

console.log( test.concat( [ 3 ] ) );

LayerObject.layer = 1;

test.push( 3 );

console.log( test );

LayerObject.layer = 0;

console.log( test );

LayerObject.layer = 1;

console.log( test.concat( [ 4 ] ) );

LayerObject.layer = 0;

console.log( test.concat( [ 3 ] ) );

console.log( "=========" );

console.log( Test );
console.log( test );
console.log( test.__layers );

console.log( "=========" );

console.log( Test2 );
console.log( test2 );
console.log( test2.__layers );

console.log( "=========" );

console.log( Test.rebase );
console.log( Test2.rebase );
