const { readFile } = require("fs/promises")
const path = require("path")
const { Transformer } = require("@parcel/plugin")
const { parse } = require("protocol-buffers-schema")
const { raw } = require("pbf/compile")

const cachedImports = {}

// getImport reads and parses the google/protobuf/*.proto import file and
// subsequently caches it in memory
async function getImport(name) {
  if (!cachedImports[name]) {
    const parsedProto = parse(
      await readFile(path.join(__dirname, `/imports/${name}.proto`))
    )
    cachedImports[name] = parsedProto
  }
  return cachedImports[name]
}

module.exports = new Transformer({
  async transform({ asset }) {
    // Retrieve the asset's source code
    let source = await asset.getCode()
    // let sourceMap = await asset.getMap()
    // Sadly source maps are not supported by pbf

    // Use protocol-buffers-schema to parse the *.proto file
    const parsed = parse(source)

    // Inject common google/protobuf imports
    // See files in `imports/*.proto`
    const messageTypeMap = {}
    await Promise.all(
      parsed.imports.map(async filename => {
        const match = filename.match(
          /^google\/protobuf\/([a-zA-Z_\d]+)\.proto$/
        )

        if (match) {
          const [, name] = match
          try {
            const { package, messages } = await getImport(name)

            // Change each message `name` to include package name
            const importMessages = messages.map(msg => {
              const newName = package.replace(".", "_") + "_" + msg.name
              messageTypeMap[package + "." + msg.name] = newName
              return Object.assign({}, msg, { name: newName })
            })

            // Change `type` for existing messages
            parsed.messages.forEach(msg => {
              msg.fields.forEach(f => {
                if (messageTypeMap[f.type]) {
                  f.type = messageTypeMap[f.type]
                }
              })
            })

            // Add import directly to `parsed.messages`
            parsed.messages = parsed.messages.concat(importMessages)
          } catch (e) {}
        }
      })
    )

    // Use pbf `compileRaw` in `compile.js`
    const code = raw(parsed)
    asset.type = "js"
    asset.setCode(code)
    // asset.setMap(map)

    // Return the asset
    return [asset]
  },
})
