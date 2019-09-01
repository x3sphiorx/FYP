const fs = require('fs-extra');
const path = require('path');

class Db {
    constructor(filepathAddress, dataToBeWritten) {
        this.filepathAddress = filepathAddress;
        this.dataToBeWritten = dataToBeWritten;
    }

    read(saveFile) {
        if (!fs.existsSync(this.filepathAddress))
            return this.dataToBeWritten;

        var fileContent = fs.readFileSync(this.filepathAddress);

        if (fileContent.length == 0)
            return this.dataToBeWritten;

        return (saveFile) ? saveFile.fromJson(JSON.parse(fileContent)) : JSON.parse(fileContent);
    }

    write(dataToFile) {
        fs.ensureDirSync(path.dirname(this.filepathAddress));
        fs.writeFileSync(this.filepathAddress, JSON.stringify(dataToFile));
    }
}