import http from 'stream-http'

export default class {
  constructor (options = {}) {
    this.limit = options.limit || 1000
    this.data = []
    this.closed = false
  }

  connect () {
    http.get('/device', (res) => {
      if (this.closed) {
        return
      }

      this.res = res

      res.on('data', (item) => {
        this.data.push(JSON.parse(item.toString('utf8')))
      })

      res.on('end', () => {
        this.data = []
      })
    })
  }

  getData () {
    if (this.err) {
      throw this.err
    }

    return this.data.map(({ timestamp, mA }) => ({
      x: timestamp,
      y: mA
    }))
  }

  close () {
    if (this.res) {
      this.res.destroy()
    }

    this.closed = true
  }
}
