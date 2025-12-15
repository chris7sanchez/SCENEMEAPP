import React from 'react';

export const SceneMeLogo = ({ className = "w-24 h-24" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Círculo de fondo: Amarillo perfecto */}
            <circle cx="50" cy="50" r="50" className="fill-primary" />

            {/* Grupo Claqueta + Texto (Rotado -15 grados para dar el efecto inclinado) */}
            <g transform="translate(50, 50) rotate(-15) translate(-50, -50)">

                {/* --- CLAQUETA (Contorno Negro Grueso) --- */}
                {/* Parte Superior (Brazo) */}
                <g>
                    <rect x="15" y="20" width="70" height="18" rx="2" stroke="black" strokeWidth="6" fill="none" />
                    {/* Líneas divisorias del brazo */}
                    <line x1="38" y1="20" x2="38" y2="38" stroke="black" strokeWidth="5" />
                    <line x1="62" y1="20" x2="62" y2="38" stroke="black" strokeWidth="5" />
                </g>

                {/* Parte Inferior (Cuerpo) */}
                <rect x="15" y="42" width="70" height="45" rx="3" stroke="black" strokeWidth="6" fill="none" />

                {/* --- TEXTO "SCENE ME" --- */}
                {/* Sombra Blanca (Efecto 3D/Relieve) */}
                <text
                    x="51"
                    y="70"
                    fontFamily="'Oswald', sans-serif"
                    fontWeight="900"
                    fontSize="22"
                    fill="white"
                    textAnchor="middle"
                    className="font-display tracking-tighter"
                    style={{ textShadow: '2px 2px 0px white' }}
                >
                    SCENE ME
                </text>

                {/* Texto Principal Negro */}
                <text
                    x="50"
                    y="69"
                    fontFamily="'Oswald', sans-serif"
                    fontWeight="900"
                    fontSize="22"
                    fill="black"
                    textAnchor="middle"
                    className="font-display tracking-tighter"
                >
                    SCENE ME
                </text>

                {/* --- TEXTO "TU VIDEOBOOK" --- */}
                <text
                    x="50"
                    y="82"
                    fontFamily="sans-serif"
                    fontWeight="800"
                    fontSize="6"
                    fill="white"
                    textAnchor="middle"
                    letterSpacing="1"
                    style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
                >
                    TU VIDEOBOOK
                </text>

            </g>
        </svg>
    );
};
