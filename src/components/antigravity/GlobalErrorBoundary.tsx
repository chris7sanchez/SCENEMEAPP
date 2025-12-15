'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Alchemistery Crash Detected:', error, errorInfo);
    }

    public handleRestore = () => {
        // Soft Restore: Reload page to recover initial state
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F2F0E9] text-[#1a1a1a] p-8">
                    <div className="max-w-md text-center p-8 border-2 border-[#1a1a1a] bg-white shadow-2xl rounded-lg">
                        <div className="text-4xl mb-4">⚡</div>
                        <h1 className="text-2xl font-serif font-bold mb-2 uppercase tracking-wide">Fallo en la Matriz</h1>
                        <p className="text-sm font-mono mb-6 text-gray-600">
                            Se ha detectado una inestabilidad cuántica en la aplicación.
                            Tus datos están seguros en la memoria local.
                        </p>

                        <div className="p-4 bg-gray-100 rounded mb-6 text-left text-[10px] font-mono overflow-auto max-h-32 border border-dashed border-gray-300">
                            {this.state.error?.message || 'Error desconocido'}
                        </div>

                        <button
                            onClick={this.handleRestore}
                            className="w-full bg-[#1a1a1a] text-white py-3 px-6 rounded font-bold uppercase tracking-widest hover:bg-[#C55959] transition-colors"
                        >
                            ⟳ Restaurar Sesión
                        </button>
                    </div>

                    <div className="absolute bottom-8 font-serif italic opacity-40">
                        "El caos precede al orden."
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
