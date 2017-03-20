
const Unit = require( "./Unit" ),

	BoxMesh = require.main.require( "./wc/meshes/BoxMesh" );

class BoxUnit extends Unit {

	constructor( props = {} ) {

		BoxUnit.defaults( props );

		super( props );

	}

	static defaults( props ) {

		super.defaults( props );

		if ( props.Model === undefined ) props.Model = {};
		props.Model.mesh = new BoxMesh( { width: 1 * props.scale } );

	}

}

module.exports = BoxUnit;
