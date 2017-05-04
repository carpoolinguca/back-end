var Sequelize;
var User;
var Photo;

function PhotoSystem(sequelize) {
	User = require('../models/user')(sequelize);
	Photo = require('../models/user-photo')(sequelize);
	Sequelize = sequelize;
}


PhotoSystem.prototype.profilePhotoForUserById = function(userId, callback) {
	Photo.findOne({
		where: {
			userId: userId
		},
		attributes: ['id', 'userId', 'fileName']
	}).then(function(photo) {
		callback(photo);
	});
};

PhotoSystem.prototype.registerOrUpdateIfExists = function(photo, callback) {
	Photo.findOne({
		where: {
			userId: photo.userId
		}
	}).then(function(foundPhoto) {
		if (!foundPhoto) {
			Photo.create(photo).then(function(createdPhoto) {
				callback(null, null, createdPhoto);
			});
		} else {
			var previousFileName = foundPhoto.fileName;
			foundPhoto.update(photo, {
				fields: ['fileName']
			}).then(function() {
				foundPhoto.reload().then(function() {
					callback(null, previousFileName, foundPhoto);
				});
			});
		}
	});
};

PhotoSystem.prototype.unregister = function(userId, callback) {
	Photo.findOne({
		where: {
			userId: userId
		}
	}).then(function(foundPhoto) {
		if(!foundPhoto){
			callback(new Error('No se ha encontrado una foto para el usuario con id: ' + userId));
			return;
		}
		var fileName = foundPhoto.fileName;
		foundPhoto.destroy().then(function() {
			callback(null, fileName);
		});
	});
};

PhotoSystem.prototype.destroyAllPhotosFor = function(user, callback) {
	Photo.destroy({
		where: {
			userId: user.id
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

module.exports = PhotoSystem;