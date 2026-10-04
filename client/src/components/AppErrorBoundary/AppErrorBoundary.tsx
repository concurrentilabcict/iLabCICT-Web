import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// React requires a class to catch render errors from descendant components.
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application render error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900">This page couldn't load</h1>
          <p className="mt-2 text-sm text-gray-600">Please reload the page and try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-primary-color px-5 py-2.5 font-medium text-white"
          >
            Reload page
          </button>
        </div>
      </main>
    );
  }
}
