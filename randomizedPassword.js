var fs = require('fs');
var promptUser = require('prompt');
	//Borrowed from http://lollyrock.com/articles/nodejs-encryption/
var crypto = require('crypto');
let algorithm = 'aes-256-ctr';
let password = 'd6F3Efeq';

promptUser.start();
console.log("Welcome to the random password generator!\n\nWhat do you want to do?\n\n**** Current commands are: *****\n   >>>'new': If this is your first install run this first to create a new storage file.\n   >>>'add': Manually add a password.\n   >>>'generate': promptUsers you for parameters and generates a random password for you.\n   >>>'get website': Get specific password(s) for a website.\n   >>>'get id': Get a password by ID number. \n   >>>'all': Shows you all passwords currently saved.\n   >>>'delete': Deletes a single password. (CAUTION: This cannot be undone!)\n   >>>'delete all': Deletes all saved passwords. (CAUTION: This cannot be undone!)\n   >>>'exit': Exit program");
promptUser.get(['command'], function (err, result) {
	switch (result.command.toLowerCase()){
		case "new":
			blankJSON(false);
		break;

		case "add":
			promptUser.get(['website','username','password'],function(err, getInput){
				var passwords = fs.readFileSync("passwordStorage.json","utf-8");
				if(passwords === "46cc"){
					passwords = '[{"id": 1, "url":"'+getInput.website+'", "username":"'+getInput.username+'","password":"'+getInput.password+'"}]';
					fs.writeFile("passwordStorage.json", encrypt(passwords), function (err, data) {
						if (err) throw err;
						console.log("Password saved successfully");
					});
					return getInput.password;
				} else {
					var decryptedFile = JSON.parse(decrypt(passwords));
					decryptedFile.push({"id":decryptedFile.length+1, "url":getInput.website, "password":getInput.password});
					fs.writeFile("passwordStorage.json", encrypt(JSON.stringify(decryptedFile)), function (err, data){
						if (err) throw err;
						console.log("Password saved successfully");
					});
					return getInput.password;
				}
			});
		break;

		case "generate":
			console.log("Please specify the following:\n**** Help: ****\nWebsite example: 'www.example.com'\nCase Sensitive: 'true' or 'false'\nSymbols: 'true' or 'false'\nLength: '9'");
			promptUser.get(['website','username','caseSensitive','useSymbols','passwordLength'],function (err, genResult){
				console.log(generatePassword(genResult.website,genResult.username,genResult.caseSensitive,genResult.useSymbols,genResult.passwordLength));
			});
		break;

		case "get website":
			console.log("Which website do you want to retrieve the password(s) for?");
			promptUser.get(["website"],function (err,getResult){
				getPassword("website", getResult.website);
			});
		break;

		case "get id":
			console.log("Enter the ID number for the password you'd like to retrieve.");
			promptUser.get(["id"],function (err,getResult){
				getPassword("id", getResult.id);
			});
		break;

		case "all":
			var passwords = JSON.parse(allPasswords());
			for(var i = 0; i < passwords.length; i++){
				console.log(passwords[i])
			}
		break;

		case "delete":
			console.log("Enter the ID number of the password you'd like to delete.");
			promptUser.get(["id"],function (err,getResult){
				deletePassword(getResult.id);
			});
		break;

		case "delete all":
			console.log("Are you sure [yes/no]?");
			promptUser.get(["sure"],function (err,areYou){
				if (areYou.sure === "yes"){
					blankJSON(true);
				} else if (areYou.sure === "no"){
					console.log("No passwords were deleted. Goodbye!")
				} else {
					console.log("I didn't understand that. Reinitate and try again.")
				}
			})
		break;

		case "exit":
			console.log("Goodbye!")
		break;

		default:
			console.log("Thats not a valid command. Try again.");
	}
});

/* ----------------HOISTED FUNCTIONS---------------- */
	//encrypting json for safe storage in aes-256
	function encrypt(text){
		var cipher = crypto.createCipher(algorithm,password);
		var crypted = cipher.update(text,'utf8','hex');
		crypted += cipher.final('hex');
		return crypted;
	}
	//decrypting json for use in the app
	function decrypt(text){
		var decipher = crypto.createDecipher(algorithm,password);
		var dec = decipher.update(text,'hex','utf8');
		dec += decipher.final('utf8');
		return dec;
	}

	//Function if command word is 'generate'
	function generatePassword(url, username, caseSensitivity, symbols, length){
		var yourPassword = "";
		var passwords = fs.readFileSync("passwordStorage.json","utf-8");
		var availableSymbols = ["!", "#", "$", "%", "&", "*", "+", ",", "-", ".", ":", ";", "<", "=", ">", "?", "@", "[", "]", "^", "_", "`", "|", "}", "~", "(", ")"];
		var availableLetters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "l", "k", "j", "h", "g", "f", "d", "s", "a", "z", "x", "c", "v", "b", "n", "m"];
		if (caseSensitivity === "true" && symbols === "true"){
			for (var i = 0; i < length; i++){
				var choosing = Math.floor(Math.random() * 3);
				if (choosing === 0){
					var upperOrLower = Math.floor(Math.random()*2);
					if (upperOrLower === 1){
						yourPassword += getRandomStuff(availableLetters).toUpperCase();
					} else {
						yourPassword += getRandomStuff(availableLetters).toLowerCase();
					}
				} else if (choosing === 1){
						yourPassword += getRandomStuff(availableSymbols);
				} else {
						yourPassword += Math.floor(Math.random() * 10);
				}
			}
		} else if (caseSensitivity === "false" && symbols === "true"){
			for (var o = 0; o < length; o++){
				var choosing1 = Math.floor(Math.random() * 2);
				if (choosing1 === 0){
					yourPassword += getRandomStuff(availableLetters);
				} else if (choosing1 === 1){
						yourPassword += getRandomStuff(availableSymbols);
				} else {
						yourPassword += Math.floor(Math.random() * 10);
				}
			}
		} else if (caseSensitivity === "true" && symbols === "false"){
			for (var p = 0; p < length; p++){
				var choosing2 = Math.floor(Math.random() * 2);
				if (choosing2 === 0){
					var lowerOrUpper = Math.floor(Math.random()*2);
					if (lowerOrUpper === 1){
						yourPassword += getRandomStuff(availableLetters).toUpperCase();
					} else {
						yourPassword += getRandomStuff(availableLetters).toLowerCase();
					}
				} else {
						yourPassword += Math.floor(Math.random() * 10);
				}
			}
		} else if (caseSensitivity === "false" && symbols === "false") {
			for (var l = 0; l < length; l++){
				var choosing3 = Math.floor(Math.random() * 2);
				if (choosing3 === 0){
					yourPassword += getRandomStuff(availableLetters);
				} else {
					yourPassword += Math.floor(Math.random() * 10);
				}
			}
		//Some information is missing or wrong OR no information provided
		} else {
			return "Something went wrong.";
		}
		//If JSON is empty, write fresh document with object in array
		//Using double equals because triple is too restrictive and returns 'false' when I want 'true'
		if(passwords === "46cc"){
			passwords = '[{"id":1 ,"url":"'+url+'", "username":"'+username+'", "password":"'+yourPassword+'"}]';
			fs.writeFile("passwordStorage.json", encrypt(passwords), function (err, data) {
				if (err) throw err;
				console.log("Password saved successfully");
			});
			return yourPassword;
			//Else just push into existing array off objects
		} else {
			var decryptedFile = JSON.parse(decrypt(passwords));
			decryptedFile.push({"id":decrypt(passwords).length+1,"url":url, "password":yourPassword});
			fs.writeFile("passwordStorage.json", encrypt(JSON.stringify(decryptedFile)), function (err, data){
				if (err) throw err;
				console.log("Password saved successfully");
			});
			return yourPassword;
		}
	}

	//Function if command word is 'get'
	function getPassword(method, input){
		var passwords = fs.readFileSync("passwordStorage.json","utf-8");
		var list = JSON.parse(decrypt(passwords));
		var returnedPasswords = [];
		for (var w = 0; w < list.length; w++){
			if(method === "website"){
				if (list[w].url === input){
					returnedPasswords.push(list[w]);
				}
			}	else if(method === "id"){
				if (list[w]["id"] === parseInt(input)){
					returnedPasswords.push(list[w]);
				}
			}
		}
		if (returnedPasswords.length === 0){
			console.log("Nothing came back with that url");
		} else {
			for (var x = 0; x < returnedPasswords.length; x++){
				console.log(x+1+". url:"+returnedPasswords[x].url+" | password:"+returnedPasswords[x].password+"\n");
			}
		}
	}

	//Function if command word is "all"
	function allPasswords(){
		var passwords = fs.readFileSync("passwordStorage.json","utf-8");
		//encrypted string for ""
		if (passwords == "46cc"){
			return "No passwords saved!"
		} else {
		return decrypt(passwords);
		}
	}

	//Function if command word is "delete"
	function deletePassword(id){
		var passwords = fs.readFileSync("passwordStorage.json","utf-8");
		var listOfPasswords = JSON.parse(decrypt(passwords));
		var isDeleted = false;
		for (var w = 0; w < listOfPasswords.length; w++){
			if (listOfPasswords[w]["id"] === parseInt(id)){
				listOfPasswords.splice(w,1)
				isDeleted = true
				fs.writeFile("passwordStorage.json", encrypt(JSON.stringify(listOfPasswords)), function (err, data){
					if (err) throw err;
				});
			}
		}
		if (isDeleted){
			console.log("Deleted!")
		} else {
			console.log("No password with that ID.")
		}
	};

	function blankJSON(deleteAction){
		var blank = "";
		fs.writeFile("passwordStorage.json", encrypt(JSON.stringify(blank)), function (err, data){
			if (err) throw err;
			deleteAction ? console.log("All passwords deleted! Goodbye!") : console.log("Storage JSON created!");
		});
	};
	
	//DRYing up the process
	function getRandomStuff(array){
		return array[Math.floor(Math.random() * (array.length))];
	}
