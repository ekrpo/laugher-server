import multer from "multer"


export const memoryStorage = multer.memoryStorage()

export const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.mimetype.includes("image")){
          cb(null, "uploads/")
        }else{
          cb(null, "uploads/")
        }

    },
    filename: function (req, file, cb) { 
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const fileName = file.fieldname + '-' + uniqueSuffix + file.originalname
      req.fileName = fileName
      req.filePath = "../uploads/"+fileName
      req.audioBuffer = file.buffer
      cb(null, fileName)
    }

})


  
export const upload = multer({storage: multer.memoryStorage()})
