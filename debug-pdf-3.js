const pdf = require('pdf-parse');
console.log('Keys:', Object.keys(pdf));
if (typeof pdf.PDFParse === 'function') {
    console.log('PDFParse is a function!');
} else {
    console.log('PDFParse is NOT a function. It is:', typeof pdf.PDFParse);
}
