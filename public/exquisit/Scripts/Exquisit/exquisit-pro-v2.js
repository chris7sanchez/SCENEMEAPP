// EXQUISIT PRO - Sistema Profesional de Perfumería de Nicho
// Base de datos COMPLETA de moléculas de tu inventario real

const MOLECULAS = {
    // ═══════════════════════════════════════════════════════════
    // MOLÉCULAS SINTÉTICAS DE LUJO
    // ═══════════════════════════════════════════════════════════

    'ISO E Super': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Cedro, ámbar, aterciopelado, second-skin',
        fuerza: 'Media-Fuerte',
        coste: 15.50,
        ml: 50,
        notas: 'La molécula invisible - Crea volumen y radiancia',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Ambroxan': {
        tipo: 'Sintética',
        familia: 'Ambarada',
        perfil: 'Ámbar gris, mineral, salado-dulce, seco',
        fuerza: 'Muy Fuerte',
        coste: 22.00,
        ml: 25,
        notas: 'Ámbar gris moderno - Longevidad extrema',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Hedione (Metil Dihidrojasmonato)': {
        tipo: 'Sintética',
        familia: 'Floral',
        perfil: 'Jazmín, transparente, radiante, aéreo',
        fuerza: 'Media',
        coste: 18.00,
        ml: 50,
        notas: 'Agente de difusión - Hace que los perfumes irradien',
        ifra: 'Máx 40% en concentrado',
        proveedor: 'Bello'
    },

    'Galaxolide': {
        tipo: 'Sintética',
        familia: 'Almizcle',
        perfil: 'Almizcle limpio, empolvado, suave, moderno',
        fuerza: 'Fuerte',
        coste: 12.00,
        ml: 50,
        notas: 'Almizcle policíclico - Extremadamente estable',
        ifra: 'Restringido a 1.4%',
        proveedor: 'Bello'
    },

    'Cashmeran': {
        tipo: 'Sintética',
        familia: 'Amaderada-Almizclada',
        perfil: 'Cachemira, pino, especiado, cálido',
        fuerza: 'Media',
        coste: 16.50,
        ml: 25,
        notas: 'Híbrido único amaderado-almizclado',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Celestolide': {
        tipo: 'Sintética',
        familia: 'Almizcle',
        perfil: 'Almizcle limpio, afrutado, dulce',
        fuerza: 'Fuerte',
        coste: 14.00,
        ml: 50,
        notas: 'Almizcle macrocíclico - Muy difusivo',
        ifra: 'Máx 1.8%',
        proveedor: 'Bello'
    },

    'Cetalox (Ambrox)': {
        tipo: 'Sintética',
        familia: 'Ambarada',
        perfil: 'Ámbar gris, amaderado, marino',
        fuerza: 'Muy Fuerte',
        coste: 28.00,
        ml: 25,
        notas: 'Ambrox puro - Longevidad absoluta',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Muscone (Almizcle)': {
        tipo: 'Sintética',
        familia: 'Almizcle',
        perfil: 'Almizcle animal, cálido, sensual, profundo',
        fuerza: 'Muy Fuerte',
        coste: 35.00,
        ml: 10,
        notas: 'Recreación del almizcle de ciervo - Animalidad pura',
        ifra: 'Uso controlado',
        proveedor: 'Bello'
    },

    'Timberol': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Madera seca, patchouli, terroso',
        fuerza: 'Fuerte',
        coste: 19.00,
        ml: 25,
        notas: 'Efecto madera seca - Muy natural',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Ambrettolide': {
        tipo: 'Sintética',
        familia: 'Almizcle',
        perfil: 'Almizcle ambarado, dulce, floral',
        fuerza: 'Media-Fuerte',
        coste: 42.00,
        ml: 10,
        notas: 'Macrocíclico de lujo - Extrema suavidad',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Vertofix (Acetato de Cedro)': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Cedro, seco, elegante, persistente',
        fuerza: 'Fuerte',
        coste: 13.00,
        ml: 50,
        notas: 'Base amaderada clásica - Gran fijación',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Aldehído C12 MNA': {
        tipo: 'Sintética',
        familia: 'Aldehídica',
        perfil: 'Metálico, jabonoso, limpio, efervescente',
        fuerza: 'Muy Fuerte',
        coste: 16.00,
        ml: 25,
        notas: 'Chispa aldeídica - Estilo Chanel N°5',
        ifra: 'Uso moderado',
        proveedor: 'Bello'
    },

    'Verdox (Terpenos)': {
        tipo: 'Sintética',
        familia: 'Verde',
        perfil: 'Hojas verdes, frescas, naturales',
        fuerza: 'Media',
        coste: 11.00,
        ml: 50,
        notas: 'Efecto green intenso',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    'Velvione': {
        tipo: 'Sintética',
        familia: 'Almizclada-Ambarada',
        perfil: 'Aterciopelado, suave, envolvente',
        fuerza: 'Media-Fuerte',
        coste: 24.00,
        ml: 25,
        notas: 'Textura de terciopelo olfativo',
        ifra: 'Sin restricciones',
        proveedor: 'Bello'
    },

    // ═══════════════════════════════════════════════════════════
    // ABSOLUTOS Y EXTRACTOS NATURALES DE LUJO
    // ═══════════════════════════════════════════════════════════

    'Rosa Absoluto (Bulgaria)': {
        tipo: 'Natural',
        familia: 'Floral',
        perfil: 'Rosa, miel, especiado, rico, damascena',
        fuerza: 'Fuerte',
        coste: 85.00,
        ml: 5,
        notas: 'Rosa damascena búlgara - Contiene damascenone',
        ifra: 'Verificar alérgenos',
        proveedor: 'Eden Botanicals'
    },

    'Jazmín Sambac Absoluto': {
        tipo: 'Natural',
        familia: 'Floral',
        perfil: 'Jazmín, narcótico, indólico, carnal',
        fuerza: 'Muy Fuerte',
        coste: 120.00,
        ml: 5,
        notas: 'Contiene indol - Faceta animalesca',
        ifra: 'Verificar alérgenos',
        proveedor: 'Eden Botanicals'
    },

    'Oud Assam (India)': {
        tipo: 'Natural',
        familia: 'Amaderada',
        perfil: 'Agarwood, medicinal, ahumado, cuero',
        fuerza: 'Extrema',
        coste: 95.00,
        ml: 2,
        notas: 'Oud salvaje - Ingrediente de lujo supremo',
        ifra: 'Concentración variable',
        proveedor: 'Ensar Oud'
    },

    'Sándalo Australiano': {
        tipo: 'Natural',
        familia: 'Amaderada',
        perfil: 'Sándalo, cremoso, lácteo, suave',
        fuerza: 'Media',
        coste: 45.00,
        ml: 10,
        notas: 'S. spicatum - Fuente sostenible',
        ifra: 'Sin restricciones mayores',
        proveedor: 'Eden Botanicals'
    },

    'Vetiver Haití': {
        tipo: 'Natural',
        familia: 'Amaderada-Terrosa',
        perfil: 'Raíces, tierra, ahumado-verde, masculino',
        fuerza: 'Fuerte',
        coste: 25.00,
        ml: 10,
        notas: 'El mejor vetiver - Oscuro y complejo',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    },

    'Incienso / Frankincense': {
        tipo: 'Natural',
        familia: 'Resinosa',
        perfil: 'Incienso, cítrico, pino, sagrado',
        fuerza: 'Media',
        coste: 32.00,
        ml: 10,
        notas: 'Boswellia sacra - Profundidad espiritual',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    },

    'Patchouli Envejecido': {
        tipo: 'Natural',
        familia: 'Terrosa',
        perfil: 'Terroso, dulce, vinoso, añejo',
        fuerza: 'Muy Fuerte',
        coste: 18.00,
        ml: 10,
        notas: 'Envejecido 5 años - Mejora con el tiempo',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    },

    'Bergamota FCF': {
        tipo: 'Natural',
        familia: 'Cítrica',
        perfil: 'Cítrico, elegante, amargo, floral',
        fuerza: 'Ligera',
        coste: 15.00,
        ml: 10,
        notas: 'Sin furanocumarinas - Sin fotosensibilidad',
        ifra: 'Versión FCF segura',
        proveedor: 'Eden Botanicals'
    },

    'Neroli (Azahar)': {
        tipo: 'Natural',
        familia: 'Floral-Cítrica',
        perfil: 'Flor de naranjo, fresco, verde, luminoso',
        fuerza: 'Media',
        coste: 68.00,
        ml: 5,
        notas: 'Destilación de flores - Pureza absoluta',
        ifra: 'Verificar alérgenos',
        proveedor: 'Eden Botanicals'
    },

    'Ylang Ylang Extra': {
        tipo: 'Natural',
        familia: 'Floral',
        perfil: 'Floral, dulce, cremoso, tropical, sensual',
        fuerza: 'Fuerte',
        coste: 22.00,
        ml: 10,
        notas: 'Primera destilación - Máxima calidad',
        ifra: 'Verificar alérgenos',
        proveedor: 'Eden Botanicals'
    },

    'Vainilla Absoluto': {
        tipo: 'Natural',
        familia: 'Gourmand',
        perfil: 'Vainilla, dulce, cremoso, cálido',
        fuerza: 'Fuerte',
        coste: 52.00,
        ml: 5,
        notas: 'Madagascar - Vainillina natural',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    },

    'Oakmoss Absoluto': {
        tipo: 'Natural',
        familia: 'Musgosa',
        perfil: 'Musgo, terroso, verde-oscuro, chypre',
        fuerza: 'Muy Fuerte',
        coste: 75.00,
        ml: 5,
        notas: 'Base clásica chypre - Muy restringido IFRA',
        ifra: 'Máx 0.1% producto final',
        proveedor: 'Eden Botanicals'
    },

    'Tabaco Absoluto': {
        tipo: 'Natural',
        familia: 'Aromática',
        perfil: 'Tabaco, miel, seco, especiado',
        fuerza: 'Fuerte',
        coste: 38.00,
        ml: 5,
        notas: 'Hoja de tabaco curado - Profundidad única',
        ifra: 'Sin restricciones mayores',
        proveedor: 'Eden Botanicals'
    },

    'Labdanum Absoluto': {
        tipo: 'Natural',
        familia: 'Resinosa-Ambarada',
        perfil: 'Ámbar, cuero, dulce, denso',
        fuerza: 'Muy Fuerte',
        coste: 28.00,
        ml: 10,
        notas: 'Cistus - Base ambarina natural',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    },

    'Mimosa Absoluto': {
        tipo: 'Natural',
        familia: 'Floral-Verde',
        perfil: 'Miel, verde, empolvado, delicado',
        fuerza: 'Media',
        coste: 95.00,
        ml: 3,
        notas: 'Flor de mimosa - Exquisito y raro',
        ifra: 'Verificar alérgenos',
        proveedor: 'Eden Botanicals'
    },

    'Immortelle (H. italicum)': {
        tipo: 'Natural',
        familia: 'Aromática',
        perfil: 'Curry, miel, seco, especiado, medicinal',
        fuerza: 'Muy Fuerte',
        coste: 85.00,
        ml: 3,
        notas: 'Siempreviva - Nota única e inolvidable',
        ifra: 'Sin restricciones',
        proveedor: 'Eden Botanicals'
    }
};

const ACORDES_PROFESIONALES = {
    'Floral Moderno': {
        formula: {
            'Hedione (Metil Dihidrojasmonato)': 40,
            'Rosa Absoluto (Bulgaria)': 15,
            'Jazmín Sambac Absoluto': 10,
            'ISO E Super': 20,
            'Galaxolide': 15
        },
        descripcion: 'Floral limpio y radiante con tremenda proyección',
        familia: 'Floral',
        intensidad: 'Alta'
    },

    'Oud Místico': {
        formula: {
            'Oud Assam (India)': 25,
            'Cetalox (Ambrox)': 30,
            'Sándalo Australiano': 20,
            'Patchouli Envejecido': 15,
            'Incienso / Frankincense': 10
        },
        descripcion: 'Oriental oscuro, místico, longevidad extrema',
        familia: 'Oriental Amaderada',
        intensidad: 'Extrema'
    },

    'Sueño de Ámbar Gris': {
        formula: {
            'Ambroxan': 40,
            'Cetalox (Ambrox)': 25,
            'Cashmeran': 15,
            'Vetiver Haití': 10,
            'Bergamota FCF': 10
        },
        descripcion: 'Ámbar mineral moderno con facetas marinas',
        familia: 'Ambarada Moderna',
        intensidad: 'Muy Alta'
    },

    'Piel de Terciopelo': {
        formula: {
            'ISO E Super': 50,
            'Cashmeran': 20,
            'Celestolide': 15,
            'Sándalo Australiano': 15
        },
        descripcion: 'Efecto second-skin - Obra maestra molecular',
        familia: 'Amaderada Almizclada',
        intensidad: 'Media-Alta'
    },

    'Chypre Oscuro': {
        formula: {
            'Oakmoss Absoluto': 20,
            'Labdanum Absoluto': 30,
            'Bergamota FCF': 15,
            'Patchouli Envejecido': 20,
            'Vetiver Haití': 15
        },
        descripcion: 'Chypre clásico oscuro - Elegancia atemporal',
        familia: 'Chypre',
        intensidad: 'Muy Alta'
    },

    'Gourmand Sensual': {
        formula: {
            'Vainilla Absoluto': 35,
            'Tabaco Absoluto': 25,
            'Ambrettolide': 15,
            'Muscone (Almizcle)': 10,
            'Labdanum Absoluto': 15
        },
        descripcion: 'Dulce profundo con animalidad sutil',
        familia: 'Gourmand Oriental',
        intensidad: 'Alta'
    }
};

// ═══════════════════════════════════════════════════════════
// MAPEO ASTROLÓGICO DE MOLÉCULAS PROFESIONALES
// ═══════════════════════════════════════════════════════════

const CORRESPONDENCIAS_ASTROLOGICAS = {
    signos: {
        'Aries': {
            elemento: 'Fuego',
            chakra: 'Plexo Solar',
            moleculas: ['ISO E Super', 'Aldehído C12 MNA', 'Bergamota FCF', 'Neroli (Azahar)'],
            propiedades: 'Acción, coraje, liderazgo, iniciativa',
            nota_dominante: 'Salida'
        },
        'Tauro': {
            elemento: 'Tierra',
            chakra: 'Raíz',
            moleculas: ['Sándalo Australiano', 'Rosa Absoluto (Bulgaria)', 'Vainilla Absoluto', 'Labdanum Absoluto'],
            propiedades: 'Estabilidad, sensualidad, abundancia',
            nota_dominante: 'Fondo'
        },
        'Géminis': {
            elemento: 'Aire',
            chakra: 'Garganta',
            moleculas: ['Hedione (Metil Dihidrojasmonato)', 'Bergamota FCF', 'Neroli (Azahar)', 'Verdox (Terpenos)'],
            propiedades: 'Comunicación, agilidad mental, versatilidad',
            nota_dominante: 'Salida'
        },
        'Cáncer': {
            elemento: 'Agua',
            chakra: 'Corazón',
            moleculas: ['Jazmín Sambac Absoluto', 'Rosa Absoluto (Bulgaria)', 'Ylang Ylang Extra', 'Sándalo Australiano'],
            propiedades: 'Protección emocional, nutrición, intuición',
            nota_dominante: 'Corazón'
        },
        'Leo': {
            elemento: 'Fuego',
            chakra: 'Plexo Solar',
            moleculas: ['Ambroxan', 'Incienso / Frankincense', 'Neroli (Azahar)', 'ISO E Super'],
            propiedades: 'Poder personal, confianza, vitalidad solar',
            nota_dominante: 'Fondo'
        },
        'Virgo': {
            elemento: 'Tierra',
            chakra: 'Plexo Solar',
            moleculas: ['Vetiver Haití', 'Verdox (Terpenos)', 'Bergamota FCF', 'Neroli (Azahar)'],
            propiedades: 'Purificación, precisión, orden, sanación',
            nota_dominante: 'Corazón'
        },
        'Libra': {
            elemento: 'Aire',
            chakra: 'Corazón',
            moleculas: ['Rosa Absoluto (Bulgaria)', 'Ylang Ylang Extra', 'Galaxolide', 'Hedione (Metil Dihidrojasmonato)'],
            propiedades: 'Armonía, equilibrio, belleza, relaciones',
            nota_dominante: 'Corazón'
        },
        'Escorpio': {
            elemento: 'Agua',
            chakra: 'Sacro',
            moleculas: ['Patchouli Envejecido', 'Oud Assam (India)', 'Muscone (Almizcle)', 'Oakmoss Absoluto'],
            propiedades: 'Transformación, poder oculto, regeneración',
            nota_dominante: 'Fondo'
        },
        'Sagitario': {
            elemento: 'Fuego',
            chakra: 'Tercer Ojo',
            moleculas: ['Jazmín Sambac Absoluto', 'Incienso / Frankincense', 'Cetalox (Ambrox)', 'Immortelle (H. italicum)'],
            propiedades: 'Expansión, sabiduría, optimismo, aventura',
            nota_dominante: 'Corazón'
        },
        'Capricornio': {
            elemento: 'Tierra',
            chakra: 'Raíz',
            moleculas: ['Vetiver Haití', 'Cetalox (Ambrox)', 'Patchouli Envejecido', 'Vertofix (Acetato de Cedro)'],
            propiedades: 'Estructura, manifestación, disciplina',
            nota_dominante: 'Fondo'
        },
        'Acuario': {
            elemento: 'Aire',
            chakra: 'Tercer Ojo',
            moleculas: ['Ambroxan', 'Hedione (Metil Dihidrojasmonato)', 'Incienso / Frankincense', 'Cashmeran'],
            propiedades: 'Innovación, liberación, visión cósmica',
            nota_dominante: 'Fondo'
        },
        'Piscis': {
            elemento: 'Agua',
            chakra: 'Corona',
            moleculas: ['Jazmín Sambac Absoluto', 'Ylang Ylang Extra', 'Sándalo Australiano', 'Ambrettolide'],
            propiedades: 'Misticismo, compasión, conexión espiritual',
            nota_dominante: 'Corazón'
        }
    },

    elementos: {
        'Fuego': {
            moleculas_potenciadoras: ['ISO E Super', 'Ambroxan', 'Aldehído C12 MNA', 'Neroli (Azahar)', 'Incienso / Frankincense'],
            intention: 'Elevar la acción, coraje, vitalidad y liderazgo'
        },
        'Tierra': {
            moleculas_potenciadoras: ['Sándalo Australiano', 'Vetiver Haití', 'Patchouli Envejecido', 'Cetalox (Ambrox)', 'Labdanum Absoluto'],
            intention: 'Elevar la estabilidad, manifestación y arraigo'
        },
        'Aire': {
            moleculas_potenciadoras: ['Hedione (Metil Dihidrojasmonato)', 'Bergamota FCF', 'Neroli (Azahar)', 'Rosa Absoluto (Bulgaria)', 'Galaxolide'],
            intention: 'Elevar la comunicación, claridad mental y relaciones'
        },
        'Agua': {
            moleculas_potenciadoras: ['Jazmín Sambac Absoluto', 'Rosa Absoluto (Bulgaria)', 'Ylang Ylang Extra', 'Ambrettolide', 'Muscone (Almizcle)'],
            intention: 'Elevar la intuición, emociones y sensibilidad'
        }
    }
};

// SISTEMA DE GESTIÓN DE EXQUISIT PRO
class ExquisitPro {
    constructor() {
        this.seccionActual = 'alquimia';
        this.formulaActual = null;
        this.init();
    }

    init() {
        this.configurarNavegacion();
        this.renderizarSeccion();
    }

    configurarNavegacion() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const seccion = e.target.closest('.nav-item').dataset.section;
                this.cambiarSeccion(seccion);
            });
        });
    }

    cambiarSeccion(seccion) {
        this.seccionActual = seccion;

        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === seccion) {
                btn.classList.add('active');
            }
        });

        // Renderizar nueva sección
        this.renderizarSeccion();
    }

    renderAlquimiaAstral() {
        const signos = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

        return `
            <section class="section active">
                <div class="glass-card">
                    <h2 class="card-title">🔮 Alquimia Astral Transformadora</h2>
                    <p class="card-subtitle">Perfumes que equilibran y empoderan tu carta natal usando moléculas profesionales</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; position: relative; z-index: 1; margin-top: 3rem;">
                        <!-- Columna Izquierda: Carta Natal -->
                        <div>
                            <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.8rem; margin-bottom: 2rem; letter-spacing: 0.1em;">TU CARTA NATAL</h3>
                            
                            <div style="background: rgba(13, 13, 13, 0.5); border: 2px solid var(--copper); padding: 2rem; margin-bottom: 2rem;">
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; color: var(--parchment); margin-bottom: 0.5rem; font-size: 0.85rem; letter-spacing: 0.1em;">☉ SOL (Tu Esencia)</label>
                                    <select id="signo-sol" style="width: 100%; padding: 0.75rem; background: rgba(201, 169, 97, 0.1); border: 1px solid var(--gold); color: var(--parchment); font-family: 'JetBrains Mono', monospace;">
                                        <option value="">Selecciona...</option>
                                        ${signos.map(s => `<option value="${s}">${s}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; color: var(--parchment); margin-bottom: 0.5rem; font-size: 0.85rem; letter-spacing: 0.1em;">☾ LUNA (Tus Emociones)</label>
                                    <select id="signo-luna" style="width: 100%; padding: 0.75rem; background: rgba(201, 169, 97, 0.1); border: 1px solid var(--gold); color: var(--parchment); font-family: 'JetBrains Mono', monospace;">
                                        <option value="">Selecciona...</option>
                                        ${signos.map(s => `<option value="${s}">${s}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; color: var(--parchment); margin-bottom: 0.5rem; font-size: 0.85rem; letter-spacing: 0.1em;">↑ ASCENDENTE (Tu Máscara)</label>
                                    <select id="signo-asc" style="width: 100%; padding: 0.75rem; background: rgba(201, 169, 97, 0.1); border: 1px solid var(--gold); color: var(--parchment); font-family: 'JetBrains Mono', monospace;">
                                        <option value="">Selecciona...</option>
                                        ${signos.map(s => `<option value="${s}">${s}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <div id="balance-elementos" style="background: rgba(201, 169, 97, 0.05); border: 1px solid var(--copper); padding: 2rem; margin-bottom: 2rem; display: none;">
                                <h4 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.3rem; margin-bottom: 1.5rem; letter-spacing: 0.1em;">BALANCE ELEMENTAL</h4>
                                <div id="elementos-chart"></div>
                            </div>
                            
                            <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.8rem; margin: 3rem 0 2rem; letter-spacing: 0.1em;">INTENCIÓN TRANSFORMADORA</h3>
                            
                            <div style="background: rgba(13, 13, 13, 0.5); border: 2px solid var(--gold); padding: 2rem;">
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; color: var(--gold); margin-bottom: 1rem; font-size: 0.9rem; letter-spacing: 0.1em;">¿Qué deseas elevar o equilibrar?</label>
                                    <select id="intencion" style="width: 100%; padding: 1rem; background: rgba(201, 169, 97, 0.1); border: 1px solid var(--gold); color: var(--parchment); font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;">
                                        <option value="">Selecciona tu intención...</option>
                                        <option value="elevar_fuego">🔥 Elevar mi Fuego (Acción, Coraje, Liderazgo)</option>
                                        <option value="elevar_tierra">🌍 Elevar mi Tierra (Estabilidad, Manifestación)</option>
                                        <option value="elevar_aire">💨 Elevar mi Aire (Comunicación, Claridad)</option>
                                        <option value="elevar_agua">💧 Elevar mi Agua (Intuición, Emociones)</option>
                                        <option value="potenciar_sol">☉ Potenciar mi Sol (Esencia Personal)</option>
                                        <option value="armonizar_luna">☾ Armonizar mi Luna (Mundo Emocional)</option>
                                        <option value="equilibrio_total">☯ Equilibrio Total (Armonía Elemental)</option>
                                    </select>
                                </div>
                                
                                <button id="btn-generar-alquimico" 
                                        style="width: 100%; padding: 1.25rem; background: linear-gradient(135deg, var(--gold), var(--copper)); border: none; color: var(--obsidian); font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 600; cursor: pointer; letter-spacing: 0.15em; transition: all 0.3s;"
                                        onmouseenter="this.style.transform='scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(201, 169, 97, 0.5)'"
                                        onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='none'"
                                        disabled>
                                    ⚗ CREAR MI PERFUME TRANSFORMADOR
                                </button>
                            </div>
                        </div>
                        
                        <!-- Columna Derecha: Fórmula Generada -->
                        <div>
                            <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.8rem; margin-bottom: 2rem; letter-spacing: 0.1em;">FÓRMULA ALQUÍMICA</h3>
                            <div id="formula-alquimica" style="min-height: 500px; background: rgba(13, 13, 13, 0.5); border: 2px solid var(--gold); padding: 2rem;">
                                <p style="opacity: 0.5; text-align: center; padding: 4rem 2rem; font-style: italic; line-height: 2;">
                                    Completa tu carta natal y selecciona tu intención para que las moléculas alquímicas se revelen...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    renderizarSeccion() {
        const contenido = document.getElementById('content');

        switch (this.seccionActual) {
            case 'alquimia':
                contenido.innerHTML = this.renderAlquimiaAstral();
                this.configurarAlquimiaAstral();
                break;
            case 'formulador':
                contenido.innerHTML = this.renderFormulador();
                this.configurarFormulador();
                break;
            case 'inventario':
                contenido.innerHTML = this.renderInventario();
                break;
            case 'acordes':
                contenido.innerHTML = this.renderAcordes();
                this.configurarAcordes();
                break;
            case 'calculadora':
                contenido.innerHTML = this.renderCalculadora();
                this.configurarCalculadora();
                break;
        }
    }

    renderFormulador() {
        return `
            <section class="section active">
                <div class="glass-card">
                    <h2 class="card-title">⚗ Laboratorio del Formulador</h2>
                    <p class="card-subtitle">Crea fragancias de nicho profesionales con tu paleta molecular</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; position: relative; z-index: 1; margin-top: 3rem;">
                        <div>
                            <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.5rem; margin-bottom: 2rem; letter-spacing: 0.1em;">SELECCIONAR BASE DE ACORDE</h3>
                            <div id="acordes-lista">
                                ${Object.entries(ACORDES_PROFESIONALES).map(([nombre, data]) => `
                                    <div class="acorde-opcion" style="background: rgba(201, 169, 97, 0.05); border: 1px solid var(--gold); padding: 1.5rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.3s;">
                                        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; color: var(--gold); margin-bottom: 0.5rem;">${nombre}</div>
                                        <div style="font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">${data.familia}</div>
                                        <div style="font-size: 0.85rem; opacity: 0.7; line-height: 1.6;">${data.descripcion}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 1.5rem; margin-bottom: 2rem; letter-spacing: 0.1em;">TU FÓRMULA</h3>
                            <div id="formula-display" style="min-height: 400px; background: rgba(13, 13, 13, 0.5); border: 2px solid var(--copper); padding: 2rem;">
                                <p style="opacity: 0.5; text-align: center; padding: 3rem; font-style: italic;">Selecciona un acorde para comenzar...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    configurarFormulador() {
        document.querySelectorAll('.acorde-opcion').forEach((opcion, index) => {
            opcion.addEventListener('click', () => {
                const nombreAcorde = Object.keys(ACORDES_PROFESIONALES)[index];
                this.mostrarFormulaAcorde(nombreAcorde);

                // Highlight seleccionado
                document.querySelectorAll('.acorde-opcion').forEach(o => {
                    o.style.background = 'rgba(201, 169, 97, 0.05)';
                });
                opcion.style.background = 'rgba(201, 169, 97, 0.15)';
            });

            opcion.addEventListener('mouseenter', function () {
                if (this.style.background !== 'rgba(201, 169, 97, 0.15)') {
                    this.style.background = 'rgba(201, 169, 97, 0.1)';
                }
                this.style.transform = 'translateX(10px)';
            });

            opcion.addEventListener('mouseleave', function () {
                if (this.style.background !== 'rgba(201, 169, 97, 0.15)') {
                    this.style.background = 'rgba(201, 169, 97, 0.05)';
                }
                this.style.transform = 'translateX(0)';
            });
        });
    }

    mostrarFormulaAcorde(nombreAcorde) {
        const acorde = ACORDES_PROFESIONALES[nombreAcorde];
        const display = document.getElementById('formula-display');
        this.formulaActual = acorde;

        let costeTotal = 0;
        const formulaHTML = Object.entries(acorde.formula).map(([molecula, porcentaje]) => {
            const datos = MOLECULAS[molecula];
            const coste = (datos.coste / datos.ml) * (porcentaje / 10); // Aproximado
            costeTotal += coste;

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(201, 169, 97, 0.2);">
                    <div style="flex: 1;">
                        <div style="font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--gold); margin-bottom: 0.25rem;">${molecula}</div>
                        <div style="font-size: 0.7rem; opacity: 0.6;">${datos.perfil}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.8rem; font-weight: 600; color: var(--gold-bright);">${porcentaje}%</div>
                        <div style="font-size: 0.7rem; opacity: 0.6;">≈€${coste.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');

        display.innerHTML = `
            <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--gold);">
                <div style="font-family: 'Cinzel', serif; font-size: 2rem; color: var(--gold); margin-bottom: 0.5rem; letter-spacing: 0.1em;">${nombreAcorde}</div>
                <div style="font-style: italic; opacity: 0.8; margin-bottom: 0.5rem;">${acorde.descripcion}</div>
                <div style="font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em;">
                    ${acorde.familia} · Intensidad ${acorde.intensidad}
                </div>
            </div>
            ${formulaHTML}
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid var(--gold); text-align: right;">
                <div style="font-family: 'Cinzel', serif; font-size: 1.3rem;">
                    Coste Estimado: <span style="color: var(--gold); font-weight: 600;">€${costeTotal.toFixed(2)}</span> / 10ml concentrado
                </div>
                <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 0.5rem;">
                    * Precio basado en tu inventario actual
                </div>
            </div>
        `;
    }

    renderInventario() {
        // Agrupar por tipo
        const sinteticas = Object.entries(MOLECULAS).filter(([, data]) => data.tipo === 'Sintética');
        const naturales = Object.entries(MOLECULAS).filter(([, data]) => data.tipo === 'Natural');

        return `
            <section class="section active">
                <div class="glass-card">
                    <h2 class="card-title">🧪 Inventario Molecular</h2>
                    <p class="card-subtitle">Tu órgano de perfumista profesional</p>
                    
                    <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 2rem; margin: 3rem 0 2rem; letter-spacing: 0.1em; position: relative; z-index: 1;">
                        MOLÉCULAS SINTÉTICAS (${sinteticas.length})
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; position: relative; z-index: 1; margin-bottom: 4rem;">
                        ${sinteticas.map(([nombre, data]) => this.renderMoleculaCard(nombre, data)).join('')}
                    </div>
                    
                    <h3 style="color: var(--gold); font-family: 'Cinzel', serif; font-size: 2rem; margin: 3rem 0 2rem; letter-spacing: 0.1em; position: relative; z-index: 1;">
                        ABSOLUTOS & EXTRACTOS NATURALES (${naturales.length})
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; position: relative; z-index: 1;">
                        ${naturales.map(([nombre, data]) => this.renderMoleculaCard(nombre, data)).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    renderMoleculaCard(nombre, data) {
        const precioML = (data.coste / data.ml).toFixed(2);

        return `
            <div style="background: rgba(201, 169, 97, 0.05); border: 2px solid var(--copper); padding: 2rem; transition: all 0.4s;" 
                 onmouseenter="this.style.transform='translateY(-5px) scale(1.02)'; this.style.borderColor='var(--gold)'; this.style.boxShadow='0 20px 40px rgba(201, 169, 97, 0.2)'"
                 onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.borderColor='var(--copper)'; this.style.boxShadow='none'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="font-family: 'Cinzel', serif; font-size: 1.3rem; color: var(--gold); flex: 1; line-height: 1.3;">${nombre}</div>
                    <div style="font-size: 0.7rem; background: var(--bronze); padding: 0.3rem 0.75rem; border-radius: 2px; white-space: nowrap; margin-left: 0.5rem;">${data.tipo}</div>
                </div>
                
                <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); opacity: 0.8; margin-bottom: 0.75rem;">
                    ${data.familia}
                </div>
                
                <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 1rem; line-height: 1.6; min-height: 60px;">
                    ${data.perfil}
                </div>
                
                <div style="border-top: 1px solid rgba(201, 169, 97, 0.3); padding-top: 1rem; margin-top: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.75rem; margin-bottom: 0.75rem;">
                        <div><span style="opacity: 0.6;">Stock:</span> <strong>${data.ml}ml</strong></div>
                        <div><span style="opacity: 0.6;">Coste:</span> <strong>€${data.coste}</strong></div>
                        <div><span style="opacity: 0.6;">€/ml:</span> <strong>€${precioML}</strong></div>
                        <div><span style="opacity: 0.6;">Fuerza:</span> <strong>${data.fuerza}</strong></div>
                    </div>
                    <div style="font-size: 0.7rem; opacity: 0.6; font-style: italic; border-top: 1px solid rgba(201, 169, 97, 0.2); padding-top: 0.75rem;">
                        ${data.notas}
                    </div>
                </div>
            </div>
        `;
    }

    renderAcordes() {
        return `
            <section class="section active">
                <div class="glass-card">
                    <h2 class="card-title">🌹 Acordes Profesionales</h2>
                    <p class="card-subtitle">Armonías moleculares pre-compuestas</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 3rem; position: relative; z-index: 1; margin-top: 3rem;">
                        ${Object.entries(ACORDES_PROFESIONALES).map(([nombre, data]) => `
                            <div style="background: rgba(201, 169, 97, 0.05); border: 2px solid var(--gold); padding: 2.5rem; transition: all 0.4s;"
                                 onmouseenter="this.style.transform='scale(1.05)'; this.style.boxShadow='0 30px 60px rgba(201, 169, 97, 0.3)'"
                                 onmouseleave="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                                <h3 style="font-family: 'Cinzel', serif; font-size: 1.8rem; color: var(--gold); margin-bottom: 1rem; letter-spacing: 0.1em;">
                                    ${nombre}
                                </h3>
                                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 1rem;">
                                    ${data.familia} · ${data.intensidad}
                                </div>
                                <p style="font-style: italic; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9;">
                                    ${data.descripcion}
                                </p>
                                
                                <div style="border-top: 1px solid rgba(201, 169, 97, 0.3); padding-top: 1.5rem;">
                                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); margin-bottom: 1rem;">
                                        Composición:
                                    </div>
                                    ${Object.entries(data.formula).map(([mol, pct]) => `
                                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(201, 169, 97, 0.1);">
                                            <span style="font-size: 0.85rem;">${mol}</span>
                                            <span style="font-weight: 600; color: var(--gold);">${pct}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    configurarAcordes() {
        // Interactividad ya configurada en el HTML inline
    }

    renderCalculadora() {
        return `
            <section class="section active">
                <div class="glass-card">
                    <h2 class="card-title">📊 Calculadora Profesional</h2>
                    <p class="card-subtitle">Herramientas de formulación compatibles con IFRA</p>
                    
                    <div style="max-width: 700px; margin: 0 auto; position: relative; z-index: 1; margin-top: 3rem;">
                        <div style="margin-bottom: 2.5rem;">
                            <label style="display: block; color: var(--gold); margin-bottom: 0.75rem; font-family: 'Cinzel', serif; font-size: 1rem; letter-spacing: 0.1em;">VOLUMEN TOTAL (ML)</label>
                            <input type="number" id="calc-volumen" value="50" min="1" max="1000"
                                   style="width: 100%; padding: 1.25rem; background: rgba(13, 13, 13, 0.5); border: 2px solid var(--copper); color: var(--parchment); font-size: 1.5rem; font-family: 'JetBrains Mono', monospace; text-align: center;">
                        </div>
                        
                        <div style="margin-bottom: 2.5rem;">
                            <label style="display: block; color: var(--gold); margin-bottom: 0.75rem; font-family: 'Cinzel', serif; font-size: 1rem; letter-spacing: 0.1em;">CONCENTRACIÓN</label>
                            <select id="calc-concentracion"
                                    style="width: 100%; padding: 1.25rem; background: rgba(13, 13, 13, 0.5); border: 2px solid var(--copper); color: var(--parchment); font-size: 1.2rem; cursor: pointer;">
                                <option value="5">Eau de Toilette (5-8%)</option>
                                <option value="15">Eau de Parfum (15%)</option>
                                <option value="20" selected>Extrait de Parfum (20%)</option>
                                <option value="25">Parfum (25%)</option>
                                <option value="30">Huile de Parfum (30%)</option>
                            </select>
                        </div>
                        
                        <div id="calc-resultado" style="background: rgba(201, 169, 97, 0.1); border: 2px solid var(--gold); padding: 2.5rem; margin-top: 2.5rem;">
                            <div style="font-family: 'Cinzel', serif; font-size: 1.8rem; color: var(--gold); margin-bottom: 2rem; text-align: center; letter-spacing: 0.1em;">
                                RESULTADOS
                            </div>
                            <div id="calc-output"></div>
                        </div>
                        
                        <div style="margin-top: 2rem; padding: 2rem; background: rgba(13, 13, 13, 0.3); border: 1px solid rgba(201, 169, 97, 0.2);">
                            <div style="font-size: 0.75rem; opacity: 0.7; line-height: 1.8;">
                                <strong style="color: var(--gold);">Nota:</strong> Estas son proporciones estándar. Para moléculas potentes como Ambroxan o Muscone, ajusta según tu criterio profesional. 
                                <br><br>
                                <strong style="color: var(--gold);">División estándar del concentrado:</strong>
                                <br>• Notas de Salida: 10-15%
                                <br>• Notas de Corazón: 25-35%
                                <br>• Notas de Fondo: 50-65%
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    configurarCalculadora() {
        const inputVolumen = document.getElementById('calc-volumen');
        const selectConcentracion = document.getElementById('calc-concentracion');
        const output = document.getElementById('calc-output');

        const calcular = () => {
            const volumen = parseFloat(inputVolumen.value) || 50;
            const concentracion = parseInt(selectConcentracion.value) || 20;

            const volumenConcentrado = (volumen * concentracion) / 100;
            const volumenAlcohol = volumen - volumenConcentrado;
            const gotas = Math.round(volumenConcentrado * 20); // Aprox 20 gotas/ml

            // División del concentrado
            const notasSalida = volumenConcentrado * 0.125; // 12.5%
            const notasCorazon = volumenConcentrado * 0.30; // 30%
            const notasFondo = volumenConcentrado * 0.575; // 57.5%

            output.innerHTML = `
                <div style="line-height: 2.2; font-size: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 2px solid rgba(201, 169, 97, 0.3);">
                        <div>
                            <div style="font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em;">Concentrado Perfumístico</div>
                            <div style="font-family: 'Cinzel', serif; font-size: 2.5rem; color: var(--gold); font-weight: 600;">
                                ${volumenConcentrado.toFixed(1)}<span style="font-size: 1.2rem;">ml</span>
                            </div>
                            <div style="font-size: 0.75rem; opacity: 0.6;">≈ ${gotas} gotas</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em;">Alcohol 96°</div>
                            <div style="font-family: 'Cinzel', serif; font-size: 2.5rem; color: var(--gold); font-weight: 600;">
                                ${volumenAlcohol.toFixed(1)}<span style="font-size: 1.2rem;">ml</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); margin-bottom: 1rem;">
                        División del Concentrado (${volumenConcentrado.toFixed(1)}ml total):
                    </div>
                    
                    <div style="margin-left: 1rem; font-size: 0.95rem; line-height: 1.8;">
                        <div>→ <strong style="color: var(--gold-bright);">Notas de Salida:</strong> ${notasSalida.toFixed(2)}ml (12.5%)</div>
                        <div>→ <strong style="color: var(--gold-bright);">Notas de Corazón:</strong> ${notasCorazon.toFixed(2)}ml (30%)</div>
                        <div>→ <strong style="color: var(--gold-bright);">Notas de Fondo:</strong> ${notasFondo.toFixed(2)}ml (57.5%)</div>
                    </div>
                </div>
            `;
        };

        inputVolumen.addEventListener('input', calcular);
        selectConcentracion.addEventListener('change', calcular);
        calcular(); // Cálculo inicial
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new ExquisitPro();
    console.log('⚗ EXQUISIT PRO - Sistema Profesional de Perfumería de Nicho Inicializado');
    console.log(`📊 Base de datos: ${Object.keys(MOLECULAS).length} moléculas cargadas`);
    console.log(`🌹 Acordes disponibles: ${Object.keys(ACORDES_PROFESIONALES).length}`);
});
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
