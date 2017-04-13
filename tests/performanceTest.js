
const LayerObject = require( "../index" ),

	MILLION = 1000 ** 2,
	BILLION = 1000 ** 3;

function clock( start ) {

	if ( ! start ) return process.hrtime();

	const end = process.hrtime( start );
	return Math.round( ( end[ 0 ] * 1000 ) + ( end[ 1 ] / 1000000 ) );

}

function format( number ) {

	return Math.round( number ).toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );

}

function test( func ) {

	func = func.toString();

	func = func.slice( func.indexOf( "{}" ) + 1, func.lastIndexOf( "}" ) );

	func = [
		"function () {",
		func,
		"}"
	].join( "\n" );

	console.log( func );

}

test( function () {

	console.log( "Hi!" );

} );

// const test1 = {}, test2 = new LayerObject();
//
// let start = clock();
// for ( let i = 0; i < BILLION; i ++ )
// 	test1.a = Math.random();
// console.log( "Object set", format( BILLION / clock( start ) ), "operations a second" );
//
// start = clock();
// for ( let i = 0; i < 10 * MILLION; i ++ )
// 	test2.a = Math.random();
// console.log( "LayerObject set", format( 10 * MILLION / clock( start ) ), "operations a second" );
