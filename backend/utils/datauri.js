import DataUriParser from 'datauri/parser.js'
import path from 'path'

const parser = new DataUriParser()

const getDataUri = (file) =>{
    const extName = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".mp4", ".avi", ".mov"].includes(extName)) {
        throw new Error("Unsupported file format");
    }

    return parser.format(extName, file.buffer).content;
}

export default getDataUri