// documentService.js
const DocxGeneratorAdapter = require('../adapters/DocxGeneratorAdapter');

class ContractManager {
    constructor() {
        this.docxGenerator = new DocxGeneratorAdapter();
    }

    buildContract(path, data) {
        return this.docxGenerator.generateDocx(path, data);
    }
}

module.exports = ContractManager;
