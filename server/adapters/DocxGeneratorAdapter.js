// docxGeneratorAdapter.js
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

class DocxGeneratorAdapter {
    generateDocx(templatePath, data) {
        let finalPath = path.resolve(__dirname, templatePath);
        const content = fs.readFileSync(finalPath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        doc.setData(data);

        try {
            doc.render();
        } catch (error) {
            throw new Error('Error rendering document: ' + error.message);
        }

        return doc.getZip().generate({ type: 'nodebuffer' });
    }
}

module.exports = DocxGeneratorAdapter;
