
const { networkProperty } = require.main.require( "./core" ),

	{ entities: { BoxUnit } } = require.main.require( "./wc" );

const u = new BoxUnit( { speed: 5, x: 1, y: 2, scale: 2 } );

console.log( "\n===== BoxEntity =====" );
console.log( BoxUnit );

console.log( "\n===== u =====" );
console.log( u );

// u.movePath( [
// 	{ x: 10, y: 10 },
// 	{ x: - 10, y: 10 },
// 	{ x: - 10, y: - 10 },
// 	{ x: 10, y: - 10 },
// 	{ x: 0, y: 0 } ] );

// setTimeout( () => console.log( JSON.stringify( u.state(), null, "  " ) ), 50 );
setTimeout( () => {

	const newState = u.state();
	newState._id = 2;
	newState.x = 3;

	console.log( "\n===== Before =====" );
	console.log( JSON.stringify( BoxUnit.state(), null, "  " ) );

	BoxUnit.sync( newState );
	BoxUnit.sync( { _id: 0, seed: 0.1 } );

	setTimeout( () => {

		console.log( "\n===== After =====" );
		console.log( JSON.stringify( BoxUnit.state(), null, "  " ) );

	}, 20 );

	// console.log( Unit.instances );

}, 100 );

setInterval( () => networkProperty.time = Date.now(), 10 );
