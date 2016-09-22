// You can also require other files to run in this process
const Prefs = require('../../src/Prefs.js')
const exec = require('child_process').exec;
const prefsFile = 'prefs.json'

const sqlQueryField = document.getElementById('sql-query')
const sqlOutput = document.getElementById('sql-output')
const packageNameField = document.getElementById('package-name-field')
const databaseNameField = document.getElementById('database-name-field')

const prefs = new Prefs.Preferences(prefsFile)
const history = []
let currentHistoryIndex = 0

prefs.load(function() {
	packageNameField.value = prefs.getProperty("package") || ""
	databaseNameField.value = prefs.getProperty("database") || ""
})

submitQuery = function() {
	const packageName  = packageNameField.value
	const databaseName = databaseNameField.value
	const sqlQuery = sqlQueryField.value.replace(/\"|\'/g, '\\"')
	const cmd = `adb exec-out "run-as ${packageName} sqlite3 -html -header databases/${databaseName} '${sqlQuery}'"`
	
	currentHistoryIndex = history.length
	
	if (packageName != prefs.getProperty("package") || databaseName != prefs.getProperty("database")) {
		prefs.save()
	}
	
	history.push(sqlQuery)
	
	exec(cmd, function(error, stdout, stderr) {
		if (stdout.length == 0) {
			sqlOutput.innerHTML = "<div class='info'>No Rows</div>"
		} else if (stdout.startsWith('Error: ')) {
			sqlOutput.innerHTML = "<div class='error'>" + stdout + "</div>"
		} else {
			sqlOutput.innerHTML = "<table>" + stdout + "</table>"
		}
	})
}

sqlQueryField.addEventListener('keydown', function(e) {
	if (e.keyCode == 13 && e.metaKey) {
		submitQuery()
	}
	
	if (e.keyCode == 38 && e.metaKey) {
		currentHistoryIndex--
		sqlQueryField.value = history[Math.abs(currentHistoryIndex) % history.length]
	}
	if (e.keyCode == 40 && e.metaKey) {
		currentHistoryIndex++
		sqlQueryField.value = history[Math.abs(currentHistoryIndex) % history.length]
	}
})