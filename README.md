# parcel-transformer-proto

Protocol Buffers support in [Parcel v2](https://parceljs.org/) via [pbf](https://www.npmjs.com/package/pbf)

## Usage

1. Install NPM packages

	```
	$ npm install parcel-transformer-proto pbf
	```

1. Add .parcelrc file

	```json
	{
		"extends": "@parcel/config-default",
		"transformers": {
			"*.proto:": ["...", "parcel-transformer-proto"]
		}
	}
	```

1. Use it in your code along with [pbf](https://www.npmjs.com/package/pbf) to decode protobuf messages

	```js
	import Pbf from "pbf"
	import { Rectangle } from "./shapes.proto"
	
	// Decode Rectangle protobuf data from `buf`, which is assumed to be an Uint8Array
	function decodeRectangle(buf) {
	  return Rectangle.read(new Pbf(buf))
	}
	```