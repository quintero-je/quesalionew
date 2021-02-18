const fs = require('fs');

class fileMan {

    constructor(file) {
        this.file = file;
    }

    getFileList() {
        var dir = fs.readdirSync(this.file)
        return dir;
    }

    delFile() {
        fs.unlink(this.file, (err) => {
            if (err) {
                console.error(err)
                return
            }
            return 'File Removed';
        })
    }

}

module.exports = fileMan;