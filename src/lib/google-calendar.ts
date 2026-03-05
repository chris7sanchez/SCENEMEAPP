import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'];

const getAuthClient = () => {
    // Estas variables deben configurarse en tu archivo .env
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        // Si no hay credenciales, devolvemos null para no romper la app en desarrollo
        // pero logueamos el aviso.
        console.warn('⚠️ Google Calendar credentials not found in .env');
        return null;
    }

    const client = new google.auth.JWT({
        email: clientEmail,
        key: privateKey.replace(/\\n/g, '\n'), // Fix para saltos de línea en Vercel/Env
        scopes: SCOPES
    });

    return client;
};

export const getBusyDates = async (start: Date, end: Date) => {
    try {
        const auth = getAuthClient();
        if (!auth) return [];

        const calendar = google.calendar({ version: 'v3', auth });

        // El ID del calendario suele ser tu email personal (ej: tu@gmail.com)
        // o puedes usar 'primary' si compartes el calendario con la Service Account.
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        const response = await calendar.events.list({
            calendarId,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            timeZone: 'Europe/Madrid' // Ajusta según necesites
        });

        // Filtramos solo los eventos que realmente bloquean tiempo (status 'confirmed')
        // Google Calendar a veces tiene eventos 'transparent' (disponible).
        // La API v3 devuelve `transparency: 'transparent'` si no bloquea.

        const busyEvents = response.data.items?.filter(event => {
            return event.status === 'confirmed' && event.transparency !== 'transparent';
        }) || [];

        return busyEvents.map(event => ({
            start: event.start?.dateTime || event.start?.date, // dateTime para eventos con hora, date para todo el día
            end: event.end?.dateTime || event.end?.date,
            title: 'Ocupado' // Privacidad: no enviamos el título real al frontend
        }));

    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }
};
