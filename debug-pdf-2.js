try {
    const path = require.resolve('pdf-parse');
    console.log('Path:', path);
    const pdf = require('pdf-parse');
    console.log('Type:', typeof pdf);
    console.log('Default type:', typeof pdf.default);
} catch (e) {
    console.error('Error:', e.message);
}
