/**
 * EXQUISIT EMPOWERMENT MODULE
 * 
 * Extends the core ExquisitPro system to include advanced energetic matching.
 * Replaces the basic formula generation with the EnergeticAlchemist engine logic.
 * 
 * Usage: Automatically enhances ExquisitPro when loaded.
 */

(function () {
    // Wait for the main class to be available
    const initExtension = () => {
        if (typeof ExquisitPro === 'undefined' || typeof EnergeticAlchemist === 'undefined') {
            setTimeout(initExtension, 100);
            return;
        }

        console.log('⚡ EMPOWERMENT MODULE: Enhancing Exquisit Pro with Energetic Engine...');

        // Backup original method (optional, good practice)
        const originalGenerator = ExquisitPro.prototype.generarFormulaAlquimica;

        /**
         * Enhanced Formula Generator
         * Uses EnergeticAlchemist to analyze chart + intention and generate a complex formula.
         */
        ExquisitPro.prototype.generarFormulaAlquimica = function (sol, luna, asc, intencion) {
            console.log(`⚗ ANALYZING CHART: ☉${sol} ☾${luna} ↑${asc} | INTENTION: ${intencion}`);

            // 1. Run Energetic Analysis
            const chart = { sun: sol, moon: luna, ascendant: asc };
            const analysis = EnergeticAlchemist.analyzeEnergeticNeeds(chart, intencion);

            console.log('📊 ENERGETIC ANALYSIS:', analysis);

            // 2. Generate Therapeutic Formula
            const energeticFormula = EnergeticAlchemist.generateTherapeuticFormula(analysis);

            console.log('🧪 GENERATED FORMULA:', energeticFormula);

            // 3. Map to View Format
            // The view expects: { salida: [], corazon: [], fondo: [], proposito: '', ... }
            const viewFormula = {
                salida: [],
                corazon: [],
                fondo: [],
                proposito: `<strong>Propósito:</strong> ${energeticFormula.name}<br>
                           <span style="font-size: 0.9em; opacity: 0.8">Estrategia: ${analysis.strategy.mode} energía ${analysis.targetEnergy.name} (${analysis.targetEnergy.element})</span>`,
                elementos_trabajados: [analysis.targetEnergy.element]
            };

            // Helper to map ingredients to view structure
            const mapIngredient = (name, pct, role, chakra) => ({
                molecula: name,
                porcentaje: pct,
                razon: role,
                chakra: chakra
            });

            // Top Notes (Salida)
            energeticFormula.composition.top.forEach(ing => {
                viewFormula.salida.push(mapIngredient(ing, 15, 'Impacto Inmediato', analysis.targetEnergy.chakra));
            });

            // Heart Notes (Corazón)
            // Bridge ingredients
            energeticFormula.composition.heart.forEach((ing, i) => {
                viewFormula.corazon.push(mapIngredient(ing, i === 0 ? 30 : 20, i === 0 ? 'Núcleo Energético' : 'Conector Somático', analysis.targetEnergy.chakra));
            });

            // Base Notes (Fondo)
            // Balancing ingredients
            energeticFormula.composition.base.forEach(ing => {
                viewFormula.fondo.push(mapIngredient(ing, 35, `Base Equilibrante (${analysis.strategy.balances})`, 'Raíz'));
            });

            // 4. Render Result
            this.mostrarFormulaAlquimica(viewFormula, { sol, luna, asc }, intencion);
        };

        console.log('⚡ EMPOWERMENT MODULE: Integration Complete.');
    };

    // Start initialization
    initExtension();
})();
