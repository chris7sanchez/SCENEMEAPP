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
        notas: 'Base amb barada potente en dilución',
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
