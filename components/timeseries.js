import React from 'react'

export default class TimeSeries extends React.Component {
  renderAxis () {
    const {
      width,
      height,
      outerPadding: op
    } = this.props

    return [
      <line key='y-axis' x1={op} y1={op} x2={op} y2={height - op} stroke='gray' strokeWidth={3} />,
      <line key='x-axis' x1={op} y1={height - op} x2={width - op} y2={height - op} stroke='gray' strokeWidth={3} />
    ]
  }

  renderChart () {
    const {
      width,
      height,
      outerPadding: op,
      data,
      xScale = 50,
      dotR = 3,
      lineW = 1,
      onPoint = () => null
    } = this.props

    const drawingHeight = height - (op * 2)
    const drawingWidth = width - (op * 2)
    const maxY = Math.max(...(data.map(i => i.y)))
    const yScale = Math.floor((drawingHeight * 0.8) / maxY)
    const drawableData = data.slice(data.length - Math.ceil(drawingWidth / xScale))

    const points = []
    const lines = []
    let prevItem = null

    const calcX = (val) => (width - op - (xScale * val))
    const calcY = (val) => (height - op - (yScale * val))

    for (let lc = 0; lc < drawableData.length; lc++) {
      const item = drawableData[drawableData.length - lc - 1]
      let el = null
      points.push(
        <circle
          key={`c-${lc}`}
          r={dotR}
          cx={calcX(lc)}
          cy={calcY(item.y)}
          fill='rgb(94, 220, 229)'
          ref={i => (el = i)}
          onMouseOver={() => onPoint(item)}
          onMouseEnter={() => el.setAttribute('r', dotR * 2)}
          onMouseOut={() => el.setAttribute('r', dotR)}
        />
      )

      if (prevItem !== null) {
        lines.push(
          <line
            key={`l-${lc}`}
            x1={calcX(lc - 1)}
            y1={calcY(prevItem.y)}
            x2={calcX(lc)}
            y2={calcY(item.y)}
            stroke='rgb(94, 220, 229)'
            strokeWidth={lineW}
          />
        )
      }

      prevItem = item
    }

    return [...lines, ...points]
  }

  render () {
    const {
      width,
      height,
      onEnterChart = () => null,
      onExitChart = () => null
    } = this.props

    return (
      <svg
        width={width}
        height={height}
        onMouseOver={onEnterChart}
        onMouseOut={onExitChart}
      >
        {this.renderAxis()}
        {this.renderChart()}
      </svg>
    )
  }
}
