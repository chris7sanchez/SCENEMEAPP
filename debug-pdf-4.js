const pdf = require('pdf-parse');
try {
    const p = new pdf.PDFParse();
    console.log('Successfully created new PDFParse instance');
} catch (e) {
    console.log('Failed to create new PDFParse instance:', e.message);
}
