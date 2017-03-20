
const Mesh = require( "./Mesh" );

class BoxMesh extends Mesh {

	constructor( { width = 1, height = width || 1, depth = width || 1 } = {} ) {

		super();

		Object.assign( this, { width, height, depth } );

	}

}

module.exports = BoxMesh;
