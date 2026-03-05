import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Star, Droplet, Heart, Flame, Wind, Info } from 'lucide-react';

const AstroAromatherapyApp = () => {
  const [step, setStep] = useState(1);
  const [birthData, setBirthData] = useState({
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    name: ''
  });
  const [chart, setChart] = useState(null);
  const [perfumeFormula, setPerfumeFormula] = useState(null);

  // Base de datos completa de aceites esenciales con propiedades científicas y mágicas
  const aceites = {
    // Aceites para cada signo del zodiaco
    signos: {
      'Aries': {
        principal: 'Clavo',
        secundarios: ['Jengibre', 'Pimienta negra', 'Canela', 'Romero'],
        propiedades: 'Estimulante, energizante, fortalece el coraje y la acción',
        chakra: 'Plexo Solar',
        elemento: 'Fuego'
      },
      'Tauro': {
        principal: 'Sándalo',
        secundarios: ['Rosa', 'Pachulí', 'Vainilla', 'Ylang-Ylang'],
        propiedades: 'Sensual, estabilizador, conecta con la tierra y la abundancia',
        chakra: 'Raíz',
        elemento: 'Tierra'
      },
      'Géminis': {
        principal: 'Canela',
        secundarios: ['Lavanda', 'Menta', 'Bergamota', 'Eucalipto'],
        propiedades: 'Claridad mental, comunicación, agilidad de pensamiento',
        chakra: 'Garganta',
        elemento: 'Aire'
      },
      'Cáncer': {
        principal: 'Lirio',
        secundarios: ['Jazmín', 'Manzanilla Romana', 'Sándalo', 'Rosa'],
        propiedades: 'Protección emocional, nutrición del alma, conexión lunar',
        chakra: 'Corazón',
        elemento: 'Agua'
      },
      'Leo': {
        principal: 'Menta',
        secundarios: ['Neroli', 'Incienso', 'Naranja', 'Clavo'],
        propiedades: 'Confianza, liderazgo, vitalidad solar, poder personal',
        chakra: 'Plexo Solar',
        elemento: 'Fuego'
      },
      'Virgo': {
        principal: 'Enebro',
        secundarios: ['Ciprés', 'Eucalipto', 'Lavanda', 'Menta'],
        propiedades: 'Purificación, orden, precisión, sanación',
        chakra: 'Plexo Solar',
        elemento: 'Tierra'
      },
      'Libra': {
        principal: 'Rosa',
        secundarios: ['Ylang-Ylang', 'Geranio', 'Palmarosa', 'Jazmín'],
        propiedades: 'Armonía, equilibrio, belleza, relaciones',
        chakra: 'Corazón',
        elemento: 'Aire'
      },
      'Escorpio': {
        principal: 'Coco',
        secundarios: ['Pachulí', 'Vetiver', 'Mirra', 'Sándalo'],
        propiedades: 'Transformación profunda, poder oculto, regeneración',
        chakra: 'Sacro',
        elemento: 'Agua'
      },
      'Sagitario': {
        principal: 'Jazmín',
        secundarios: ['Cardamomo', 'Salvia', 'Cedro', 'Incienso'],
        propiedades: 'Expansión, sabiduría, optimismo, aventura espiritual',
        chakra: 'Tercer Ojo',
        elemento: 'Fuego'
      },
      'Capricornio': {
        principal: 'Romero',
        secundarios: ['Cedro', 'Vetiver', 'Ciprés', 'Pachulí'],
        propiedades: 'Estructura, disciplina, longevidad, manifestación',
        chakra: 'Raíz',
        elemento: 'Tierra'
      },
      'Acuario': {
        principal: 'Pachulí',
        secundarios: ['Neroli', 'Lavanda', 'Incienso', 'Menta'],
        propiedades: 'Innovación, liberación, conexión cósmica, intuición',
        chakra: 'Tercer Ojo',
        elemento: 'Aire'
      },
      'Piscis': {
        principal: 'Violeta',
        secundarios: ['Jazmín', 'Sándalo', 'Ylang-Ylang', 'Rosa'],
        propiedades: 'Misticismo, compasión, conexión espiritual, sueños',
        chakra: 'Corona',
        elemento: 'Agua'
      }
    },

    // Aceites para equilibrar casas vacías
    casas: {
      1: { nombre: 'Identidad y Apariencia', aceites: ['Bergamota', 'Naranja', 'Limón'], proposito: 'Despertar tu esencia auténtica y presencia' },
      2: { nombre: 'Recursos y Valores', aceites: ['Pachulí', 'Vetiver', 'Canela'], proposito: 'Anclar la abundancia y valorarte' },
      3: { nombre: 'Comunicación', aceites: ['Menta', 'Eucalipto', 'Romero'], proposito: 'Claridad mental y expresión' },
      4: { nombre: 'Hogar y Raíces', aceites: ['Sándalo', 'Vainilla', 'Rosa'], proposito: 'Seguridad emocional y arraigo' },
      5: { nombre: 'Creatividad y Placer', aceites: ['Ylang-Ylang', 'Jazmín', 'Naranja'], proposito: 'Expresión auténtica y alegría' },
      6: { nombre: 'Salud y Servicio', aceites: ['Lavanda', 'Eucalipto', 'Menta'], proposito: 'Sanación y rutinas saludables' },
      7: { nombre: 'Relaciones', aceites: ['Rosa', 'Geranio', 'Ylang-Ylang'], proposito: 'Armonía interpersonal y amor' },
      8: { nombre: 'Transformación', aceites: ['Mirra', 'Incienso', 'Cedro'], proposito: 'Renacimiento y poder personal' },
      9: { nombre: 'Expansión y Filosofía', aceites: ['Salvia', 'Cedro', 'Incienso'], proposito: 'Sabiduría superior y visión' },
      10: { nombre: 'Propósito y Carrera', aceites: ['Romero', 'Ciprés', 'Laurel'], proposito: 'Manifestación del destino' },
      11: { nombre: 'Comunidad y Sueños', aceites: ['Neroli', 'Lavanda', 'Bergamota'], proposito: 'Conexión colectiva y visión' },
      12: { nombre: 'Espiritualidad', aceites: ['Incienso', 'Mirra', 'Sándalo'], proposito: 'Trascendencia y conexión divina' }
    },

    // Propiedades terapéuticas científicas
    propiedades: {
      'Lavanda': {
        cientifico: 'Linalol, acetato de linalilo',
        efectos: 'Aumenta serotonina, reduce ansiedad, mejora sueño',
        usos: 'Ansiedad, insomnio, cicatrización, dolor muscular',
        emocion_negativa: 'No oído',
        emocion_positiva: 'Expresado'
      },
      'Rosa': {
        cientifico: 'Geraniol, citronelol, nerol',
        efectos: 'Antidepresivo, equilibrio hormonal, rejuvenecedor',
        usos: 'Depresión, equilibrio emocional, piel seca',
        emocion_negativa: 'Aislado',
        emocion_positiva: 'Amado'
      },
      'Jazmín': {
        cientifico: 'Acetato de bencilo, linalol',
        efectos: 'Aumenta melatonina, antidepresivo, afrodisíaco',
        usos: 'Depresión, insomnio, ansiedad, frigidez',
        emocion_negativa: 'Obstaculizado',
        emocion_positiva: 'Liberado'
      },
      'Menta': {
        cientifico: 'Mentol, mentona',
        efectos: 'Analgésico, mejora concentración, inhibe acetilcolinesterasa',
        usos: 'Dolor muscular, migrañas, concentración',
        emocion_negativa: 'Obstaculizado',
        emocion_positiva: 'Vigoroso'
      },
      'Romero': {
        cientifico: '1,8-cineol, alcanfor',
        efectos: 'Aumenta oxigenación cerebral, memoria, cognitivo',
        usos: 'Memoria, concentración, dolor articular',
        emocion_negativa: 'Confundido',
        emocion_positiva: 'Mente abierta'
      },
      'Eucalipto': {
        cientifico: '1,8-cineol, alfa-pineno',
        efectos: 'Broncodilatador, antiinflamatorio, antibacteriano',
        usos: 'Congestión, dolor muscular, infecciones respiratorias',
        emocion_negativa: 'Congestionado',
        emocion_positiva: 'Estimulado'
      },
      'Bergamota': {
        cientifico: 'Linalol, acetato de linalilo',
        efectos: 'Reduce cortisol, ansiolítico, mejora ánimo',
        usos: 'Ansiedad, estrés, depresión',
        emocion_negativa: 'Insuficiente',
        emocion_positiva: 'Digno'
      },
      'Ylang-Ylang': {
        cientifico: 'Linalol, geraniol',
        efectos: 'Reduce presión arterial, afrodisíaco, equilibrio emocional',
        usos: 'Hipertensión, ansiedad, libido baja',
        emocion_negativa: 'Agobiado',
        emocion_positiva: 'Exuberante'
      },
      'Pachulí': {
        cientifico: 'Patchoulol, alfa-bulneseno',
        efectos: 'Antidepresivo, afrodisíaco, regenerador celular',
        usos: 'Depresión, libido, piel envejecida',
        emocion_negativa: 'Degradado',
        emocion_positiva: 'Mejorado'
      },
      'Incienso': {
        cientifico: 'Alfa-pineno, limoneno',
        efectos: 'Reduce ansiedad, antiinflamatorio, meditación',
        usos: 'Ansiedad, inflamación, práctica espiritual',
        emocion_negativa: 'Separado',
        emocion_positiva: 'Unificado'
      },
      'Sándalo': {
        cientifico: 'Santalol',
        efectos: 'Ansiolítico, meditativo, afrodisíaco',
        usos: 'Ansiedad, meditación, conexión espiritual',
        emocion_negativa: 'No inspirado',
        emocion_positiva: 'Devoto'
      },
      'Neroli': {
        cientifico: 'Linalol, limoneno',
        efectos: 'Aumenta serotonina, regenerador celular',
        usos: 'Ansiedad, insomnio, piel madura',
        emocion_negativa: 'Agotado',
        emocion_positiva: 'Lleno de luz'
      }
    }
  };

  const calcularSigno = (dia, mes) => {
    const fechas = [
      { signo: 'Capricornio', hasta: [1, 19] },
      { signo: 'Acuario', hasta: [2, 18] },
      { signo: 'Piscis', hasta: [3, 20] },
      { signo: 'Aries', hasta: [4, 19] },
      { signo: 'Tauro', hasta: [5, 20] },
      { signo: 'Géminis', hasta: [6, 20] },
      { signo: 'Cáncer', hasta: [7, 22] },
      { signo: 'Leo', hasta: [8, 22] },
      { signo: 'Virgo', hasta: [9, 22] },
      { signo: 'Libra', hasta: [10, 22] },
      { signo: 'Escorpio', hasta: [11, 21] },
      { signo: 'Sagitario', hasta: [12, 21] },
      { signo: 'Capricornio', hasta: [12, 31] }
    ];

    for (let i = 0; i < fechas.length; i++) {
      if (mes < fechas[i].hasta[0] || (mes === fechas[i].hasta[0] && dia <= fechas[i].hasta[1])) {
        return fechas[i].signo;
      }
    }
    return 'Capricornio';
  };

  const generarCarta = () => {
    const signoSolar = calcularSigno(parseInt(birthData.day), parseInt(birthData.month));
    const hora = parseInt(birthData.hour);
    
    const signosOrden = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    const ascendente = signosOrden[Math.floor(hora / 2) % 12];
    const luna = signosOrden[(parseInt(birthData.day) + parseInt(birthData.month)) % 12];

    // Simular casas ocupadas y vacías
    const casasOcupadas = [1, 4, 7, 10];
    const casasVacias = [2, 3, 5, 6, 8, 9, 11, 12];

    setChart({
      signoSolar,
      ascendente,
      luna,
      casasOcupadas,
      casasVacias
    });

    generarFormulaPerfume(signoSolar, ascendente, luna, casasVacias);
    setStep(2);
  };

  const generarFormulaPerfume = (sol, asc, luna, casasVacias) => {
    const formula = {
      notasSalida: [],
      notasCorazon: [],
      notasBase: [],
      propiedadesTerapeuticas: [],
      casasEquilibrar: []
    };

    // Notas Base: Signo Solar (esencia del ser)
    const aceiteBase = aceites.signos[sol];
    formula.notasBase.push({
      esencia: aceiteBase.principal,
      porcentaje: 30,
      origen: `Sol en ${sol}`,
      proposito: aceiteBase.propiedades,
      cientifico: aceites.propiedades[aceiteBase.principal]?.cientifico || 'Compuestos orgánicos naturales',
      efectos: aceites.propiedades[aceiteBase.principal]?.efectos || aceiteBase.propiedades,
      chakra: aceiteBase.chakra,
      elemento: aceiteBase.elemento
    });

    // Notas de Salida: Ascendente (máscara social)
    const aceiteAsc = aceites.signos[asc];
    formula.notasSalida.push({
      esencia: aceiteAsc.secundarios[0],
      porcentaje: 20,
      origen: `Ascendente en ${asc}`,
      proposito: 'Tu presencia en el mundo',
      cientifico: aceites.propiedades[aceiteAsc.secundarios[0]]?.cientifico || 'Terpenos y alcoholes',
      efectos: aceites.propiedades[aceiteAsc.secundarios[0]]?.efectos || 'Energía expansiva',
      elemento: aceiteAsc.elemento
    });

    // Notas de Corazón: Luna (mundo emocional)
    const aceiteLuna = aceites.signos[luna];
    formula.notasCorazon.push({
      esencia: aceiteLuna.principal,
      porcentaje: 25,
      origen: `Luna en ${luna}`,
      proposito: 'Tu mundo emocional interno',
      cientifico: aceites.propiedades[aceiteLuna.principal]?.cientifico || 'Ésteres y aldehídos',
      efectos: aceites.propiedades[aceiteLuna.principal]?.efectos || 'Balance emocional',
      chakra: aceiteLuna.chakra
    });

    // Equilibrar casas vacías (máximo 3)
    const casasAEquilibrar = casasVacias.slice(0, 3);
    const porcentajes = [12, 8, 5];
    
    casasAEquilibrar.forEach((casa, index) => {
      const casaInfo = aceites.casas[casa];
      const aceiteSeleccionado = casaInfo.aceites[0];
      
      formula.notasCorazon.push({
        esencia: aceiteSeleccionado,
        porcentaje: porcentajes[index],
        origen: `Casa ${casa}: ${casaInfo.nombre}`,
        proposito: casaInfo.proposito,
        cientifico: aceites.propiedades[aceiteSeleccionado]?.cientifico || 'Compuestos volátiles',
        efectos: aceites.propiedades[aceiteSeleccionado]?.efectos || casaInfo.proposito
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
      propiedades: aceites.propiedades[aceite] || {}
    })).filter(a => Object.keys(a.propiedades).length > 0);

    setPerfumeFormula(formula);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Moon className="w-7 h-7 text-purple-300" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              Alquimia Astral Aromática
            </h1>
            <Sun className="w-7 h-7 text-yellow-300" />
          </div>
          <p className="text-purple-200 text-base md:text-lg">Perfumes Profesionales con Base Científica</p>
          <p className="text-purple-300 text-xs md:text-sm mt-2">Aromaterapia + Astrología = Transformación Holística</p>
        </div>

        {/* Step 1: Datos de Nacimiento */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-purple-300/20">
            <div className="flex items-center gap-3 mb-5">
              <Star className="w-5 h-5 text-yellow-300" />
              <h2 className="text-xl font-semibold">Tus Datos Natales</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-purple-200 mb-2">Tu Nombre</label>
                <input
                  type="text"
                  value={birthData.name}
                  onChange={(e) => setBirthData({...birthData, name: e.target.value})}
                  className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                  placeholder="María"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-purple-200 mb-2">Día</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={birthData.day}
                    onChange={(e) => setBirthData({...birthData, day: e.target.value})}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-200 mb-2">Mes</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={birthData.month}
                    onChange={(e) => setBirthData({...birthData, month: e.target.value})}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                    placeholder="7"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-200 mb-2">Año</label>
                  <input
                    type="number"
                    min="1900"
                    max="2025"
                    value={birthData.year}
                    onChange={(e) => setBirthData({...birthData, year: e.target.value})}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                    placeholder="1990"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-purple-200 mb-2">Hora (24h)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={birthData.hour}
                    onChange={(e) => setBirthData({...birthData, hour: e.target.value})}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                    placeholder="14"
                  />
                </div>
                <div>
                  <label className="block text-sm text-purple-200 mb-2">Minuto</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={birthData.minute}
                    onChange={(e) => setBirthData({...birthData, minute: e.target.value})}
                    className="w-full bg-white/5 border border-purple-300/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                    placeholder="30"
                  />
                </div>
              </div>

              <button
                onClick={generarCarta}
                disabled={!birthData.day || !birthData.month || !birthData.year || !birthData.hour || !birthData.minute}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed py-3.5 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generar Mi Perfume Alquímico
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Carta Natal y Fórmula */}
        {step === 2 && chart && perfumeFormula && (
          <div className="space-y-5">
            {/* Carta Natal */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-purple-300/20">
              <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
                <Moon className="w-6 h-6 text-purple-300" />
                Tu Carta Natal {birthData.name && `- ${birthData.name}`}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-5 rounded-xl border border-yellow-300/30">
                  <Sun className="w-7 h-7 text-yellow-300 mb-2" />
                  <div className="text-xs text-purple-200">Sol (Tu Esencia)</div>
                  <div className="text-xl font-bold">{chart.signoSolar}</div>
                  <div className="text-xs text-purple-300 mt-2">
                    <Flame className="w-3 h-3 inline mr-1" />
                    {aceites.signos[chart.signoSolar].elemento}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5 rounded-xl border border-blue-300/30">
                  <Moon className="w-7 h-7 text-blue-300 mb-2" />
                  <div className="text-xs text-purple-200">Luna (Emociones)</div>
                  <div className="text-xl font-bold">{chart.luna}</div>
                  <div className="text-xs text-purple-300 mt-2">
                    <Droplet className="w-3 h-3 inline mr-1" />
                    {aceites.signos[chart.luna].elemento}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-5 rounded-xl border border-purple-300/30">
                  <Star className="w-7 h-7 text-purple-300 mb-2" />
                  <div className="text-xs text-purple-200">Ascendente (Máscara)</div>
                  <div className="text-xl font-bold">{chart.ascendente}</div>
                  <div className="text-xs text-purple-300 mt-2">
                    <Wind className="w-3 h-3 inline mr-1" />
                    {aceites.signos[chart.ascendente].elemento}
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-400/20">
                <h3 className="text-sm font-semibold mb-2 text-purple-200 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Casas a Equilibrar con Aromaterapia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {perfumeFormula.casasEquilibrar.map(casa => (
                    <div key={casa} className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                      <div className="font-semibold">Casa {casa}</div>
                      <div className="text-xs text-purple-300">{aceites.casas[casa].nombre}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fórmula del Perfume */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-purple-300/20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <Droplet className="w-7 h-7 text-pink-300" />
                    Esencia {chart.signoSolar}
                  </h2>
                  <p className="text-purple-200 text-sm mt-2">Perfume de nicho personalizado con base científica</p>
                </div>
                <Heart className="w-10 h-10 text-pink-400" />
              </div>

              {/* Notas de Salida */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-yellow-300 flex items-center gap-2">
                  ✨ Notas de Salida (Primera Impresión)
                </h3>
                {perfumeFormula.notasSalida.map((nota, i) => (
                  <div key={i} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 mb-3 border border-yellow-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{nota.esencia}</div>
                        <div className="text-sm text-purple-300">{nota.origen}</div>
                        <div className="text-xs text-purple-400 mt-1">
                          <span className="font-semibold">Elemento:</span> {nota.elemento}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-300">{nota.porcentaje}%</div>
                    </div>
                    <div className="text-sm text-purple-200 italic mb-2">{nota.proposito}</div>
                    <div className="text-xs bg-white/5 p-2 rounded mt-2">
                      <div className="text-purple-300"><span className="font-semibold">Componentes:</span> {nota.cientifico}</div>
                      <div className="text-purple-300 mt-1"><span className="font-semibold">Efectos:</span> {nota.efectos}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notas de Corazón */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-pink-300 flex items-center gap-2">
                  💗 Notas de Corazón (Alma del Perfume)
                </h3>
                {perfumeFormula.notasCorazon.map((nota, i) => (
                  <div key={i} className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 mb-3 border border-pink-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{nota.esencia}</div>
                        <div className="text-sm text-purple-300">{nota.origen}</div>
                        {nota.chakra && (
                          <div className="text-xs text-purple-400 mt-1">
                            <span className="font-semibold">Chakra:</span> {nota.chakra}
                          </div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-pink-300">{nota.porcentaje}%</div>
                    </div>
                    <div className="text-sm text-purple-200 italic mb-2">{nota.proposito}</div>
                    <div className="text-xs bg-white/5 p-2 rounded mt-2">
                      <div className="text-purple-300"><span className="font-semibold">Componentes:</span> {nota.cientifico}</div>
                      <div className="text-purple-300 mt-1"><span className="font-semibold">Efectos:</span> {nota.efectos}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notas de Base */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-3 text-blue-300 flex items-center gap-2">
                  🌙 Notas de Base (Fundamento)
                </h3>
                {perfumeFormula.notasBase.map((nota, i) => (
                  <div key={i} className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 mb-3 border border-blue-400/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{nota.esencia}</div>
                        <div className="text-sm text-purple-300">{nota.origen}</div>
                        <div className="text-xs text-purple-400 mt-1">
                          <span className="font-semibold">Chakra:</span> {nota.chakra} | <span className="font-semibold">Elemento:</span> {nota.elemento}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-300">{nota.porcentaje}%</div>
                    </div>
                    <div className="text-sm text-purple-200 italic mb-2">{nota.proposito}</div>
                    <div className="text-xs bg-white/5 p-2 rounded mt-2">
                      <div className="text-purple-300"><span className="font-semibold">Componentes:</span> {nota.cientifico}</div>
                      <div className="text-purple-300 mt-1"><span className="font-semibold">Efectos:</span> {nota.efectos}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Propiedades Terapéuticas */}
              {perfumeFormula.propiedadesTerapeuticas.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-400/20 mb-5">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-300" />
                    Propiedades Terapéuticas Científicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perfumeFormula.propiedadesTerapeuticas.map((aceite, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="font-semibold text-green-300 mb-1">{aceite.nombre}</div>
                        {aceite.propiedades.emocion_negativa && (
                          <div className="text-xs text-red-300">
                            ❌ Desbalance: {aceite.propiedades.emocion_negativa}
                          </div>
                        )}
                        {aceite.propiedades.emocion_positiva && (
                          <div className="text-xs text-green-300">
                            ✅ Balance: {aceite.propiedades.emocion_positiva}
                          </div>
                        )}
                        {aceite.propiedades.usos && (
                          <div className="text-xs text-purple-300 mt-1">
                            <span className="font-semibold">Usos:</span> {aceite.propiedades.usos}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guía de Creación */}
              <div className="bg-purple-500/20 rounded-2xl p-5 border border-purple-400/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Guía Profesional de Creación
                </h3>
                <div className="space-y-2 text-sm text-purple-100">
                  <p>✓ <span className="font-semibold">Base:</span> Aceite de jojoba o alcohol de perfumería 96°</p>
                  <p>✓ <span className="font-semibold">Aceites:</span> Grado terapéutico 100% puros</p>
                  <p>✓ <span className="font-semibold">Dilución:</span> Para 10ml total, aplica los porcentajes en gotas (1% ≈ 2 gotas)</p>
                  <p>✓ <span className="font-semibold">Orden:</span> Base → Notas de corazón → Notas de salida</p>
                  <p>✓ <span className="font-semibold">Maceración:</span> 4-6 semanas en frasco ámbar, agitar suavemente cada 3 días</p>
                  <p>✓ <span className="font-semibold">Conservación:</span> Lugar oscuro, temperatura ambiente</p>
                  <p>✓ <span className="font-semibold">Aplicación:</span> Puntos de pulso, preferentemente en rituales lunares</p>
                  <p className="mt-3 text-xs text-yellow-200">
                    ⚠️ <span className="font-semibold">Nota:</span> Este perfume combina ciencia aromaterápica con sabiduría astrológica. 
                    Los efectos se potencian con intención consciente y práctica regular.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 py-3 rounded-xl font-semibold transition-all"
              >
                Crear Otra Fórmula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstroAromatherapyApp;