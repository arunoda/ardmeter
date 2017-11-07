import React from 'react'
import TimeSeries from '../components/timeseries'
import moment from 'moment'

const data = []
for (let lc = 0; lc < 1000; lc++) {
  data.push({
    y: getRandom(),
    x: Date.now()
  })
}

function getRandom () {
  return 25 + (Math.ceil(Math.random() * 5))
}

function genData () {
  data.unshift()
  data.push({
    y: getRandom(),
    x: Date.now()
  })
  return data
}

export default class extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = { data: null }
    this.start = this.start.bind(this)
  }

  componentDidMount () {
    this.start()
    window.addEventListener('resize', this.start, false)
  }

  componentWillUnmount () {
    this.stop()
    window.removeEventListener('resize', this.start)
  }

  start () {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

    clearTimeout(this.timeoutHandler)
    this.timeoutHandler = setInterval(() => {
      this.setState({
        data: genData(),
        selectedPoint: null,
        chartWidth: width - 200,
        chartHeight: height - 400
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
    if (!data) {
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
          onEnterChart={() => this.stop()}
          onExitChart={() => this.start()}
        />

        {selectedPoint ? (
          <div className='resume-info'>
            [ Move the mouse outside of the chart to get latest values ]
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
