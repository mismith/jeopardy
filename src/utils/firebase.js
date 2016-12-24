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
		this.unsync(context, name);

		context.firebaseRefs    = context.firebaseRefs || {};
		context.firebaseUnbinds = context.firebaseUnbinds || {};
		context.firebaseRefs[name]    = firebase.database().ref(path.join('/'));
		context.firebaseUnbinds[name] = snapshot => {
			context.setState({
				[name]: snapshot.val(),
			});
		};
		context.firebaseRefs[name].on('value', context.firebaseUnbinds[name]);
	},
	unsync(context, ...names) {
		if (context.firebaseRefs && context.firebaseUnbinds) {
			names.forEach(name => {
				if (context.firebaseRefs[name] && context.firebaseUnbinds[name]) {
					context.firebaseRefs[name].off('value', context.firebaseUnbinds[name]);
				}
			});
		}
	},

	key() {
		return firebase.database().ref().push().key;
	},
}