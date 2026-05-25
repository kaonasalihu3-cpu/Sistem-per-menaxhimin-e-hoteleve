import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error.',
    };
  }

  componentDidCatch(error) {
    // Keep the app from crashing entirely while preserving useful logs for debugging.
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-crash">
        <section className="state state-error">
          <div>
            <h2>Application Error</h2>
            <p>{this.state.errorMessage}</p>
            <p>Please reload the page. If this keeps happening, contact the system administrator.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
