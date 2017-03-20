
//Slightly modified to also load entities

const { Entity } = require.main.require( "./core" );

function lazyRequires( ...names ) {

	const lazy = {}, store = {};

	Object.defineProperties( lazy,
        names.reduce( ( collection, name ) =>
            Object.assign(
                collection,
                { [ name ]: ( { get: () => store[ name ] || Entity.registerClass( ( store[ name ] = require( "./" + name ) ) ) } ) } ),
            {}
        )
    );

	return lazy;

}

module.exports = lazyRequires( "BoxUnit", "Unit" );
