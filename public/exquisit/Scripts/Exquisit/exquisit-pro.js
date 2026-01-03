// EXQUISIT PRO - Sistema Profesional de Perfumería de Nicho
// Base de datos COMPLETA de moléculas de tu inventario real

// ═══════════════════════════════════════════════════════════
// BASE DE DATOS ACTUALIZADA DE MOLÉCULAS
// Inventario Real Actualizado - Enero 2025
// Fuente: Ingredientes de Perfumería y sus Precios por Pedido-2.xlsx
// ═══════════════════════════════════════════════════════════

const MOLECULAS = {
    //===== TU INVENTARIO REAL - MOLÉCULAS SINTÉTICAS =====

    'Iso E Super': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Cedro, ámbar, aterciopelado, second-skin',
        fuerza: 'Media-Fuerte',
        coste: 8.30,
        ml: 30,
        notas: 'La molécula invisible - Crea volumen y radiancia',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Ambroxan': {
        tipo: 'Sintética',
        familia: 'Ambarada',
        perfil: 'Ámbar gris, mineral, salado-dulce, seco',
        fuerza: 'Muy Fuerte',
        coste: 53.80,
        ml: 30,
        notas: 'Ámbar gris moderno - Longevidad extrema',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15076'
    },

    'Cashmeran': {
        tipo: 'Sintética',
        familia: 'Amaderada-Almizclada',
        perfil: 'Cachemira, pino, especiado, cálido',
        fuerza: 'Media',
        coste: 8.06,
        ml: 10,
        notas: 'Híbrido único amaderado-almizclado',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15076'
    },

    'Ambrettolide': {
        tipo: 'Sintética',
        familia: 'Almizcle',
        perfil: 'Almizcle ambarado, dulce, floral',
        fuerza: 'Media-Fuerte',
        coste: 10.70,
        ml: 10,
        notas: 'Macrocíclico de lujo - Extrema suavidad',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #16732'
    },

    'Ambrocenide 10% DPG': {
        tipo: 'Sintética',
        familia: 'Ambarada',
        perfil: 'Ámbar, dulce, cálido, marino',
        fuerza: 'Muy Fuerte',
        coste: 9.80,
        ml: 10,
        notas: 'Base ambarada potente en dilución',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #16732'
    },

    'Timbersilk': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Madera sedosa, aterciopelada, suave',
        fuerza: 'Media',
        coste: 4.95,
        ml: 10,
        notas: 'Textura de madera sedosa',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #16732'
    },

    'Trimofix': {
        tipo: 'Sintética',
        familia: 'Almizclada',
        perfil: 'Almizcle limpio, fijador, radiante',
        fuerza: 'Media',
        coste: 6.47,
        ml: 10,
        notas: 'Excelente fijador',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #16732'
    },

    'Peomosa': {
        tipo: 'Sintética',
        familia: 'Floral',
        perfil: 'Peonía, rosa, fresco, radiante',
        fuerza: 'Media-Fuerte',
        coste: 10.50,
        ml: 10,
        notas: 'Molécula captive de peonía',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #16732'
    },

    'Koavone': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Madera, cedro, cálido, especiado',
        fuerza: 'Media-Fuerte',
        coste: 8.08,
        ml: 30,
        notas: 'Molécula amaderada rica',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Safraleine': {
        tipo: 'Sintética',
        familia: 'Especiada-Cuero',
        perfil: 'Azafrán, cuero, especiado, seco',
        fuerza: 'Fuerte',
        coste: 11.17,
        ml: 10,
        notas: 'Nota de azafrán y cuero',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Aurantiol': {
        tipo: 'Sintética',
        familia: 'Floral-Cítrica',
        perfil: 'Flor de naranjo, fresco, luminoso',
        fuerza: 'Media',
        coste: 15.00,
        ml: 30,
        notas: 'Nota neroli sintética',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Piconia': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Pino, resina, verde, fresco',
        fuerza: 'Media',
        coste: 4.80,
        ml: 10,
        notas: 'Nota de pino y resina',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Stemone': {
        tipo: 'Sintética',
        familia: 'Almizclada',
        perfil: 'Almizcle, limpio, radiante, moderno',
        fuerza: 'Media',
        coste: 7.40,
        ml: 30,
        notas: 'Almizcle limpio moderno',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15118'
    },

    'Ethyl Maltol': {
        tipo: 'Sintética',
        familia: 'Gourmand',
        perfil: 'Algodón de azúcar, dulce, caramelizado',
        fuerza: 'Muy Fuerte',
        coste: 11.00,
        ml: 30,
        notas: 'Efecto caramelizado intenso - Uso mínimo',
        ifra: 'Restringido',
        proveedor: '#16733'
    },

    'Ethyl Vanillin': {
        tipo: 'Sintética',
        familia: 'Gourmand',
        perfil: 'Vainilla, dulce, potente, cremoso',
        fuerza: 'Muy Fuerte',
        coste: 14.76,
        ml: 50,
        notas: '3x más potente que vainilla natural',
        ifra: 'Sin restricciones',
        proveedor: '20780'
    },

    'gamma-Octalactone': {
        tipo: 'Sintética',
        familia: 'Gourmand-Láctea',
        perfil: 'Coco, melocotón, cremoso, lácteo',
        fuerza: 'Fuerte',
        coste: 14.80,
        ml: 30,
        notas: 'Nota láctea-frutal',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15118'
    },

    'Dihydromyrcenol': {
        tipo: 'Sintética',
        familia: 'Cítrica-Floral',
        perfil: 'Limón, lavanda, fresco, transparente',
        fuerza: 'Media',
        coste: 10.00,
        ml: 30,
        notas: 'Molécula de frescura y difusión',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Ionone Alpha 80%': {
        tipo: 'Sintética',
        familia: 'Floral-Violeta',
        perfil: 'Violeta, iris, empolvado, elegante',
        fuerza: 'Media-Fuerte',
        coste: 6.25,
        ml: 10,
        notas: 'Nota de violeta e iris',
        ifra: 'Sin restricciones',
        proveedor: 'OSISSMYBE'
    },

    'Linalool': {
        tipo: 'Sintética',
        familia: 'Floral-Lavanda',
        perfil: 'Lavanda, fresco, floral, limpio',
        fuerza: 'Media',
        coste: 6.25,
        ml: 10,
        notas: 'Componente principal de lavanda',
        ifra: 'Verificar alérgenos',
        proveedor: 'OSISSMYBE'
    },

    'Benzyl Acetone': {
        tipo: 'Sintética',
        familia: 'Floral',
        perfil: 'Jazmín, frutal, dulce, narcótico',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 10,
        notas: 'Nota de jazmín dulce',
        ifra: 'Sin restricciones',
        proveedor: 'OSISSMYBE'
    },

    'Benzaldehyde': {
        tipo: 'Sintética',
        familia: 'Aromática',
        perfil: 'Almendra amarga, cereza, mazapán',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 30,
        notas: 'Nota de almendra amarga',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Maritima': {
        tipo: 'Sintética',
        familia: 'Acuática-Marina',
        perfil: 'Marino, ozónico, salado, fresco',
        fuerza: 'Fuerte',
        coste: 15.00,
        ml: 10,
        notas: 'Efecto brisa marina',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Scentental': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Madera, sándalo, cremoso, suave',
        fuerza: 'Media-Fuerte',
        coste: 10.00,
        ml: 10,
        notas: 'Nota de sándalo sintética',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Calone (Watermelon Ketone)': {
        tipo: 'Sintética',
        familia: 'Acuática',
        perfil: 'Sandía, marino, ozónico, fresco',
        fuerza: 'Fuerte',
        coste: 9.80,
        ml: 10,
        notas: 'Nota acuática emblemática',
        ifra: 'Sin restricciones',
        proveedor: '#15328'
    },

    'Black Agar Givco 215': {
        tipo: 'Sintética',
        familia: 'Amaderada',
        perfil: 'Oud, ahumado, medicinal, profundo',
        fuerza: 'Extrema',
        coste: 26.80,
        ml: 10,
        notas: 'Base de oud sintética Givaudan',
        ifra: 'Sin restricciones',
        proveedor: '#15328'
    },

    'Geosmina 1% DPG': {
        tipo: 'Sintética',
        familia: 'Terrosa',
        perfil: 'Tierra mojada, raíz de remolacha, mineral',
        fuerza: 'Extrema',
        coste: 18.00,
        ml: 5,
        notas: 'Nota de tierra húmeda - Uso MÍNIMO',
        ifra: 'Uso controlado',
        proveedor: '#15328'
    },

    'Aldehyde C18': {
        tipo: 'Sintética',
        familia: 'Aldehídica',
        perfil: 'Ceroso, floral, limpio, graso',
        fuerza: 'Media',
        coste: 5.20,
        ml: 100,
        notas: 'Aldehído graso tipo vela',
        ifra: 'Uso moderado',
        proveedor: '10113835'
    },

    'Isobutyl-Quinoline 40% DPG': {
        tipo: 'Sintética',
        familia: 'Cuero',
        perfil: 'Cuero, ahumado, animalesco, seco',
        fuerza: 'Muy Fuerte',
        coste: 8.40,
        ml: 10,
        notas: 'Nota cuero intenso',
        ifra: 'Uso controlado',
        proveedor: 'Bello #15115'
    },

    'Castoreum Givco 116/5': {
        tipo: 'Sintética',
        familia: 'Animalesca',
        perfil: 'Castóreo, cuero, animalesco, terroso',
        fuerza: 'Extrema',
        coste: 29.00,
        ml: 10,
        notas: 'Base animalesca de lujo Givaudan',
        ifra: 'Uso controlado',
        proveedor: 'Bello #15115'
    },

    'Civette Givco 208': {
        tipo: 'Sintética',
        familia: 'Animalesca',
        perfil: 'Civeta, fecal, animalesco, intenso',
        fuerza: 'Extrema',
        coste: 24.30,
        ml: 10,
        notas: 'Base animalesca potente Givaudan',
        ifra: 'Uso controlado',
        proveedor: 'Bello #15115'
    },

    'Guaiacol': {
        tipo: 'Sintética',
        familia: 'Ahumada',
        perfil: 'Ahumado, fenólico, medicinal, cuero',
        fuerza: 'Muy Fuerte',
        coste: 9.00,
        ml: 10,
        notas: 'Nota ahumada intensa',
        ifra: 'Restringido',
        proveedor: 'Bello #15115'
    },

    'Antranilato de Metilo': {
        tipo: 'Sintética',
        familia: 'Frutal',
        perfil: 'Uva, naranja, dulce, afrutado',
        fuerza: 'Fuerte',
        coste: 5.50,
        ml: 10,
        notas: 'Nota de uva Concord',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Hedione': {
        tipo: 'Sintética',
        familia: 'Floral-Jazmín',
        perfil: 'Jazmín transparente, luminoso, radiante, difusivo',
        fuerza: 'Media-Fuerte',
        coste: 12.00,
        ml: 30,
        notas: 'Metil Dihidrojasmonato - Molécula radiante icónica de Dior Eau Sauvage',
        ifra: 'Sin restricciones',
        proveedor: 'Estimado'
    },

    //===== TU INVENTARIO REAL - ACEITES ESENCIALES Y ABSOLUTOS =====

    'Vetiver Haití': {
        tipo: 'Natural',
        familia: 'Amaderada-Terrosa',
        perfil: 'Raíces, tierra, ahumado-verde, profundo',
        fuerza: 'Fuerte',
        coste: 19.50,
        ml: 10,
        notas: 'El mejor vetiver del mundo - Oscuro y complejo',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Absoluto de Tabaco 10% DPG': {
        tipo: 'Natural',
        familia: 'Aromática',
        perfil: 'Tabaco, miel, curado, especiado',
        fuerza: 'Muy Fuerte',
        coste: 13.00,
        ml: 10,
        notas: 'Hoja de tabaco curado - Profundidad única',
        ifra: 'Sin restricciones mayores',
        proveedor: 'Bello #16732'
    },

    'Abedul Rectificado 5% Alcohol': {
        tipo: 'Natural',
        familia: 'Amaderada',
        perfil: 'Abedul, cuero, ahumado, ruso',
        fuerza: 'Fuerte',
        coste: 3.00,
        ml: 5,
        notas: 'Nota cuero rusa',
        ifra: 'Restringido',
        proveedor: 'Bello #16732'
    },

    'Café Arábica': {
        tipo: 'Natural',
        familia: 'Gourmand',
        perfil: 'Café, tostado, amargo, intenso',
        fuerza: 'Muy Fuerte',
        coste: 21.75,
        ml: 5,
        notas: 'Extracto de café arábica',
        ifra: 'Sin restricciones',
        proveedor: 'Bello #15115'
    },

    'Cacao Absolue 30% ETH': {
        tipo: 'Natural',
        familia: 'Gourmand',
        perfil: 'Cacao, chocolate, rico, profundo',
        fuerza: 'Muy Fuerte',
        coste: 25.00,
        ml: 10,
        notas: 'Absoluto de cacao en alcohol',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Encens Resinoide 100% P&N': {
        tipo: 'Natural',
        familia: 'Resinosa',
        perfil: 'Incienso, balsámico, sagrado, profundo',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 10,
        notas: 'Resinoide de incienso puro',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Jengibre': {
        tipo: 'Natural',
        familia: 'Especiada',
        perfil: 'Jengibre, cítrico, picante, fresco',
        fuerza: 'Media',
        coste: 13.30,
        ml: 30,
        notas: 'Aceite esencial de jengibre',
        ifra: 'Verificar alérgenos',
        proveedor: 'Bello #15115'
    },

    'Limón': {
        tipo: 'Natural',
        familia: 'Cítrica',
        perfil: 'Limón, fresco, ácido, brillante',
        fuerza: 'Ligera',
        coste: 5.20,
        ml: 10,
        notas: 'Aceite esencial de limón',
        ifra: 'Fototóxico - Limitar',
        proveedor: 'Bello #15115'
    },

    'Lima (exprimida)': {
        tipo: 'Natural',
        familia: 'Cítrica',
        perfil: 'Lima, fresco, ácido, verde',
        fuerza: 'Ligera',
        coste: 5.18,
        ml: 10,
        notas: 'Aceite esencial de lima',
        ifra: 'Fototóxico - Limitar',
        proveedor: 'Bello #15115'
    },

    'Pomelo Blanco': {
        tipo: 'Natural',
        familia: 'Cítrica',
        perfil: 'Pomelo, cítrico, amargo, fresco',
        fuerza: 'Media',
        coste: 9.50,
        ml: 10,
        notas: 'Aceite esencial de pomelo',
        ifra: 'Fototóxico - Limitar',
        proveedor: '#15328'
    },

    'Aceite Esencial de Aguaribay o Pimienta Rosa': {
        tipo: 'Natural',
        familia: 'Especiada',
        perfil: 'Pimienta rosa, especiado, cálido, dulce',
        fuerza: 'Media',
        coste: 6.34,
        ml: 100,
        notas: 'Pimienta rosa peruana',
        ifra: 'Sin restricciones',
        proveedor: '10113835'
    },

    'Orris - Iris Germánica - Absoluto': {
        tipo: 'Natural',
        familia: 'Floral-Empolvada',
        perfil: 'Iris, empolvado, elegante, aterciopelado',
        fuerza: 'Fuerte',
        coste: 10.80,
        ml: 10,
        notas: 'Ingrediente de lujo extremo',
        ifra: 'Verificar alérgenos',
        proveedor: '20688'
    },

    'Extracto de Haba Tonka - Tintura': {
        tipo: 'Natural',
        familia: 'Aromática',
        perfil: 'Haba tonka, vainilla, heno, almendrada',
        fuerza: 'Fuerte',
        coste: 16.11,
        ml: 50,
        notas: 'Rico en cumarina natural',
        ifra: 'Restringido (cumarina)',
        proveedor: '20688'
    },

    'Aceite Esencial de Vainilla': {
        tipo: 'Natural',
        familia: 'Gourmand',
        perfil: 'Vainilla, dulce, cremoso, cálido',
        fuerza: 'Fuerte',
        coste: 7.20,
        ml: 1,
        notas: 'Vainilla natural 100%',
        ifra: 'Sin restricciones',
        proveedor: '20688'
    },

    'Aceite Esencial de Pimienta Negra': {
        tipo: 'Natural',
        familia: 'Especiada',
        perfil: 'Pimienta, picante, cálido, seco',
        fuerza: 'Media',
        coste: 7.25,
        ml: 5,
        notas: 'Pimienta negra de Madagascar',
        ifra: 'Verificar alérgenos',
        proveedor: '20688'
    },

    'Aceite Esencial de Azahar (Neroli)': {
        tipo: 'Natural',
        familia: 'Floral-Cítrica',
        perfil: 'Flor de naranjo, fresco, verde, luminoso',
        fuerza: 'Media',
        coste: 21.60,
        ml: 5,
        notas: 'Destilación de flores - Pureza absoluta',
        ifra: 'Verificar alérgenos',
        proveedor: '20688'
    },

    'Aceite Esencial de Yuzu': {
        tipo: 'Natural',
        familia: 'Cítrica',
        perfil: 'Yuzu, cítrico, exótico, complejo',
        fuerza: 'Media',
        coste: 7.95,
        ml: 1,
        notas: 'Cítrico japonés exclusivo',
        ifra: 'Fototóxico - Limitar',
        proveedor: '20688'
    },

    'Aceite Esencial de Benjuí': {
        tipo: 'Natural',
        familia: 'Resinosa',
        perfil: 'Benjuí, balsámico, vainilla, cálido',
        fuerza: 'Fuerte',
        coste: 8.33,
        ml: 10,
        notas: 'Resina dulce y fijadora',
        ifra: 'Sin restricciones',
        proveedor: '20688'
    },

    'Cumarina': {
        tipo: 'Natural',
        familia: 'Aromática',
        perfil: 'Heno, vainilla, dulce, cálido',
        fuerza: 'Media-Fuerte',
        coste: 12.00,
        ml: 50,
        notas: 'Nota de heno recién cortado',
        ifra: 'Restringido - Máx 0.5%',
        proveedor: 'Not in source'
    },

    //===== BASES AROMÁTICAS =====

    'Ambergris Base Type': {
        tipo: 'Base',
        familia: 'Ambarada',
        perfil: 'Ámbar gris, marino, cálido, animalesco',
        fuerza: 'Fuerte',
        coste: 15.00,
        ml: 30,
        notas: 'Base de ámbar gris',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Cherry Base': {
        tipo: 'Base',
        familia: 'Frutal',
        perfil: 'Cereza, dulce, frutal, jugosa',
        fuerza: 'Media',
        coste: 15.00,
        ml: 30,
        notas: 'Base de cereza',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Coconut Base': {
        tipo: 'Base',
        familia: 'Gourmand',
        perfil: 'Coco, cremoso, tropical, dulce',
        fuerza: 'Media',
        coste: 6.25,
        ml: 10,
        notas: 'Base de coco',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Orris Liquid Base Type': {
        tipo: 'Base',
        familia: 'Floral-Empolvada',
        perfil: 'Iris, empolvado, elegante, suave',
        fuerza: 'Media-Fuerte',
        coste: 10.00,
        ml: 10,
        notas: 'Base de iris líquida',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Pear Base': {
        tipo: 'Base',
        familia: 'Frutal',
        perfil: 'Pera, jugosa, fresca, dulce',
        fuerza: 'Media',
        coste: 6.25,
        ml: 10,
        notas: 'Base de pera',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Raspberry Ketone Naturel': {
        tipo: 'Natural',
        familia: 'Frutal',
        perfil: 'Frambuesa, dulce, afrutado, intenso',
        fuerza: 'Muy Fuerte',
        coste: 25.00,
        ml: 30,
        notas: 'Cetona de frambuesa natural',
        ifra: 'Restringido',
        proveedor: 'EHPUGWYYP'
    },

    'Rose Absolute Base': {
        tipo: 'Base',
        familia: 'Floral',
        perfil: 'Rosa, rica, dulce, profunda',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 10,
        notas: 'Base de rosa absoluta',
        ifra: 'Verificar alérgenos',
        proveedor: 'EHPUGWYYP'
    },

    'Tobacco Virginia Base': {
        tipo: 'Base',
        familia: 'Aromática',
        perfil: 'Tabaco, seco, especiado, curado',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 30,
        notas: 'Base de tabaco Virginia',
        ifra: 'Sin restricciones',
        proveedor: 'DGQDQOCXC'
    },

    'White Musk Base': {
        tipo: 'Base',
        familia: 'Almizclada',
        perfil: 'Almizcle limpio, suave, moderno',
        fuerza: 'Media',
        coste: 6.25,
        ml: 10,
        notas: 'Base de almizcle blanco',
        ifra: 'Sin restricciones',
        proveedor: 'EHPUGWYYP'
    },

    'Chocovan Base Type': {
        tipo: 'Base',
        familia: 'Gourmand',
        perfil: 'Chocolate, vainilla, dulce, cremoso',
        fuerza: 'Fuerte',
        coste: 6.25,
        ml: 10,
        notas: 'Base de chocolate-vainilla',
        ifra: 'Sin restricciones',
        proveedor: 'BRXMOWDVN'
    },

    'Leather Saddle Base': {
        tipo: 'Base',
        familia: 'Cuero',
        perfil: 'Cuero, ahumado, seco, animalesco',
        fuerza: 'Fuerte',
        coste: 10.00,
        ml: 30,
        notas: 'Base de cuero silla de montar',
        ifra: 'Sin restricciones',
        proveedor: 'DGQDQOCXC'
    },

    'Oud Base': {
        tipo: 'Base',
        familia: 'Amaderada',
        perfil: 'Oud, ahumado, medicinal, profundo',
        fuerza: 'Extrema',
        coste: 25.00,
        ml: 10,
        notas: 'Base de oud',
        ifra: 'Sin restricciones',
        proveedor: 'DGQDQOCXC'
    },

    'Whisky Base': {
        tipo: 'Base',
        familia: 'Aromática-Alcohólica',
        perfil: 'Whisky, ahumado, roble, cálido',
        fuerza: 'Fuerte',
        coste: 15.00,
        ml: 50,
        notas: 'Base de whisky',
        ifra: 'Sin restricciones',
        proveedor: 'DGQDQOCXC'
    },

    //===== ESENCIAS AROMÁTICAS =====

    'Esencia Aromática de Coco': {
        tipo: 'Aromática',
        familia: 'Gourmand',
        perfil: 'Coco, cremoso, dulce, tropical',
        fuerza: 'Media',
        coste: 7.77,
        ml: 1000,
        notas: 'Esencia de coco gran formato',
        ifra: 'Sin restricciones',
        proveedor: '10113835'
    },

    'Aceite de Cereza': {
        tipo: 'Natural',
        familia: 'Frutal',
        perfil: 'Cereza, dulce, frutal, jugosa',
        fuerza: 'Media',
        coste: 10.66,
        ml: 100,
        notas: 'Aceite de cereza',
        ifra: 'Sin restricciones',
        proveedor: '10113835'
    },

    'Esencia Aromática de Mimosa': {
        tipo: 'Aromática',
        familia: 'Floral-Verde',
        perfil: 'Mimosa, miel, empolvado, delicado',
        fuerza: 'Media',
        coste: 6.52,
        ml: 10,
        notas: 'Esencia de mimosa',
        ifra: 'Verificar alérgenos',
        proveedor: '20688'
    },

    'Esencia Aromática de Pera': {
        tipo: 'Aromática',
        familia: 'Frutal',
        perfil: 'Pera, jugosa, fresca, dulce',
        fuerza: 'Media',
        coste: 6.50,
        ml: 10,
        notas: 'Esencia de pera',
        ifra: 'Sin restricciones',
        proveedor: '20688'
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

const CORRESPONDENCIAS_ASTROLOGICAS = {
    signos: {
        'Aries': { elemento: 'Fuego', chakra: 'Plexo Solar', moleculas: ['Iso E Super', 'Safraleine', 'Aceite Esencial de Pimienta Negra', 'Limón'], propiedades: 'Acción, coraje, liderazgo' },
        'Tauro': { elemento: 'Tierra', chakra: 'Raíz', moleculas: ['Sándalo Australiano', 'Rose Absolute Base', 'Ethyl Vanillin', 'Aceite Esencial de Benjuí'], propiedades: 'Estabilidad, sensualidad, abundancia' },
        'Géminis': { elemento: 'Aire', chakra: 'Garganta', moleculas: ['Hedione', 'Bergamota FCF', 'Aceite Esencial de Azahar (Neroli)', 'Stemone'], propiedades: 'Comunicación, agilidad mental' },
        'Cáncer': { elemento: 'Agua', chakra: 'Corazón', moleculas: ['Jazmín Sambac Absoluto', 'Rose Absolute Base', 'Ylang Ylang Extra', 'Sándalo Australiano'], propiedades: 'Protección, intuición' },
        'Leo': { elemento: 'Fuego', chakra: 'Plexo Solar', moleculas: ['Ambroxan', 'Encens Resinoide 100% P&N', 'Aceite Esencial de Azahar (Neroli)', 'Iso E Super'], propiedades: 'Poder personal, vitalidad' },
        'Virgo': { elemento: 'Tierra', chakra: 'Plexo Solar', moleculas: ['Vetiver Haití', 'Geosmina 1% DPG', 'Lima (exprimida)', 'Aceite Esencial de Benjuí'], propiedades: 'Purificación, precisión' },
        'Libra': { elemento: 'Aire', chakra: 'Corazón', moleculas: ['Rose Absolute Base', 'Ylang Ylang Extra', 'Galaxolide', 'Hedione'], propiedades: 'Armonía, belleza' },
        'Escorpio': { elemento: 'Agua', chakra: 'Sacro', moleculas: ['Absoluto de Tabaco 10% DPG', 'Oud Base', 'Black Agar Givco 215', 'Patchouli Envejecido'], propiedades: 'Transformación, regeneración' },
        'Sagitario': { elemento: 'Fuego', chakra: 'Tercer Ojo', moleculas: ['Jazmín Sambac Absoluto', 'Encens Resinoide 100% P&N', 'Ambrocenide 10% DPG', 'Aceite Esencial de Aguaribay o Pimienta Rosa'], propiedades: 'Expansión, sabiduría' },
        'Capricornio': { elemento: 'Tierra', chakra: 'Raíz', moleculas: ['Vetiver Haití', 'Abedul Rectificado 5% Alcohol', 'Black Agar Givco 215', 'Patchouli Envejecido'], propiedades: 'Estructura, manifestación' },
        'Acuario': { elemento: 'Aire', chakra: 'Tercer Ojo', moleculas: ['Ambroxan', 'Hedione', 'Encens Resinoide 100% P&N', 'Cashmeran'], propiedades: 'Innovación, visión' },
        'Piscis': { elemento: 'Agua', chakra: 'Corona', moleculas: ['Jazmín Sambac Absoluto', 'Ambergris Base Type', 'Sándalo Australiano', 'Ambrettolide'], propiedades: 'Misticismo, compasión' }
    },
    elementos: {
        'Fuego': { moleculas_potenciadoras: ['Iso E Super', 'Ambroxan', 'Safraleine', 'Jengibre', 'Encens Resinoide 100% P&N'], intention: 'Elevar acción y coraje' },
        'Tierra': { moleculas_potenciadoras: ['Sándalo Australiano', 'Vetiver Haití', 'Patchouli Envejecido', 'Ambergris Base Type', 'Aceite Esencial de Benjuí'], intention: 'Elevar estabilidad y arraigo' },
        'Aire': { moleculas_potenciadoras: ['Hedione', 'Bergamota FCF', 'Aceite Esencial de Azahar (Neroli)', 'Rose Absolute Base', 'Aurantiol'], intention: 'Elevar comunicación y claridad' },
        'Agua': { moleculas_potenciadoras: ['Jazmín Sambac Absoluto', 'Rose Absolute Base', 'Ylang Ylang Extra', 'Ambrettolide', 'Maritima'], intention: 'Elevar intuición y sensibilidad' }
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
        if (this.seccionActual === seccion) return;

        const fromMode = this.seccionActual;
        this.seccionActual = seccion;

        // Iniciar Animación de Portal Alquímico
        this.ejecutarPortal(fromMode, seccion);

        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === seccion) {
                btn.classList.add('active');
            }
        });

        // El renderizado real ocurre después de la mitad del efecto del portal
        setTimeout(() => {
            this.renderizarSeccion();
        }, 600);
    }

    ejecutarPortal(from, to) {
        const portal = document.getElementById('alchemical-portal');
        if (!portal) return;

        portal.style.display = 'flex';
        portal.innerHTML = ''; // Limpiar

        // Crear círculos concéntricos
        for (let i = 0; i < 5; i++) {
            const circle = document.createElement('div');
            circle.className = 'portal-circle';
            circle.style.width = '0px';
            circle.style.height = '0px';
            portal.appendChild(circle);

            circle.animate([
                { width: '0px', height: '0px', opacity: 0, transform: 'rotate(0deg)' },
                { width: (200 + i * 150) + 'px', height: (200 + i * 150) + 'px', opacity: 0.5, transform: 'rotate(180deg)', offset: 0.5 },
                { width: (800 + i * 300) + 'px', height: (800 + i * 300) + 'px', opacity: 0, transform: 'rotate(360deg)' }
            ], {
                duration: 1200,
                delay: i * 100,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
        }

        // Símbolo morphing (Simulado)
        const symbol = document.createElement('div');
        symbol.style.fontSize = '12rem';
        symbol.style.position = 'absolute';
        symbol.style.color = 'var(--gold)';
        symbol.innerHTML = '⚗';
        portal.appendChild(symbol);

        symbol.animate([
            { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
            { transform: 'scale(1.5) rotate(0deg)', opacity: 1, offset: 0.5 },
            { transform: 'scale(0) rotate(180deg)', opacity: 0 }
        ], {
            duration: 1200,
            easing: 'ease-in-out'
        });

        setTimeout(() => {
            portal.style.display = 'none';
        }, 1500);
    }

    renderAlquimiaAstral() {
        const signos = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

        return `
            <section class="section active">
                <div class="glass-card marble-panel">
                    <h2 class="card-title text-stone">🔮 Alquimia Astral Transformadora</h2>
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
                <div class="glass-card marble-panel">
                    <h2 class="card-title text-stone">⚗ Laboratorio del Formulador</h2>
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
                <div class="glass-card marble-panel">
                    <h2 class="card-title text-stone">🧪 Inventario Molecular</h2>
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
                <div class="glass-card marble-panel">
                    <h2 class="card-title text-stone">🌹 Acordes Profesionales</h2>
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
                <div class="glass-card marble-panel">
                    <h2 class="card-title text-stone">📊 Calculadora Profesional</h2>
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

        const configAstrologica = CORRESPONDENCIAS_ASTROLOGICAS;

        // 1. DETERMINAR PROPÓSITO E INTENCIÓN
        let elementosAPotenciar = [];
        if (intencion.startsWith('elevar_')) {
            elementosAPotenciar = [intencion.split('_')[1].charAt(0).toUpperCase() + intencion.split('_')[1].slice(1)];
            formula.proposito = `Efluvios de ${elementosAPotenciar[0]}: ${configAstrologica.elementos[elementosAPotenciar[0]].intention}`;
        } else if (intencion === 'equilibrio_total') {
            elementosAPotenciar = ['Fuego', 'Tierra', 'Aire', 'Agua'];
            formula.proposito = 'Armonía Universal: Equilibrio absoluto de los cuatro elementos';
        } else {
            formula.proposito = `Esencia de ${sol} con alma de ${luna}`;
        }

        // REGISTRO TEMPORAL PARA COMPILAR INGREDIENTES
        const registroIngredientes = new Map();

        const registrarIngrediente = (mol, pct, razon, chakra, notaSugerida) => {
            if (!MOLECULAS[mol]) return; // Evitar moléculas no existentes

            if (registroIngredientes.has(mol)) {
                const existente = registroIngredientes.get(mol);
                existente.porcentaje += pct;
                if (!existente.razones.includes(razon)) existente.razones.push(razon);
                // Si el nuevo chakra no está y el anterior era null, lo actualizamos
                if (chakra && !existente.chakra) existente.chakra = chakra;
            } else {
                registroIngredientes.set(mol, {
                    molecula: mol,
                    porcentaje: pct,
                    razones: [razon],
                    chakra: chakra,
                    nota: notaSugerida
                });
            }
        };

        // 2. REGISTRAR POTENCIADORES ELEMENTALES (40% de la fórmula)
        if (elementosAPotenciar.length > 0) {
            elementosAPotenciar.forEach(elem => {
                const mols = configAstrologica.elementos[elem].moleculas_potenciadoras;
                const peso = Math.floor(40 / elementosAPotenciar.length);

                mols.forEach((mol, idx) => {
                    const pct = Math.floor(peso / mols.length);
                    const notaDestino = idx === 0 ? 'salida' : (idx < 3 ? 'corazon' : 'fondo');
                    registrarIngrediente(mol, pct, `Potenciador de ${elem}`, null, notaDestino);
                });
            });
        }

        // 3. REGISTRAR MOLÉCULAS DE LA CARTA NATAL (60% restante)
        const procesarSigno = (signo, rol, pctBase) => {
            const mols = configAstrologica.signos[signo].moleculas;
            mols.forEach((mol, idx) => {
                const pct = Math.floor(pctBase / mols.length);
                const notaDestino = idx === 0 ? 'salida' : (idx < 3 ? 'corazon' : 'fondo');
                registrarIngrediente(mol, pct, `${rol} en ${signo}`, configAstrologica.signos[signo].chakra, notaDestino);
            });
        };

        procesarSigno(sol, 'Sol', 25);
        procesarSigno(luna, 'Luna', 20);
        procesarSigno(asc, 'Ascendente', 15);

        // 4. COMPILAR Y DISTRIBUIR EN LA FÓRMULA FINAL
        registroIngredientes.forEach((data, mol) => {
            const itemFinal = {
                molecula: mol,
                porcentaje: data.porcentaje,
                razon: data.razones.join(' + '),
                chakra: data.chakra
            };

            // Clasificar en la nota correspondiente
            if (data.nota === 'salida') formula.salida.push(itemFinal);
            else if (data.nota === 'corazon') formula.corazon.push(itemFinal);
            else formula.fondo.push(itemFinal);
        });
        // Limpieza: Asegurar que no hay moléculas undefined y normalizar porcentajes
        const limpiar = (arr) => arr.filter(n => n && n.molecula && MOLECULAS[n.molecula]);
        formula.salida = limpiar(formula.salida);
        formula.corazon = limpiar(formula.corazon);
        formula.fondo = limpiar(formula.fondo);

        this.mostrarFormulaAlquimica(formula, { sol, luna, asc }, intencion);
    }

    mostrarFormulaAlquimica(formula, signos, intencion) {
        const display = document.getElementById('formula-alquimica');

        const renderNota = (nota) => {
            const dataMol = MOLECULAS[nota.molecula];
            if (!dataMol) {
                console.warn(`Molecula no encontrada en inventario: ${nota.molecula}`);
                return '';
            }

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

    // FIN DE MÉTODOS DE LA CLASE
}

// --- SISTEMA DE ESTRELLAS INTERACTIVAS (PORTED FROM ANTIGRAVITY) ---
function initInteractiveStars() {
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-stars';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.5';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    const mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    resize();

    // Crear estrellas
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            opacity: Math.random() * 0.5 + 0.3
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(s => {
            const dx = mouse.x - s.x;
            const dy = mouse.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const force = (150 - dist) / 150;
                s.vx -= (dx / dist) * force * 1.5;
                s.vy -= (dy / dist) * force * 1.5;
            }

            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.95;
            s.vy *= 0.95;

            // Wrap around
            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
            if (s.y < 0) s.y = height;
            if (s.y > height) s.y = 0;

            ctx.fillStyle = `rgba(201, 169, 97, ${s.opacity})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// --- SISTEMA DE NOTAS ADHESIVAS ---
function initStickyNotes() {
    const noteBtn = document.createElement('button');
    noteBtn.innerHTML = '📝';
    noteBtn.style.position = 'fixed';
    noteBtn.style.bottom = '100px';
    noteBtn.style.right = '40px';
    noteBtn.style.width = '60px';
    noteBtn.style.height = '60px';
    noteBtn.style.borderRadius = '50%';
    noteBtn.style.background = 'var(--gold)';
    noteBtn.style.border = 'none';
    noteBtn.style.fontSize = '1.5rem';
    noteBtn.style.cursor = 'pointer';
    noteBtn.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
    noteBtn.style.zIndex = '1000';
    document.body.appendChild(noteBtn);

    noteBtn.addEventListener('click', () => {
        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.contentEditable = true;
        note.innerHTML = 'Nueva nota alquímica...';
        note.style.left = (Math.random() * (window.innerWidth - 200)) + 'px';
        note.style.top = (Math.random() * (window.innerHeight - 200)) + 'px';
        document.body.appendChild(note);

        // Hacerla dragable (simple)
        let isDragging = false;
        note.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mousemove', e => {
            if (isDragging) {
                note.style.left = (e.clientX - 100) + 'px';
                note.style.top = (e.clientY - 50) + 'px';
            }
        });

        // Doble click para borrar
        note.addEventListener('dblclick', () => note.remove());
    });
}

// --- GLOBAL EXPOSURE ---
window.MOLECULAS = MOLECULAS;
window.ACORDES_PROFESIONALES = ACORDES_PROFESIONALES;
window.ExquisitPro = ExquisitPro;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    new ExquisitPro();
    console.log('⚗ EXQUISIT PRO - Sistema Profesional de Perfumería de Nicho Inicializado');

    // Inicializar Estrellas Interactivas
    initInteractiveStars();

    // Inicializar Sistema de Notas
    initStickyNotes();
});
