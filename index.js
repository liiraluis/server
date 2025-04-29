import dotenv from 'dotenv';
import express, { json } from 'express';
import cors from 'cors';
import ImageKit from 'imagekit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
dotenv.config();
const storage = multer.memoryStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage, dest: 'uploads/'});
const imageKit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
})
const port = process.env.PORT || 3000;

const server = express();


server.use(express.json());
server.use(cors());
server.use(function(req, res, next){
    req.headers.password != process.env.PASSWORD ? res.status(401).send('Authorization error') : next() 
});
server.post('/upload', upload.single('image'), function(req, res){
    try{
        imageKit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname
        }, function(err, res_i){
            if(err){
                console.log(err);
                return res.status(400).send('ERROR: '+err);
            }
            fs.unlink('uploads/'+req.file.originalname, function(err_f){
                if(err){
                    console.error('ERROR AL ELIMINAR EL ARCHIVO A SUBIR: '+err_f)
                }
            });
            return res.status(200).send(res_i.url); 
        })
    }catch(err){
        return res.status(400).send('ERROR: '+err);
    }
});

server.get('/', (req, res) =>  res.status(200).send("Hola desde Nodejs y Express") );

server.listen(port, (err) => err? console.log(`Error: ${err} `) : console.log(`Servidor iniciado correctamente en el puerto ${port}`) );