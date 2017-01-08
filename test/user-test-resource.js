var userAdministrationSystem;
var users;

function UserTestResource(anUserAdministrationSystem) {
	userAdministrationSystem = anUserAdministrationSystem;
}

UserTestResource.prototype.registerUsers = function(callback) {
	var userJuana = {
		email: 'juana@gmail.com',
		password: '1234',
		name: 'Juana',
		lastname: 'La Loca',
		ucaid: '020800233',
		sex: 'Femenino',
	};
	var userJacinta = {
		email: 'jacinta@gmail.com',
		password: '4321',
		name: 'Jacinta',
		lastname: 'La Cinta',
		ucaid: '020800234',
		sex: 'Femenino',
	};
	users = [userJuana, userJacinta];

	userAdministrationSystem.register(userJuana, function(anUser) {
		users[0] = anUser;
		userAdministrationSystem.register(userJacinta, function(anotherUser) {
			users[1] = anotherUser;
			callback(users);
		});
	});
};

UserTestResource.prototype.destroy = function(callback) {
	userAdministrationSystem.destroy(users[0], function() {
        userAdministrationSystem.destroy(users[1], function() {
          callback();
        });
      });
};

module.exports = UserTestResource;