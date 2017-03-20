//Defines interpolation functions
//	NOTE: all functions should have a .duration property;
//		  .finishes should be truthy if we want to stop calculating once duration expires

const Transformer = require( "./Transformer" );

class Transformers {

	//Linear transformer from start to end over duration
	static Linear( start, end, duration ) {

		const distance = end - start;

		return new Transformer( "Linear", duration, true, [ start, end, duration ],
			distance === 0 ?
				() => end :
				elapsed => elapsed >= duration ? end : start + distance * elapsed / duration );

	}

	//An array of transformers
	static Multi( parts ) {

		let index = 0,
			partOffset = 0,
			ended = false, endValue;

		return new Transformer( "Multi",
			parts.reduce( ( sum, part ) => sum + part.duration, 0 ),
			parts[ parts.length - 1 ].finishes,
			[ parts.map( part => part.state ) ],
			elapsed => {

				//Fast resolve if ended
				if ( ended )
					return endValue !== undefined ? endValue : parts[ index ]( elapsed - partOffset );

				let partElapsed = elapsed - partOffset;

				//Move down the list of parts until we're in one or done
				while ( parts[ index ] && partElapsed > parts[ index ].duration ) {

					partOffset += parts[ index ++ ].duration;
					partElapsed = elapsed - partOffset;

				}

				//We went over; step back and used the last one
				if ( parts[ index ] === undefined ) {

					ended = true;

					index --;

					if ( parts[ index ].finishes ) {

						endValue = parts[ index ]( parts[ index ].duration );
						return endValue;

					}

				}

				return parts[ index ]( partElapsed );

			} );

	}

}

module.exports = Transformers;
