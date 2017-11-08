/* eslint no-await-in-loop:0, no-constant-condition: 0 */
const {Readable} = require('stream')
const SerialPort = require('serialport')
const { EventEmitter } = require('events')

module.exports = class Device extends EventEmitter {
  constructor (port, limit = 1000) {
    super()
    this.limit = limit
    this.serialPort = new SerialPort(port, { baudRate: 9600, autoOpen: false })
    this.data = []
  }

  open () {
    return new Promise((resolve, reject) => {
      this
      .serialPort.open((err) => {
        if (err) {
          reject(err)
          return
        }

        this._watch()
        resolve()
      })
    })
  }

  _watch () {
    this.serialPort.on('data', (item) => {
      const payload = item.toString('utf8').trim()
      const matched = payload.match(/^(.*)mA/)
      if (matched) {
        const measurement = { timestamp: Date.now(), mA: parseFloat(matched[1]) }
        this.data.push(measurement)
        if (this.data.length === this.limit) {
          this.data.unshift()
        }
        this.emit('data', measurement)
      } else {
        console.warn('Unknown data recieved: ', payload)
      }
    })

    this.serialPort.on('error', (err) => {
      console.error('Serial port error')
      console.error(err.stack)
      process.exit(1)
    })

    this.serialPort.on('close', () => {
      console.log('Port closed')
      process.exit(0)
    })
  }

  toStream () {
    return new DeviceStream(this)
  }
}

class DeviceStream extends Readable {
  constructor (device) {
    super({ objectMode: true })
    this.device = device
    this.destroy = false
    this.running = false
  }

  _read () {
    if (this.running) {
      return
    }

    this.running = true

    const pushNewData = (i) => { this.push(i) }
    this.device.data.forEach(pushNewData)
    this.device.on('data', pushNewData)

    this._close = () => {
      this.device.removeListener('data', pushNewData)
    }
  }

  _destroy () {
    this.destroy = true
    this._close()
  }
}
