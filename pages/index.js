import React from 'react'
import TimeSeries from '../components/timeseries'
import Device from '../lib/device'
import moment from 'moment'

export default class extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = { data: null }
    this.start = this.start.bind(this)
    this.device = new Device()
  }

  componentDidMount () {
    this.device.connect()
    this.start()
    window.addEventListener('resize', this.start, false)
  }

  componentWillUnmount () {
    this.device.close()
    this.stop()
    window.removeEventListener('resize', this.start)
  }

  start () {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    clearTimeout(this.timeoutHandler)
    this.timeoutHandler = setInterval(() => {
      const data = this.device.getData()
      this.setState({
        data,
        selectedPoint: null,
        chartWidth: width - 200,
        chartHeight: height > 300 ? (height - 300) : height
      })
    }, 500)
  }

  stop () {
    clearTimeout(this.timeoutHandler)
  }

  setPoint (p) {
    this.setState({selectedPoint: p})
  }

  render () {
    const { data, selectedPoint, chartWidth, chartHeight } = this.state
    if (!data || data.length === 0) {
      return (<p>Loading...</p>)
    }

    const last = data[data.length - 1]
    const value = selectedPoint || last
    const caption = selectedPoint ? moment(new Date(selectedPoint.x)).format('h:mm:ss') : 'latest'

    return (
      <div className='wrapper'>
        {value ? (
          <div className='value'>
            <div className='caption'>{caption} - {value.y}mA</div>
          </div>
        ) : null}

        <TimeSeries
          width={chartWidth}
          height={chartHeight}
          outerPadding={5}
          data={data}
          xScale={10}
          dotR={3}
          lineW={2}
          onPoint={(p) => this.setPoint(p)}
          onEnter={() => this.stop()}
          onLeave={() => this.start()}
        />

        {selectedPoint ? (
          <div className='resume-info'>
            [ Leave the chart to resume ]
          </div>
        ) : null}
        <style jsx>{`
          .wrapper {
            text-align: center;
            margin-top: 100px;
          }

          .value {
            margin: 30px;
          }

          .value .caption {
            font-size: 50px;
            font-family: monospace;
          }

          .resume-info {
            margin-top: 10px;
            font-family: Arial;
            font-size: 16px;
            color: #FF7043;
          }
        `}</style>
      </div>
    )
  }
}
