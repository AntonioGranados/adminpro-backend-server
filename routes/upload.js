var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var coleccionesValidas = ['hospitales', 'medicos', 'usuarios'];

    if (coleccionesValidas.indexOf(tipo) < 0) { // si es menor a 0 quiere decir que no encuentra la coleccion
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no válida',
            errors: { message: 'La colección no es válida' }
        });

    }

    if (!req.files) { // Si no vienen archivos
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al cargar archivos',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen; // obtenemos el nombre  de la imagen que viene en el req y tiene como nombre imagen
    var nombreCortado = archivo.name.split('.'); // Obtenemos la extension del archivo y con el split lo cortamos por el punto
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]; // Obtenemos la extension

    // Arreglo con las extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) { // Si las extensiones validas son menores a 0, es decir, -1 quiere decir que no encontro una extension válida, para eso usamos el indexof
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre del archivo personalizado
    var nombreArchivo = `${id} - ${new Date().getMilliseconds()}.${extensionArchivo}`; // generamos un nombre de archivo personalizado con el id del usuario/un numero aleatorio que los sacaremos de la fecha/y la extension del archivo

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    // Mover el archivo y colocarlo en el path especificado
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivos',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo Movido',
        //     extensionArchivo: extensionArchivo
        // });
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'El usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img; // es la imagen que el usuario ya ha subido

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo); // Elimina la imagen
            }

            usuario.img = nombreArchivo; // almacenamos el nombre del archivo

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al cargar imagen',
                        errors: err
                    });
                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada correctamente',
                    usuario: usuarioActualizado
                });
            });
        });

    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico no existe',
                    errors: { message: 'El medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al cargar imagen',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada correctamente',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe',
                    errors: { message: 'El hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al cargar imagen',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada correctamente',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app; // exportamos para poder utilizarlo fuera de este archivo