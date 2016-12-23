import firebase from 'firebase';

firebase.initializeApp({
	apiKey: "AIzaSyARamMfvpYMaEp2PcMtU8KD5Y07N0W-RYM",
	authDomain: "jeopardy-3a6a8.firebaseapp.com",
	databaseURL: "https://jeopardy-3a6a8.firebaseio.com",
	storageBucket: "jeopardy-3a6a8.appspot.com",
	messagingSenderId: "1020428070652",
});
export default {
	...firebase,

	sync(context, name, ...path) {
		context.firebaseRefs = context.firebaseRefs || {};
		context.firebaseRefs[name] = firebase.database().ref(path.join('/'));
		context.firebaseRefs[name].on('value', snapshot => {
			context.setState({
				[name]: snapshot.val(),
				[`${name}Loaded`]: true,
			});
		});
	},
	unsync(context, ...names) {
		if (context.firebaseRefs) {
			names.forEach(name => {
				if (context.firebaseRefs[name]) {
					// @TODO: unbind
				}
			});
		}
	},

	key() {
		return firebase.database().ref().push().key;
	},
}