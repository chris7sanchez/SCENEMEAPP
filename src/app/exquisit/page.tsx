'use client';

import { useEffect } from 'react';

export default function ExquisitPage() {
    useEffect(() => {
        // Redirect to the static HTML file
        window.location.href = '/exquisit/index.html';
    }, []);

    return (
        <div style={{
            background: '#1a0f0a',
            color: '#f4e8d0',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚗</div>
                <div>Cargando Exquisit Pro...</div>
            </div>
        </div>
    );
}
