// EXQUISIT - Main Application Logic

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Remove active from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active to clicked
        btn.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Load tab content
        if (tabName === 'inventory') loadInventory();
        if (tabName === 'library') loadLibrary();
        if (tabName === 'calculator') setupCalculator();
    });
});

// Birth Form Handler
document.getElementById('birthForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generarFormula();
});

function generarFormula() {
    const name = document.getElementById('name').value;
    const day = parseInt(document.getElementById('day').value);
    const month = parseInt(document.getElementById('month').value);
    const year = parseInt(document.getElementById('year').value);
    const hour = parseInt(document.getElementById('hour').value);
    const minute = parseInt(document.getElementById('minute').value);

    // Calculate signs
    const signoSolar = calcularSigno(day, month);
    const hora = hour;

    const signosOrden = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    const ascendente = signosOrden[Math.floor(hora / 2) % 12];
    const luna = signosOrden[(day + month) % 12];

    // Simulate empty houses
    const casasVacias = [2, 3, 5, 6, 8, 9, 11, 12];

    // Display astral profile
    displayAstralProfile(signoSolar, luna, ascendente);

    // Generate formula
    const formula = generarFormulaPerfume(signoSolar, luna, ascendente, casasVacias, name);

    // Display formula
    displayFormula(formula);

    // Show results
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayAstralProfile(sol, luna, asc) {
    const solData = ACEITES_SIGNOS[sol];
    const lunaData = ACEITES_SIGNOS[luna];
    const ascData = ACEITES_SIGNOS[asc];

    const grid = document.getElementById('astralGrid');
    grid.innerHTML = `
        <div class="astral-sign">
            <div class="sign-label">Sol · Tu Esencia</div>
            <div class="sign-name">${sol}</div>
            <div class="sign-element">${solData.elemento}</div>
        </div>
        <div class="astral-sign">
            <div class="sign-label">Luna · Emociones</div>
            <div class="sign-name">${luna}</div>
            <div class="sign-element">${lunaData.elemento}</div>
        </div>
        <div class="astral-sign">
            <div class="sign-label">Ascendente · Máscara</div>
            <div class="sign-name">${asc}</div>
            <div class="sign-element">${ascData.elemento}</div>
        </div>
    `;
}

function generarFormulaPerfume(sol, luna, asc, casasVacias, name) {
    const formula = {
        nombre: `Essentia ${sol}`,
        nombre_persona: name,
        notasSalida: [],
        notasCorazon: [],
        notasBase: [],
        propiedadesTerapeuticas: [],
        casasEquilibrar: []
    };

    // Notas Base: Signo Solar (esencia del ser)
    const aceiteBase = ACEITES_SIGNOS[sol];
    formula.notasBase.push({
        esencia: aceiteBase.principal,
        porcentaje: 30,
        origen: `Sol en ${sol}`,
        proposito: aceiteBase.propiedades,
        cientifico: aceiteBase.cientifico,
        efectos: aceiteBase.efectos,
        chakra: aceiteBase.chakra,
        elemento: aceiteBase.elemento
    });

    // Notas de Salida: Ascendente (máscara social)
    const aceiteAsc = ACEITES_SIGNOS[asc];
    const secundarioAsc = aceiteAsc.secundarios[0];
    formula.notasSalida.push({
        esencia: secundarioAsc,
        porcentaje: 20,
        origen: `Ascendente en ${asc}`,
        proposito: 'Tu presencia en el mundo',
        cientifico: PROPIEDADES_ACEITES[secundarioAsc]?.cientifico || 'Terpenos y alcoholes',
        efectos: PROPIEDADES_ACEITES[secundarioAsc]?.efectos || 'Energía expansiva',
        elemento: aceiteAsc.elemento
    });

    // Notas de Corazón: Luna (mundo emocional)
    const aceiteLuna = ACEITES_SIGNOS[luna];
    formula.notasCorazon.push({
        esencia: aceiteLuna.principal,
        porcentaje: 25,
        origen: `Luna en ${luna}`,
        proposito: 'Tu mundo emocional interno',
        cientifico: aceiteLuna.cientifico,
        efectos: aceiteLuna.efectos,
        chakra: aceiteLuna.chakra
    });

    // Equilibrar casas vacías (máximo 3)
    const casasAEquilibrar = casasVacias.slice(0, 3);
    const porcentajes = [12, 8, 5];

    casasAEquilibrar.forEach((casa, index) => {
        const casaInfo = ACEITES_CASAS[casa];
        const aceiteSeleccionado = casaInfo.aceites[0];

        formula.notasCorazon.push({
            esencia: aceiteSeleccionado,
            porcentaje: porcentajes[index],
            origen: `Casa ${casa}: ${casaInfo.nombre}`,
            proposito: casaInfo.proposito,
            cientifico: PROPIEDADES_ACEITES[aceiteSeleccionado]?.cientifico || 'Compuestos volátiles',
            efectos: PROPIEDADES_ACEITES[aceiteSeleccionado]?.efectos || casaInfo.proposito
        });

        formula.casasEquilibrar.push(casa);
    });

    // Generar propiedades terapéuticas combinadas
    const todosAceites = [
        ...formula.notasSalida.map(n => n.esencia),
        ...formula.notasCorazon.map(n => n.esencia),
        ...formula.notasBase.map(n => n.esencia)
    ];

    formula.propiedadesTerapeuticas = todosAceites.map(aceite => ({
        nombre: aceite,
        propiedades: PROPIEDADES_ACEITES[aceite] || {}
    })).filter(a => Object.keys(a.propiedades).length > 0);

    return formula;
}

function displayFormula(formula) {
    // Title
    document.getElementById('formulaName').textContent = formula.nombre;

    // Top Notes
    displayNotes(formula.notasSalida, 'topNotes');

    // Heart Notes
    displayNotes(formula.notasCorazon, 'heartNotes');

    // Base Notes
    displayNotes(formula.notasBase, 'baseNotes');

    // Properties
    displayProperties(formula.propiedadesTerapeuticas);

    // Recipe
    displayRecipe(formula);
}

function displayNotes(notes, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = notes.map(note => `
        <div class="note-item">
            <div class="note-header">
                <div class="note-name">${note.esencia}</div>
                <div class="note-percentage">${note.porcentaje}%</div>
            </div>
            <div class="note-origin">${note.origen}</div>
            <div class="note-purpose">${note.proposito}</div>
            <div class="note-science">
                <div><span class="note-science-label">Componentes:</span> ${note.cientifico}</div>
                <div><span class="note-science-label">Efectos:</span> ${note.efectos}</div>
                ${note.chakra ? `<div><span class="note-science-label">Chakra:</span> ${note.chakra}</div>` : ''}
                ${note.elemento ? `<div><span class="note-science-label">Elemento:</span> ${note.elemento}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function displayProperties(properties) {
    const container = document.getElementById('properties');
    if (properties.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <h3>Propiedades Terapéuticas Científicas</h3>
        <div class="properties-grid">
            ${properties.map(prop => `
                <div class="property-item">
                    <div class="property-name">${prop.nombre}</div>
                    ${prop.propiedades.emocionNegativa ? `
                        <div class="property-effect">❌ ${prop.propiedades.emocionNegativa} → ✅ ${prop.propiedades.emocionPositiva}</div>
                    ` : ''}
                    ${prop.propiedades.usos ? `
                        <div class="property-effect"><strong>Usos:</strong> ${prop.propiedades.usos}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function displayRecipe(formula) {
    const container = document.getElementById('recipe');
    const totalGotas = 20; // Para 10ml base

    container.innerHTML = `
        <p><span class="recipe-label">Base:</span> 10ml de alcohol de perfumería 96° o aceite de jojoba</p>
        <p><span class="recipe-label">Concentración:</span> Extrait de Parfum (20%)</p>
        <p style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; color: var(--gold);">Proporciones (en gotas):</p>
        ${[...formula.notasBase, ...formula.notasCorazon, ...formula.notasSalida].map(note => {
        const gotas = Math.round((note.porcentaje / 100) * totalGotas);
        return `<p>• ${note.esencia}: ${gotas} ${gotas === 1 ? 'gota' : 'gotas'} (${note.porcentaje}%)</p>`;
    }).join('')}
        <p style="margin-top: 1.5rem;"><span class="recipe-label">Orden de mezcla:</span> Base → Corazón → Salida</p>
        <p><span class="recipe-label">Maceración:</span> 4-6 semanas en frasco ámbar, agitar suavemente cada 3 días</p>
        <p><span class="recipe-label">Conservación:</span> Lugar oscuro, temperatura ambiente</p>
        <p><span class="recipe-label">Aplicación:</span> Puntos de pulso, preferentemente en rituales lunares</p>
    `;
}

// Inventory
function loadInventory() {
    const grid = document.getElementById('inventoryGrid');
    // This would load from your personal inventory
    // For now, showing all available oils
    const allOils = Object.keys(PROPIEDADES_ACEITES);

    grid.innerHTML = allOils.map(oil => `
        <div class="inventory-item">
            <div class="item-name">${oil}</div>
            <div class="item-quantity">Disponible</div>
        </div>
    `).join('');
}

// Library
function loadLibrary() {
    const grid = document.getElementById('libraryGrid');
    const oils = Object.entries(PROPIEDADES_ACEITES);

    grid.innerHTML = oils.map(([nombre, props]) => `
        <div class="library-item">
            <div class="library-item-name">${nombre}</div>
            <div class="library-item-latin">${props.cientifico}</div>
            <div class="library-item-props">
                <p><strong>Efectos:</strong> ${props.efectos}</p>
                <p><strong>Usos:</strong> ${props.usos}</p>
                <p><strong>Transforma:</strong> ${props.emocionNegativa} → ${props.emocionPositiva}</p>
            </div>
        </div>
    `).join('');

    // Search functionality
    const searchInput = document.getElementById('librarySearch');
    searchInput.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const items = grid.querySelectorAll('.library-item');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'block' : 'none';
        });
    });
}

// Calculator
function setupCalculator() {
    const volumeInput = document.getElementById('totalVolume');
    const concSelect = document.getElementById('concentration');
    const resultDiv = document.getElementById('calcResult');

    function calculate() {
        const volume = parseFloat(volumeInput.value) || 10;
        const concentration = parseInt(concSelect.value) || 20;

        const oilVolume = (volume * concentration) / 100;
        const alcoholVolume = volume - oilVolume;
        const drops = Math.round(oilVolume * 20); // 20 gotas por ml aproximadamente

        resultDiv.innerHTML = `
            <h3 style="color: var(--gold); margin-bottom: 1rem; font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;">Resultado</h3>
            <p><span class="recipe-label">Volumen total:</span> ${volume}ml</p>
            <p><span class="recipe-label">Concentración de aceites:</span> ${concentration}%</p>
            <p><span class="recipe-label">Aceites esenciales:</span> ${oilVolume.toFixed(1)}ml (≈${drops} gotas)</p>
            <p><span class="recipe-label">Alcohol/Base:</span> ${alcoholVolume.toFixed(1)}ml</p>
            <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--silver);">
                * 1ml ≈ 20 gotas<br>
                * Para dividir entre notas (ej: 60% base, 30% corazón, 10% salida), multiplica las gotas por el porcentaje
            </p>
        `;
    }

    volumeInput.addEventListener('input', calculate);
    concSelect.addEventListener('change', calculate);
    calculate(); // Initial calculation
}

console.log('✨ EXQUISIT - Alchemical Perfumery System Initialized');
