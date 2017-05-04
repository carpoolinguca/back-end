function PhotoRouter(sequelize) {
    var express = require('express');
    var router = express.Router();
    var formidable = require('formidable');
    var util = require('util');

    var UserSystem = require('../controllers/user-administration-system');
    var userSystem = new UserSystem(sequelize);
    var PhotoSystem = require('../controllers/profile-photo-administration-system');
    var photoSystem = new PhotoSystem(sequelize);
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);

    router.route('/upload').post(function(req, res) {
        var form = new formidable.IncomingForm();
        form.uploadDir = "uploads";
        form.keepExtensions = true;

        form.parse(req, function(err, fields, files) {
            /*
            res.writeHead(200, {
                'content-type': 'text/plain'
            });
            res.write('received upload:\n\n');
            */
            var path = files.upload.path;
            var userId = fields.userId;
            console.log("Saved on:");
            console.log(path);
            console.log("for user: " + userId);
            photoSystem.registerOrUpdateIfExists({
                userId: userId,
                fileName: path
            }, function(err, previousPhotoName, registeredPhoto) {
                res.send(registeredPhoto);
            });
            /*
            res.end(util.inspect({
                fields: fields,
                files: files
            }));
            */
        });


        form.on('end', function(fields, files) {
            /*
            // Temporary location of our uploaded file 
            var temp_path = this.openedFiles[0].path;
            // The file name of the uploaded file 
            var file_name = this.openedFiles[0].name;
            // Location where we want to copy the uploaded file 
            var new_location = 'uploads/';

            fs.copy(temp_path, new_location + file_name, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success!")
                }
            });
            */

            //var path = files[0].path;
            //var userId = fields[0].userId;
            console.log("Saved ");
            //console.log(path);
            //console.log("for user: "+ userId);

            //photoSystem.registerOrUpdateIfExists({this.openedFiles[0].path})
        });
    });

    // Show the upload form 
    router.route('/').get(function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        var form = '<form action="/photos/upload" enctype="multipart/form-data" method="post">userId: <input name="userId" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
        res.end(form);
    });

    return router;
}

module.exports = PhotoRouter;