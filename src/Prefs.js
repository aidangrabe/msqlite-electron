const fs = require('fs')

exports.Preferences = class Preferences {

	constructor(filename) {
		this.filename = filename
		this.prefs = {}
	}
	
	getProperty(key) {
		return this.prefs[key]
	}
	
	setProperty(key, value) {
		this.prefs[key] = value
	}
	
	load(callback) {
		fs.readFile(prefsFile, (err, data) => {
			this.prefs = JSON.parse(data)
			callback(this.prefs)
		})
	}
	
	save() {
		fs.writeFile(prefsFile, JSON.stringify(this.prefs), function(err) {
			if (err) {
				alert("Error saving preferences :/")
				console.log(err)
			}
		})
	}
	
}
