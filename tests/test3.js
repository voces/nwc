
const LayerObject = require( "../index" );

class Test extends LayerObject {

	constructor() {

		super();

		this._value = 7;

		Object.defineProperty( this, "value", {
			get: () => this._value,
			set: value => this._value = value,
			enumerable: true
		} );

	}

	static myFunc() {}

}

const test = new Test();

test.value = 8;

LayerObject.layer = 1;

console.log( test.value );
console.log( test.__layers );
