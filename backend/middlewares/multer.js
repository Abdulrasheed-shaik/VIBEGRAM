import multer from 'multer'
const upload=multer({
    limits: { fileSize: 500 * 1024 * 1024 }, // ✅ Set max file size to 500MB
    storage:multer.memoryStorage(),
})
export default upload