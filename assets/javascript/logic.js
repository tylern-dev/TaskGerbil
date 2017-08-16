$(
(function() {
//start iffy

//link to Firebase
var config = {
	apiKey: "AIzaSyADN_JgqSyWmzLblXwdC7DaS5MsQdYC9cA",
	authDomain: "task-gerbil.firebaseapp.com",
	databaseURL: "https://task-gerbil.firebaseio.com",
	projectId: "task-gerbil",
	storageBucket: "task-gerbil.appspot.com",
	messagingSenderId: "360224380903"
};
firebase.initializeApp(config);

//firebase db referenses
var database = firebase.database();
var auth = firebase.auth();
var loginRef = database.ref("USERS");
var helpRef = database.ref("Help-Form");
var helpRefId = helpRef.push();
// var storage = database.storage();
// var storageRef = storage.ref();

//init variables
var user_firstName;
var user_lastName;
var user_skills;
var userEmail;
var userPassword;
var registerEmail;
var registerPassword;
var downloadURL;
var map;

var userHelper = {
	first_name: user_firstName,
	last_name: user_lastName,
	skills: user_skills,
	rating: "",
	jobs: ""
};

$(".register-card").hide();

$("button").on("click", function() {
	console.log("button clicked");
});

//if user is logged in handling
auth.onAuthStateChanged(function(user) {
	var child;
	hideLoginRegisterDivs(user);
	if (user !== null) {
	userLogin(user);
	retrieveIssue();
	if (userHelper.first_name !== undefined) {
		loginRef.child(user.uid).set(userHelper);
	}
	}
});

//
$("#submit-help").on("click", function(e) {
	e.preventDefault();
	var helpForm = {
	name: $("#user-name").val().trim(),
	address: $("#user-address").val().trim(),
	phone: $("#user-phone").val().trim(),
	email: $("#user-email").val().trim(),
	description: $("#user-description").val().trim(),
	imgURL: downloadURL
	};
	console.log("imgURL" + helpForm.imgURL);

	// //firebase
	helpRefId.set(helpForm);

	$("#lineModalLabel").empty();
	$(".modal-body").empty();
	$(".modal-body").append(
	"<h1 class='text-center'>Someone will contact you within the hour! </h1>" +
		"<button class='btn btn-primary'> Sounds good </button>"
	);
});

/*** IMAGE UPLOAD SECTION ***/
//get element by ID
var filebutton = $("#user-photo");

//listen for file selection
filebutton.on("change", function(e) {
	var file = e.target.files[0];
	var storageRef = firebase.storage().ref("images/" + file.name);
	//upload file
	var task = storageRef.put(file);
	// update progress bar
	task.on("state_changed", function progress(snapshot) {
	//         var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	//         uploader.value = percentage;
	//     },
	function error(err) {}
	function complete() {}
	downloadURL = task.snapshot.downloadURL;
	});
});
/********************** */

/* sign up and login user on click with Firebase */
$(".login-signup").on("click", function(event) {
	event.preventDefault();
	var result = event.currentTarget.id;

	if (result === "register-btn") {
	userHelper.first_name = $("#first-name").val().trim();
	userHelper.last_name = $("#last-name").val().trim();
	userHelper.skills = $("#skills").val().trim();
	registerEmail = $("#email-register").val().trim();
	registerPassword = $("#password-register").val().trim();
	registerUser(registerEmail, registerPassword);
	} else if (result === "login-btn") {
	userEmail = $("#email-user").val().trim();
	userPassword = $("#password-user").val().trim();
	auth
		.signInWithEmailAndPassword(userEmail, userPassword)
		.then(function(user) {
		//nothing
		})
		.catch(function(error) {
		var errCode = error.code;
		var errMessage = error.message;
		$(".card-block").prepend(
			'<p class="alert alert-danger">' + errMessage + "</p>"
		);
		});
	}
	$("form").each(function() {
	this.reset();
	});
});

//handles the signout of the user
$("#user-signout").on("click", function(event) {
	event.preventDefault();

	$(".alert").remove(); //removes any alerts if user logs out and goes to login screen
	auth.signOut().catch(function(error) {
	var errCode = error.code;
	var errMessage = error.message;
	//create error
	});
});

//shows user registration card if register button is pressed on login card
$(".user-login-register").on("click", function(event) {
	// console.log(event)
	var result = event.currentTarget;
	if (result.text === "Register") {
	$(".login-card").hide();
	$(".register-card").show();
	} else if (result.text === "Login") {
	$(".login-card").show();
	$(".register-card").hide();
	}
});

//hides the divs based on login status
function hideLoginRegisterDivs(user) {
	if (user) {
	// console.log(user)
	$(".login-cover").hide();
	$(".login-card").hide();
	$(".register-card").hide();
	} else {
	$(".login-cover").show();
	$(".login-card").show();
	}
}

//registers the user. This function is called when the register button.
function registerUser(registerEmail, registerPassword) {
	auth
	.createUserWithEmailAndPassword(registerEmail, registerPassword)
	.catch(function(error) {
		var errCode = error.code;
		var errMessage = error.message;
		$(".card-block").prepend(
		'<p class="alert alert-danger">' + errMessage + "</p>"
		);
	});
}

//handles the user login stuff and will display the needed info for user
function userLogin(user) {
	var userSignedIn = $("#user-name");
	// console.log(user.uid)
	loginRef.child(user.uid).on("value", function(snapshot) {
	userSignedIn.text(snapshot.val().first_name);
	});
}

function retrieveIssue() {
	helpRef.on("child_added", function(snap) {
	var issueResult = snap.val();
	var issueKey = snap.key;

	var issueTable = $("#issue-table");
	var issueTd = '<td class="issue-table-data">';
	var issueImg =
		issueTd +
		'<img class="issue-img" src="' +
		issueResult.imgURL +
		'" />';
	var issueDescr = issueTd + issueResult.description;
	//var showMoreDataKey = issueKey;
	var showMoreBtn =
		'<button class="btn btn-info show-more" href="#contact" data-toggle="modal" data-target="#taskModal" data-fbKey="' +
		issueKey +
		'">More Info</button>';
	// var showMore = issueTd + showMoreBtn;
	var issueAcceptAndShowMore =
		issueTd +
		showMoreBtn +
		'<button class="btn btn-success issue-accept-btn">Accept</button>';

	issueTable.append(
		'<tr class="issue-table-row">' +
		issueImg +
		issueDescr +
		issueAcceptAndShowMore +
		"</tr>"
	);

	//showMoreDetails()
	});
}

$("#taskModal").on("show.bs.modal", function(e) {

	setTimeout(function() {
	// map = new google.maps.Map(
	// 	document.getElementById("map_canvas"),
	// 	myOptions
	// );
	var currentCenter = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(currentCenter);
	}, 500);
});

$("body").on("click", ".show-more", function(event) {
	// event.stopPropagation();

	var childKey = $(this).attr("data-fbKey");
	var showMoreDiv = $(".temp-div");
	var map;
	//$('.modal-body').append()
	// showMoreDiv.html('clicked')
	helpRef.child(childKey).once("value", function(snapshot) {
	var address = snapshot.val().address;
	// showMoreDiv.append(address);
	googleMapRetrieve(address);
	showMoreDiv.append(snapshot.val().name);
	$(".first-name").html(snapshot.val().name);
	$(".email").html(snapshot.val().email);
	$(".phone").html(snapshot.val().phone);
	$(".address").html(snapshot.val().address);
	$(".image").html(
		'<img class="img-fluid" src="' + snapshot.val().imgURL + '">'
	);

	console.log(snapshot.val());
	});

	// $(".issue-accept").on(events, function(e) {
	// e.preventDefault;
	// });

	// $('#contact').on('show.bs.modal', function (){
	//   google.maps.event.trigger(map, "resize");
	// });
});
// function showMoreDetails(){
//  $('.show-more').on('click', function(event){
//     var childKey = $(this).attr('data-fbKey')
//     var showMoreDiv = $('.temp-div');
//     // showMoreDiv.html('clicked')
//     helpRef.child(childKey).on('value',function(snapshot){
//         showMoreDiv.append(snapshot.val().name)
//         console.log(snapshot.val())
//     })

//     })
// }

$('body').on('click', '.issue-accept-btn', function(event){
	var row = $(this).closest('tr').html();
	$('#accepted-table').append('<tr>'+row);
})

/*** GOOGLE MAPS CODE ***/
// var address ="Salt Lake City, UT";
function googleMapRetrieve(address) {
	var geocoder;

	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(-34.397, 150.644);
	var myOptions = {
	zoom: 8,
	center: latlng,
	mapTypeControl: true,
	mapTypeControlOptions: {
		style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
	},
	navigationControl: true,
	mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(
	document.getElementById("map_canvas"),
	myOptions
	);
	if (geocoder) {
	geocoder.geocode({ address: address }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
			map.setCenter(results[0].geometry.location);
			var infowindow = new google.maps.InfoWindow({
			content: "<b>" + address + "</b>",
			size: new google.maps.Size(150, 50)
			});
			var marker = new google.maps.Marker({
			position: results[0].geometry.location,
			map: map,
			title: address
			});
			google.maps.event.addListener(marker, "click", function() {
			infowindow.open(map, marker);
			});
		} else {
			alert("No results found");
		}
		} else {
		alert(
			"Geocode was not successful for the following reason: " + status
		);
		}
	});
	}
}
/* ******************** */
})()
); //END OF IFFY DONT CODE PAST THIS!
