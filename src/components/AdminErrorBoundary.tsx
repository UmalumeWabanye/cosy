'use client'

import React, { Component } from 'react'

export default class AdminErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null; info: React.ErrorInfo | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { error: null, info: null }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('AdminDashboard caught error:', error, info)
    this.setState({ error, info })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Application error</h2>
            <p className="mb-4">A client-side exception occurred — details follow:</p>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
              {String(this.state.error && this.state.error.stack)}
            </pre>
            <details className="mt-3">
              <summary className="cursor-pointer">Component stack</summary>
              <pre className="whitespace-pre-wrap text-sm mt-2">{this.state.info?.componentStack}</pre>
            </details>
          </div>
        </div>
      )
    }
    return this.props.children as React.ReactElement
  }
}