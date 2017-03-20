
const { Component, Transformers } = require.main.require( "./core" ),

// Component = require.main.require( "./core/Component" ),
// 	Transformers = require.main.require( "./core/Transformers" ),

	Model = require( "./Model" );

class Mobility extends Component {

	constructor( entity, { speed = 1 } = {} ) {

		super( entity );

		entity.defineProperty( "speed", speed );

	}

	static get entityDescriptors( ) {

		return [ "moveTowards", "moveTo", "movePath" ];

	}

	static get requires() {

		return [ Model ];

	}

	moveTowards( point ) {

		const xDelta = point.x - this.x,
			yDelta = point.y - this.y,
			duration = ( xDelta ** 2 + yDelta ** 2 ) ** ( 1 / 2 ) / ( this.speed / 1000 );

		this.x = elapsed => this.x + xDelta * elapsed / duration;
		this.y = elapsed => this.y + yDelta * elapsed / duration;

	}

	moveTo( point ) {

		const xDelta = point.x - this.x,
			yDelta = point.y - this.y,
			duration = ( xDelta ** 2 + yDelta ** 2 ) ** ( 1 / 2 ) / ( this.speed / 1000 );

		this.x = Transformers.Linear( this.x, point.x, duration );
		this.y = Transformers.Linear( this.y, point.y, duration );

	}

	movePath( path ) {

		const linearTransformers = path.map( ( point, index ) => {

			const prevPoint = path[ index - 1 ] || this,

				xDelta = point.x - prevPoint.x,
				yDelta = point.y - prevPoint.y,
				duration = Math.hypot( xDelta, yDelta ) / ( this.speed / 1000 );

			return [
				Transformers.Linear( prevPoint.x, point.x, duration ),
				Transformers.Linear( prevPoint.y, point.y, duration )
			];

		} );

		this.x = Transformers.Multi( linearTransformers.map( t => t[ 0 ] ) );
		this.y = Transformers.Multi( linearTransformers.map( t => t[ 1 ] ) );

	}

}

module.exports = Mobility;
