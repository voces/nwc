
class Transformer extends Function {

	constructor( transformer, duration, finishes, args, func ) {

		super( func );

		this.duration = duration;
		this.finishes = finishes;
		this.func = func;

		this.state = { transformer, args };

	}

}

module.exports = Transformer;
