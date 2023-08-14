import React, { Component } from 'react'

interface Props {
  name: string
  serve: string
  script: any
  placement: string
  fallback: any
}

type AnyObject = Record<string, any>

function customInvoke(obj: AnyObject, methodName: string, ...args: any[]): any {
  const method = obj[methodName]

  if (typeof method === 'function') {
    return method.apply(obj, args)
  }

  throw new Error(`Method '${methodName}' not found on object.`)
}

class AdUnit extends Component {
  name: string
  serve: string
  script: any
  placement: string
  fallback: any
  showFallback: boolean

  constructor(props: Props) {
    super(props)

    this.name = props.name || 'tinybotsnet'
    this.serve = props.serve || 'CWYD62QI'
    this.script = props.script || null
    this.placement = props.placement || ''
    this.fallback = props.fallback || null
    this.showFallback = false
  }

  adShowing = () => document.getElementById(`${this.name} #carbonads`) !== null

  componentDidMount = () => {
    let script = document.createElement('script')
    script.defer = !!this.script
    script.async = true
    script.id = this.script ? '' : '_carbonads_js'
    script.type = 'text/javascript'
    script.src =
      this.script ||
      `//cdn.carbonads.com/carbon.js?serve=${this.serve}&placement=${this.placement}`
    script.onerror = () => {
      this.showFallback = true
      this.forceUpdate()
    }
    script.addEventListener('load', () => {
      // @ts-ignore
      if (!this.adShowing) customInvoke(window._carbonads, 'refresh')
    })

    // @ts-ignore
    document.querySelector(`#${this.name}`).appendChild(script)
  }

  render() {
    if (this.showFallback && this.fallback) {
      return this.fallback
    }
    return <div id={this.name} />
  }
}

export default AdUnit
