
const exec = require('child_process').exec

exports.Database = class Database {

	constructor(packageName, databaseName) {
		this.packageName = packageName
		this.databaseName = databaseName
	}

	query(command, callback) {
		const cmd = `adb exec-out "run-as ${this.packageName} sqlite3 -html -header databases/${this.databaseName} '${command}'"`
		exec(cmd, callback)
	}

	runCommand(command, callback) {
		this.query(command, callback)
	}

}