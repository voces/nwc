//NOTE; only clients ever use prediction

const Transformer = require( "./Transformer" ),
	Transformers = require( "./Transformers" );

//Protected properties; changing them directly can break things
let _time = Date.now(),
	// _seed = Math.random(),
	_predicting = false;

function networkProperty( object, name, initialValue,
		{ preprocessor, postprocessor, enumerable = true } = {} ) {

    //Process and store our initial value
	let value, predictingValue,
		initialTime, initialPredictingTime,

		lastTime, lastPredicting, lastResult;

	Object.defineProperty( object, name, {
		enumerable: enumerable,
		get: () => {

            //Caching
			if ( _time === lastTime && _predicting === lastPredicting )
				return lastResult;

			//Keep track of predictions on the object
			if ( lastPredicting === true && ! _predicting )
				-- object.predictions;

			lastTime = _time;
			lastPredicting = _predicting;

            //Grab a new result
			lastResult = _predicting ?
                    typeof predictingValue === "function" ?
                        postprocessor ?
                            postprocessor( predictingValue( _time - initialPredictingTime ) ) :
                            predictingValue( _time - initialPredictingTime ) :
                        postprocessor ?
                            postprocessor( predictingValue ) :
                            predictingValue :
                    typeof value === "function" ?
                        postprocessor ?
                            postprocessor( value( _time - initialTime ) ) :
                            value( _time - initialTime ) :
                        postprocessor ?
                            postprocessor( value ) :
                            value;

			return lastResult;

		},
		set: newValue => {

            //Always overwrite the predicted value; sometimes overwrite true value
			predictingValue = preprocessor ?
                () => preprocessor( newValue ) :
                newValue;

			initialPredictingTime = _time;

			if ( ! _predicting ) {

				value = newValue;
				initialTime = initialPredictingTime;

			//Keep track of predictions on the object

			} else if ( lastPredicting === true )
				-- object.predictions;

            //Force a new retreival; use -1 as a third state (impossible time and not boolean)
			lastTime = - 1;
			lastPredicting = - 1;

		}
	} );

	object[ name ] = initialValue;

	if ( object._networkProperties === undefined )
		object._networkProperties = {};

	object._networkProperties[ name ] = {
		state: () => {

			const state = {
				value: getPropertyState( value )
			};

			if ( typeof value === "function" ) state.initialTime = initialTime;

			if ( predictingValue !== value ) {

				state.predictingValue = getPropertyState( predictingValue );

				if ( typeof predictingValue === "function" )
					state.initialPredictingTime = initialPredictingTime;

			}

			if ( Object.keys( state ).length === 1 ) return state.value;

			return state;

		},
		sync: state => {

			if ( lastPredicting === true )
				-- object.predictions;

			lastTime = - 1;
			lastPredicting = - 1;

			//value is a simple constant, not a function
			if ( typeof state !== "object" ) return value = predictingValue = state;

			value = new Transformers[ state.value.transformer ]( processArgs( state.value.args ) );

			if ( state.initialTime !== undefined ) initialTime = state.initialTime;

			if ( state.predictingValue !== undefined ) {

				predictingValue = new Transformers[ state.predictingValue.transformer ]( processArgs( state.predictingValue.args ) );

				if ( state.initialPredictingTime ) initialPredictingTime = state.initialPredictingTime;

			} else {

				predictingValue = value;
				initialPredictingTime = initialTime;

			}

		}
	};

}

function getPropertyState( valuer ) {

	if ( typeof valuer !== "function" ) return valuer;
	if ( valuer instanceof Transformer ) return valuer.state;
	throw "Network property function not a Transformer.";

}

function processArgs( args ) {

	return args.map( arg =>
		typeof arg === "object" && arg.transformer ?
			new Transformers[ arg.transformer ]( processArgs( arg.args ) ) :
			arg );

}

Object.defineProperties( networkProperty, {
	time: {
		enumerable: true,
		get: () => _time,
		set: value => {

			if ( value < _time )
				throw `Failed to set time to ${value} because it is lower than the last time, ${_time}.`;

			_time = value;

		}
	},
	predicting: {
		enumerable: true,
		get: () => _predicting,
		set: value => _predicting = value ? true : false
	}
} );

module.exports = networkProperty;
