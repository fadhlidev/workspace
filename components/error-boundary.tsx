"use client";

import { Component, type ComponentType, type PropsWithChildren } from "react";
import { ErrorFallback } from "@/components/error-fallback";

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ComponentType<{
    error?: Error;
    resetErrorBoundary?: () => void;
  }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback ?? ErrorFallback;
      return (
        <Fallback
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
