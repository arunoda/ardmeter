const next = require('next')
const express = require('express')
const jsonlines = require('jsonlines')
const multipipe = require('multipipe')
const Device = require('./device')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 8822

const server = express()
const app = next({ dir: '.', dev })
const handler = app.getRequestHandler()

const start = async () => {
  const device = new Device('/dev/cu.wchusbserial1420')
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

    console.log(`App started on port: http://localhost:${port}`)
  })
}

start()
  .catch((err) => {
    console.error(err.stack)
    process.exit(1)
  })
