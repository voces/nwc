
function lazyRequires( ...names ) {

	const lazy = {}, store = {};

	Object.defineProperties( lazy,
        names.reduce( ( collection, name ) =>
            Object.assign(
                collection, { [
					name ]: ( {
						get: () => store[ name ] || ( store[ name ] = require( "./" + name ) )
					} ) } ),
            {}
        )
    );

	return lazy;

}

module.exports = lazyRequires( "BoxMesh", "Mesh" );
