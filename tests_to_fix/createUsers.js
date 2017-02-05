module.exports = function(User) {

var createUsers = function(next) {
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
	var users = [userJuana, userJacinta];

	User.create(userJuana).then(function(anUser) {
		users[0] = anUser;
		User.create(userJacinta).then(function(anotherUser) {
			users[1] = anotherUser;
			next(users);
		});
	});
};
	return createUsers;
};