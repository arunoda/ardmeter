import React from 'react'

export default class TimeSeries extends React.Component {
  renderAxis () {
    const {
      width,
      height,
      outerPadding: op
    } = this.props

    return [
      <line key='y-axis' x1={op} y1={op} x2={op} y2={height - op} stroke='#CCC' strokeWidth={1} />,
      <line key='x-axis' x1={op} y1={height - op} x2={width - op} y2={height - op} stroke='#CCC' strokeWidth={1} />
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
    const drawablePoints = Math.ceil(drawingWidth / xScale)
    const drawableData = data.length > drawablePoints ? data.slice(data.length - drawablePoints) : data

    const points = []
    const bars = []
    const cursors = []
    const lines = []
    let prevItem = null

    const calcX = (val) => (width - op - (xScale * val))
    const calcY = (val) => (height - op - (yScale * val))

    for (let lc = 0; lc < drawableData.length; lc++) {
      const item = drawableData[drawableData.length - lc - 1]
      let pointEl = null
      let cursorEl = null
      points.push(
        <circle
          key={`c-${lc}`}
          r={dotR}
          cx={calcX(lc)}
          cy={calcY(item.y)}
          fill='rgb(94, 220, 229)'
          ref={el => (pointEl = el)}
        />
      )

      bars.push(
        <line
          key={`b-${lc}`}
          x1={calcX(lc)}
          y1={0}
          x2={calcX(lc)}
          y2={height}
          stroke='#fff'
          strokeWidth={xScale}
          onMouseOver={() => onPoint(item)}
          onMouseEnter={() => {
            pointEl.setAttribute('r', dotR * 2)
            cursorEl.setAttribute('stroke', '#DDD')
          }}
          onMouseOut={() => {
            pointEl.setAttribute('r', dotR)
            cursorEl.setAttribute('stroke', 'white')
          }}
        />
      )

      cursors.push(
        <line
          key={`cu-${lc}`}
          x1={calcX(lc)}
          y1={5}
          x2={calcX(lc)}
          y2={height - 5}
          stroke='white'
          strokeWidth={1}
          ref={(el) => { cursorEl = el }}
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

    return [...bars, ...cursors, ...lines, ...points]
  }

  render () {
    const {
      width,
      height,
      onEnter = () => null,
      onLeave = () => null
    } = this.props

    return (
      <svg
        width={width}
        height={height}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {this.renderChart()}
        {this.renderAxis()}
      </svg>
    )
  }
}
