'use client';

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  /** Optional: render a recovery component instead of the generic fallback
   *  when the error is likely a static-export dynamic route mismatch. */
  dynamicRouteFallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.dynamicRouteFallback) {
        return this.props.dynamicRouteFallback;
      }
      return this.props.fallback;
    }
    return this.props.children;
  }
}
