
const Component = require.main.require( "./core/Component" ),

	BoxMesh = require.main.require( "./wc/meshes/BoxMesh" );

class Model extends Component {

	constructor( entity, { x = 0, y = 0, scale = 1, mesh = new BoxMesh() } = {} ) {

		super( entity );

		this.mesh = mesh;
		// this.entity = entity;

		entity.defineProperty( "x", x );
		entity.defineProperty( "y", y );
		entity.defineProperty( "scale", scale );

	}

	// state() {
	//
	// 	// console.log( this.mesh.arguments );
	//
	// 	return Object.assign( { mesh: this.mesh.constructor.name }, this.mesh.state() );
	//
	// }

}

module.exports = Model;
