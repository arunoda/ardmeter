import http from 'stream-http'
import jsonlines from 'jsonlines'
import multipipe from 'multipipe'

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
      const lines = jsonlines.parse()
      const final = multipipe(res, lines)

      final.on('data', (item) => {
        this.data.push(item)
        if (this.data.length === this.limit) {
          this.data.shift()
        }
      })

      final.on('error', (err) => {
        console.error('Error when getting messages', err.stack)
        this.err = err
      })

      final.on('end', () => {
        console.info('Cleaning up messages after the end.')
        this.data = []
      })
    })
  }

  getData () {
    if (this.err) {
      throw this.err
    }

    return this.data.map(({ timestamp, uA }) => ({
      x: timestamp,
      y: uA
    }))
  }

  close () {
    if (this.res) {
      this.res.destroy()
    }

    this.closed = true
  }
}
