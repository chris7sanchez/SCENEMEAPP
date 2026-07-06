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

// --- Reservas (Scene Me booking) ---

const getCalendar = () => {
    const auth = getAuthClient();
    if (!auth) return null;
    return google.calendar({ version: 'v3', auth });
};

const CALENDAR_ID = () => process.env.GOOGLE_CALENDAR_ID || 'primary';

export interface BookingEventInput {
    name: string;
    email: string;
    phone: string;
    service: string;
    startISO: string;
    endISO: string;
}

// Crea la solicitud como evento PROVISIONAL: visible en el calendario
// pero 'transparent' (no bloquea la fecha hasta que Chris la acepte).
export const createPendingBooking = async (b: BookingEventInput) => {
    const calendar = getCalendar();
    if (!calendar) throw new Error('Calendario no configurado (faltan credenciales)');
    const res = await calendar.events.insert({
        calendarId: CALENDAR_ID(),
        requestBody: {
            summary: `⏳ PENDIENTE · ${b.service} · ${b.name}`,
            description: `Solicitud de reserva desde Scene Me\n\nNombre: ${b.name}\nEmail: ${b.email}\nTeléfono: ${b.phone}\nServicio: ${b.service}\n\nAcepta o rechaza desde el email que has recibido.`,
            start: { dateTime: b.startISO, timeZone: 'Europe/Madrid' },
            end: { dateTime: b.endISO, timeZone: 'Europe/Madrid' },
            transparency: 'transparent',
            extendedProperties: {
                private: { sceneMe: 'booking', clientName: b.name, clientEmail: b.email, service: b.service },
            },
        },
    });
    return res.data;
};

export const getBookingEvent = async (eventId: string) => {
    const calendar = getCalendar();
    if (!calendar) throw new Error('Calendario no configurado (faltan credenciales)');
    const res = await calendar.events.get({ calendarId: CALENDAR_ID(), eventId });
    // Solo tratamos eventos creados por la app
    if (res.data.extendedProperties?.private?.sceneMe !== 'booking') return null;
    return res.data;
};

// Confirmar: el evento pasa a bloquear la fecha y cambia el título.
export const confirmBooking = async (eventId: string) => {
    const calendar = getCalendar();
    if (!calendar) throw new Error('Calendario no configurado (faltan credenciales)');
    const event = await getBookingEvent(eventId);
    if (!event) throw new Error('Reserva no encontrada');
    const res = await calendar.events.patch({
        calendarId: CALENDAR_ID(),
        eventId,
        requestBody: {
            summary: (event.summary || '').replace('⏳ PENDIENTE', '✅ RESERVADO'),
            transparency: 'opaque',
        },
    });
    return res.data;
};

// Rechazar: se elimina el evento provisional del calendario.
export const rejectBooking = async (eventId: string) => {
    const calendar = getCalendar();
    if (!calendar) throw new Error('Calendario no configurado (faltan credenciales)');
    const event = await getBookingEvent(eventId);
    if (!event) throw new Error('Reserva no encontrada');
    await calendar.events.delete({ calendarId: CALENDAR_ID(), eventId });
    return event;
};
