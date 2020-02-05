var express = require('express');
var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo; // obtenemos el tipo de coleccion usuarios, medicos u hospitales
    var img = req.params.img; // obtenemos la imagen guardada 

    var pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`); // creamos el path para encontrar la imagen. Con el dirname siempre obtenemos la ruta donde nos encontramos en este momento

    if (fs.existsSync(pathImagen)) { // Verificamos si la imagen existe o no
        res.sendFile(pathImagen); // Enviamos la imagen
    } else { // si no existe
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg'); // Ponemos una imagen por defecto
        res.sendFile(pathNoImage);
    }
});

module.exports = app; // exportamos para poder utilizarlo fuera de este archivo