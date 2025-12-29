export function getOfflineSynastry(userDate: string, targetDate: string, targetName: string): string {
    const uDate = new Date(userDate);
    const tDate = new Date(targetDate);

    // Simple Zodiac calc (approximate)
    const getSign = (d: Date) => {
        const day = d.getDate();
        const month = d.getMonth() + 1;
        if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return "Capricornio";
        if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return "Acuario";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Piscis";
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Tauro";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Géminis";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cáncer";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Escorpio";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagitario";
        return "Aries";
    };

    const uSign = getSign(uDate);
    const tSign = getSign(tDate);

    const elements = {
        "Aries": "Fuego", "Leo": "Fuego", "Sagitario": "Fuego",
        "Tauro": "Tierra", "Virgo": "Tierra", "Capricornio": "Tierra",
        "Géminis": "Aire", "Libra": "Aire", "Acuario": "Aire",
        "Cáncer": "Agua", "Escorpio": "Agua", "Piscis": "Agua"
    };

    const uElem = elements[uSign as keyof typeof elements];
    const tElem = elements[tSign as keyof typeof elements];

    let dynamic = "";
    if (uElem === tElem) {
        dynamic = `Ambos compartís la vibración de ${uElem}. La comprensión es instintiva, pero corréis el riesgo de estancamiento. ${targetName} refleja tu misma inercia.`;
    } else if (
        (uElem === "Fuego" && tElem === "Aire") || (uElem === "Aire" && tElem === "Fuego") ||
        (uElem === "Tierra" && tElem === "Agua") || (uElem === "Agua" && tElem === "Tierra")
    ) {
        dynamic = `Vuestra sinergia es fértil. ${tElem} nutre a ${uElem}. ${targetName} te ofrece los recursos que te faltan para materializar tu voluntad.`;
    } else {
        dynamic = `La fricción es evidente. ${uElem} y ${tElem} hablan idiomas distintos. El desafío aquí es alquímico: integrar lo que te irrita de ${targetName}, pues es exactamente lo que reprimes en ti.`;
    }

    return `ANÁLISIS DE URGENCIA (SISTEMA DE SEGURIDAD):\n\nTu Sol en ${uSign} busca entrelazarse con el Sol en ${tSign} de ${targetName}.\n\n${dynamic}\n\nLECCIÓN MAESTRA:\nLo que admiras de ${targetName} es tu potencial no vivido. Lo que rechazas es tu sombra proyectada. No busques en ${targetName} la compleción, úsalo como espejo para detectar tu propia carencia de ${tElem}.`;
}
