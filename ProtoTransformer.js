import { Transformer } from "@parcel/plugin"
import { parse } from "protocol-buffers-schema"
import { raw } from "pbf/compile"

export default new Transformer({
  async transform({ asset }) {
    // Retrieve the asset's source code
    let source = await asset.getCode()
    // Sadly source maps are not supported by pbf
    // let sourceMap = await asset.getMap()

    // Use protocol-buffers-schema to parse the *.proto file
    const parsed = parse(source)
    // Use pbf `compileRaw` in `compile.js`
    const code = raw(parsed)
    asset.setCode(code)
    // asset.setMap(map)

    // Return the asset
    return [asset]
  },
})
