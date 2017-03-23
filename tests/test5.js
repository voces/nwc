
const LayerObject = require( "../index" );

class Test extends LayerObject.rebase( Array ) {}

const test = new Test( 1, 2 );

LayerObject.layer = 1;
test.push( 3 );
console.log( test.__layers );

LayerObject.layer = 0;
LayerObject.sever( 1 );
console.log( test.__layers );
