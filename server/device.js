/* eslint no-await-in-loop:0, no-constant-condition: 0 */
const {Readable} = require('stream')
const sleep = require('es7-sleep')

module.exports = class Device extends Readable {
  constructor ({serialPort, highWaterMark}) {
    super({
      objectMode: true,
      highWaterMark
    })

    this.serialPort = serialPort
    this.fetching = false
  }

  async startFetching () {
    if (this.fetching) {
      return
    }
    this.fetching = true

    while (true) {
      if (this.destroyed) {
        break
      }

      let canPush = this.push({ timestamp: Date.now(), mA: Math.ceil(Math.random() * 20) })
      await sleep(500)

      // We can't push anymore. So, we need to stop fetching.
      // Eventually, this._ready will start this again.
      if (!canPush) {
        this.fetching = false
        break
      }
    }
  }

  _read () {
    this.startFetching()
      .catch(err => {
        this.emit('error', err)
      })
  }

  _destroy () {
    this.destroyed = true
  }
}
