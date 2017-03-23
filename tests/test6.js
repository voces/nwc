
const LayerObject = require( "../index" );

class Test extends LayerObject.rebase( Array ) {}

const test = new Test( 1, 2 );

LayerObject.layer = 1;
test.push( 3 );
console.log( test.__layers );

delete test[ 2 ];
console.log( test.__layers, test.__layers[ 1 ][ 2 ] === LayerObject.DELETED );
setImmediate( () => console.log( test.__layers ) );
