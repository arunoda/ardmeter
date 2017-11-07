import React from 'react'
import TimeSeries from '../components/timeseries'

const data = []
for (let lc = 0; lc < 1000; lc++) {
  data.push({
    y: getRandom(),
    x: `x-${lc}`
  })
}

function getRandom () {
  return 25 + (Math.ceil(Math.random() * 5))
}

function genData () {
  data.unshift()
  data.push({
    y: getRandom(),
    x: `x`
  })
  return data
}

export default class extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = { data: [] }
  }

  componentDidMount () {
    this.timeoutHandler = setInterval(() => {
      this.setState({ data: genData() })
    }, 500)
  }

  componentWillUnmount () {
    clearTimeout(this.timeoutHandler)
  }

  render () {
    const { data } = this.state

    return (
      <div className='wrapper'>
        <TimeSeries
          width={1200}
          height={500}
          outerPadding={50}
          data={data}
          xScale={10}
          dotR={3}
          lineW={2}
        />
        <style jsx>{`
          .wrapper {
            text-align: center;
            margin-top: 150px;
          }
        `}</style>
      </div>
    )
  }
}
