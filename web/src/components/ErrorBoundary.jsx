import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("System Failure:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-mono border-4 border-red-600">
                    <h1 className="text-6xl md:text-9xl font-display mb-4 text-red-600">CRITICAL ERROR</h1>
                    <div className="border-2 border-white p-6 max-w-2xl w-full mb-8 bg-black">
                        <p className="text-red-500 uppercase tracking-widest mb-4">/// SYSTEM HALTED ///</p>
                        <p className="mb-4">An unexpected anomaly has occurred in the Polymath Core.</p>
                        <pre className="bg-red-900/20 p-4 text-xs overflow-auto text-red-300 border border-red-800">
                            {this.state.error?.toString()}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black px-8 py-3 font-display uppercase text-2xl hover:bg-red-600 hover:text-white transition-colors"
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
