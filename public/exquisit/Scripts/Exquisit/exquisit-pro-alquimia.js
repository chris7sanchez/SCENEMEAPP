// CONTINUACIÓN PARA EXQUISIT PRO - Añadir después de renderAlquimiaAstral()

configurarAlquimiaAstral() {
    const sol = document.getElementById('signo-sol');
    const luna = document.getElementById('signo-luna');
    const asc = document.getElementById('signo-asc');
    const intencion = document.getElementById('intencion');
    const btn = document.getElementById('btn-generar-alquimico');

    // Validar y habilitar botón
    const validar = () => {
        if (sol.value && luna.value && asc.value && intencion.value) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        }
    };

    // Mostrar balance de elementos
    const mostrarBalance = () => {
        if (!sol.value || !luna.value || !asc.value) return;

        const elementos = {
            'Fuego': 0,
            'Tierra': 0,
            'Aire': 0,
            'Agua': 0
        };

        // Contar elementos
        [sol.value, luna.value, asc.value].forEach(signo => {
            const elemento = CORRESPONDENCIAS_ASTROLOGICAS.signos[signo].elemento;
            elementos[elemento] += 33.33;
        });

        const balanceDiv = document.getElementById('balance-elementos');
        const chartDiv = document.getElementById('elementos-chart');

        balanceDiv.style.display = 'block';

        chartDiv.innerHTML = Object.entries(elementos).map(([elem, pct]) => {
            const icons = { 'Fuego': '🔥', 'Tierra': '🌍', 'Aire': '💨', 'Agua': '💧' };
            const colors = {
                'Fuego': 'rgba(255, 100, 50, 0.8)',
                'Tierra': 'rgba(139, 69, 19, 0.8)',
                'Aire': 'rgba(135, 206, 250, 0.8)',
                'Agua': 'rgba(65, 105, 225, 0.8)'
            };

            return `
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${icons[elem]} ${elem}</span>
                        <span style="font-weight: 600; color: var(--gold);">${Math.round(pct)}%</span>
                    </div>
                    <div style="height: 12px; background: rgba(201, 169, 97, 0.1); border-radius: 6px; overflow: hidden;">
                        <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, ${colors[elem]}, rgba(201, 169, 97, 0.5)); transition: width 0.6s ease;"></div>
                    </div>
                </div>
            `;
        }).join('');
    };

    sol.addEventListener('change', () => {
        validar();
        mostrarBalance();
    });
    luna.addEventListener('change', () => {
        validar();
        mostrarBalance();
    });
    asc.addEventListener('change', () => {
        validar();
        mostrarBalance();
    });
    intencion.addEventListener('change', validar);

    // GENERADOR DE FÓRMULA ALQUÍMICA
    btn.addEventListener('click', () => {
        const signoSol = sol.value;
        const signoLuna = luna.value;
        const signoAsc = asc.value;
        const intencionVal = intencion.value;

        this.generarFormulaAlquimica(signoSol, signoLuna, signoAsc, intencionVal);
    });
}

generarFormulaAlquimica(sol, luna, asc, intencion) {
    const formula = {
        salida: [],
        corazon: [],
        fondo: [],
        proposito: '',
        elementos_trabajados: []
    };

    // Determinar qué elementos potenciar
    let elementosPotenciar = [];
    let descripcionIntencion = '';

    if (intencion === 'elevar_fuego') {
        elementosPotenciar = ['Fuego'];
        descripcionIntencion = 'Elevar tu Fuego interior: Acción, coraje, vitalidad y liderazgo';
    } else if (intencion === 'elevar_tierra') {
        elementosPotenciar = ['Tierra'];
        descripcionIntencion = 'Elevar tu Tierra: Estabilidad, manifestación y arraigo';
    } else if (intencion === 'elevar_aire') {
        elementosPotenciar = ['Aire'];
        descripcionIntencion = 'Elevar tu Aire: Comunicación, claridad mental y relaciones';
    } else if (intencion === 'elevar_agua') {
        elementosPotenciar = ['Agua'];
        descripcionIntencion = 'Elevar tu Agua: Intuición, emociones y sensibilidad';
    } else if (intencion === 'potenciar_sol') {
        descripcionIntencion = `Potenciar tu esencia Solar ${sol}`;
    } else if (intencion === 'armonizar_luna') {
        descripcionIntencion = `Armonizar tu mundo emocional Lunar ${luna}`;
    } else if (intencion === 'equilibrio_total') {
        descripcionIntencion = 'Equilibrio elemental total';
        elementosPotenciar = ['Fuego', 'Tierra', 'Aire', 'Agua'];
    }

    formula.proposito = descripcionIntencion;

    // CONSTRUCCIÓN SEGÚN INTENCIÓN
    if (intencion.startsWith('elevar_')) {
        // Añadir moléculas del elemento a potenciar
        elementosPotenciar.forEach(elemento => {
            const moleculasElem = CORRESPONDENCIAS_ASTROLOGICAS.elementos[elemento].moleculas_potenciadoras;
            formula.corazon.push({
                molecula: moleculasElem[0],
                porcentaje: 35,
                razon: `Potenciador principal de ${elemento}`,
                chakra: null
            });
            formula.fondo.push({
                molecula: moleculasElem[1],
                porcentaje: 30,
                razon: `Fijador de ${elemento}`,
                chakra: null
            });
        });

        // Añadir nota de salida del Ascendente
        const molsAsc = CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].moleculas;
        formula.salida.push({
            molecula: molsAsc[0],
            porcentaje: 20,
            razon: `Ascendente ${asc} - Tu presencia`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].chakra
        });

        // Añadir equilibrio del Sol
        const molsSol = CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].moleculas;
        formula.corazon.push({
            molecula: molsSol[1],
            porcentaje: 15,
            razon: `Sol ${sol} - Tu esencia equilibradora`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].chakra
        });

    } else if (intencion === 'potenciar_sol') {
        // Fórmula centrada en el Sol
        const molsSol = CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].moleculas;
        formula.fondo.push({
            molecula: molsSol[0],
            porcentaje: 40,
            razon: `Sol ${sol} - Tu núcleo esencial`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].chakra
        });
        formula.corazon.push({
            molecula: molsSol[1],
            porcentaje: 25,
            razon: `Radiación solar de ${sol}`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].chakra
        });

        const molsLuna = CORRESPONDENCIAS_ASTROLOGICAS.signos[luna].moleculas;
        formula.corazon.push({
            molecula: molsLuna[0],
            porcentaje: 20,
            razon: `Luna ${luna} - Soporte emocional`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[luna].chakra
        });

        const molsAsc = CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].moleculas;
        formula.salida.push({
            molecula: molsAsc[0],
            porcentaje: 15,
            razon: `Ascendente ${asc} - Expresión exterior`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].chakra
        });

    } else if (intencion === 'armonizar_luna') {
        // Fórmula centrada en la Luna
        const molsLuna = CORRESPONDENCIAS_ASTROLOGICAS.signos[luna].moleculas;
        formula.corazon.push({
            molecula: molsLuna[0],
            porcentaje: 40,
            razon: `Luna ${luna} - Tu alma emocional`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[luna].chakra
        });
        formula.fondo.push({
            molecula: molsLuna[1],
            porcentaje: 30,
            razon: `Profundidad lunar de ${luna}`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[luna].chakra
        });

        const molsSol = CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].moleculas;
        formula.salida.push({
            molecula: molsSol[0],
            porcentaje: 18,
            razon: `Sol ${sol} - Iluminación consciente`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[sol].chakra
        });

        const molsAsc = CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].moleculas;
        formula.corazon.push({
            molecula: molsAsc[1],
            porcentaje: 12,
            razon: `Ascendente ${asc} - Integración social`,
            chakra: CORRESPONDENCIAS_ASTROLOGICAS.signos[asc].chakra
        });

    } else if (intencion === 'equilibrio_total') {
        // Balance de los 4 elementos
        formula.salida.push({
            molecula: CORRESPONDENCIAS_ASTROLOGICAS.elementos['Aire'].moleculas_potenciadoras[0],
            porcentaje: 25,
            razon: 'Elemento Aire - Comunicación',
            chakra: null
        });
        formula.corazon.push({
            molecula: CORRESPONDENCIAS_ASTROLOGICAS.elementos['Agua'].moleculas_potenciadoras[0],
            porcentaje: 25,
            razon: 'Elemento Agua - Intuición',
            chakra: null
        });
        formula.corazon.push({
            molecula: CORRESPONDENCIAS_ASTROLOGICAS.elementos['Fuego'].moleculas_potenciadoras[0],
            porcentaje: 25,
            razon: 'Elemento Fuego - Acción',
            chakra: null
        });
        formula.fondo.push({
            molecula: CORRESPONDENCIAS_ASTROLOGICAS.elementos['Tierra'].moleculas_potenciadoras[0],
            porcentaje: 25,
            razon: 'Elemento Tierra - Estabilidad',
            chakra: null
        });
    }

    this.mostrarFormulaAlquimica(formula, { sol, luna, asc }, intencion);
}

mostrarFormulaAlquimica(formula, signos, intencion) {
    const display = document.getElementById('formula-alquimica');

    const renderNota = (nota) => {
        const dataMol = MOLECULAS[nota.molecula];
        if (!dataMol) return '';

        const coste = (dataMol.coste / dataMol.ml) * (nota.porcentaje / 10);

        return `
            <div style="padding: 1.5rem; margin-bottom: 1rem; background: rgba(201, 169, 97, 0.05); border-left: 3px solid var(--gold);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                    <div style="flex: 1;">
                        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: var(--gold); margin-bottom: 0.5rem;">${nota.molecula}</div>
                        <div style="font-size: 0.75rem; opacity: 0.7; line-height: 1.6;">${dataMol.perfil}</div>
                        <div style="font-size: 0.75rem; color: var(--gold); margin-top: 0.5rem; font-style: italic;">${nota.razon}</div>
                        ${nota.chakra ? `<div style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.25rem;">Chakra: ${nota.chakra}</div>` : ''}
                    </div>
                    <div style="text-align: right; margin-left: 1rem;">
                        <div style="font-size: 2rem; font-weight: 600; color: var(--gold-bright);">${nota.porcentaje}%</div>
                        <div style="font-size: 0.7rem; opacity: 0.6;">≈€${coste.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
    };

    const costeTotal = [...formula.salida, ...formula.corazon, ...formula.fondo].reduce((acc, nota) => {
        const dataMol = MOLECULAS[nota.molecula];
        if (!dataMol) return acc;
        return acc + (dataMol.coste / dataMol.ml) * (nota.porcentaje / 10);
    }, 0);

    display.innerHTML = `
        <div style="margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 2px solid var(--gold);">
            <div style="font-family: 'Cinzel', serif; font-size: 2.2rem; color: var(--gold); margin-bottom: 1rem; letter-spacing: 0.1em; text-align: center;">
                PERFUME TRANSFORMADOR
            </div>
            <div style="font-size: 0.9rem; text-align: center; font-style: italic; opacity: 0.9; line-height: 1.6; margin-bottom: 1rem;">
                ${formula.proposito}
            </div>
            <div style="font-size: 0.75rem; text-align: center; opacity: 0.7;">
                ☉ ${signos.sol} · ☾ ${signos.luna} · ↑ ${signos.asc}
            </div>
        </div>

        ${formula.salida.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 1rem; letter-spacing: 0.1em;">
                    ✨ NOTAS DE SALIDA (Primera Impresión)
                </h4>
                ${formula.salida.map(renderNota).join('')}
            </div>
        ` : ''}

        ${formula.corazon.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 1rem; letter-spacing: 0.1em;">
                    💗 NOTAS DE CORAZÓN (Alma Transformadora)
                </h4>
                ${formula.corazon.map(renderNota).join('')}
            </div>
        ` : ''}

        ${formula.fondo.length > 0 ? `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 1rem; letter-spacing: 0.1em;">
                    🌙 NOTAS DE FONDO (Fundamento Alquímico)
                </h4>
                ${formula.fondo.map(renderNota).join('')}
            </div>
        ` : ''}

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--gold); text-align: right;">
            <div style="font-family: 'Cinzel', serif; font-size: 1.4rem;">
                Coste Estimado: <span style="color: var(--gold); font-weight: 600;">€${costeTotal.toFixed(2)}</span> / 10ml concentrado
            </div>
            <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 0.5rem;">
                * Basado en tu inventario molecular actual
            </div>
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(201, 169, 97, 0.1); border: 1px solid var(--copper); font-size: 0.8rem; line-height: 1.8; opacity: 0.8;">
            <strong style="color: var(--gold);">🔮 Instrucciones Alquímicas:</strong><br>
            Esta fórmula fusiona correspondencias astrológicas con moléculas profesionales de alta perfumería. 
            Usa estas proporciones como base para tu concentrado aromático. Mezcla en alcohol 96° a 20% (Extrait) 
            y macera 6-8 semanas en luna menguante para potenciar la intención transformadora.
        </div>
    `;
}
