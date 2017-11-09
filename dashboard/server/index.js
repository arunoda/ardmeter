const next = require('next')
const express = require('express')
const jsonlines = require('jsonlines')
const multipipe = require('multipipe')
const Device = require('./device')

const devicePort = process.argv[2]
if (!devicePort) {
  console.error(`
Run the command with:
  ardmeter <device path>
  `)
  process.exit(1)
}

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 8822

const server = express()
const app = next({ dir: '.', dev })
const handler = app.getRequestHandler()

const start = async () => {
  const device = new Device(devicePort.trim())
  await device.open()
  await app.prepare()

  server.use('/device', (req, res) => {
    const deviceStream = device.toStream()
    const lines = jsonlines.stringify()
    const final = multipipe(deviceStream, lines, res)

    req.once('aborted', () => {
      deviceStream._destroy()
    })

    final.once('error', err => {
      console.error(err.stack)
      // This error might occur inside lines or res streams.
      // So, in that case we need to destroy the events stream.
      deviceStream._destroy()
      res.end()
    })
  })

  server.use((req, res) => {
    handler(req, res)
  })

  server.listen(port, (err) => {
    if (err) {
      console.error(err.stack)
      process.exit(1)
    }

    console.log(`Dashboard URL: http://localhost:${port}`)
  })
}

start()
  .catch((err) => {
    console.error(err.stack)
    process.exit(1)
  })
