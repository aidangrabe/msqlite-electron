
const exec = require('child_process').exec

const sqlQueryField = document.getElementById('sql-query')
const sqlOutput = document.getElementById('sql-output')
const packageNameField = document.getElementById('package-name-field')
const databaseNameField = document.getElementById('database-name-field')
const queryTab = document.getElementById('query-tab')

exports.QueryTab = class QueryTab {

	constructor() {
		this.setupListener()
		this.hide()
	}

	show() {
		queryTab.style.display = 'block'
	}

	hide() {
		queryTab.style.display = 'none'
	}

	submitQuery() {
		const packageName  = packageNameField.value
		const databaseName = databaseNameField.value
		const sqlQuery = sqlQueryField.value.replace(/\"|\'/g, '\\"')
		
		currentHistoryIndex = history.length
		
		if (packageName != prefs.getProperty("package") || databaseName != prefs.getProperty("database")) {
			prefs.save()
		}
		
		history.push(sqlQuery)
		
		this.runSqliteCommand(sqlQuery, function(error, stdout, stderr) {
			if (stdout.length == 0) {
				sqlOutput.innerHTML = "<div class='info'>No Rows</div>"
			} else if (stdout.startsWith('Error: ')) {
				sqlOutput.innerHTML = "<div class='error'>" + stdout + "</div>"
			} else if (stdout.indexOf("<TD>") != -1) {
				sqlOutput.innerHTML = "<table>" + stdout + "</table>"
			} else {
				sqlOutput.innerHTML = "<pre>" + stdout + "</pre>"
			}
		})
	}

	setSql(sql) {
		sqlQueryField.value = sql
	}

	runSqliteCommand(command, callback) {
		const packageName = prefs.getProperty("package")
		const databaseName = prefs.getProperty("database")
		const cmd = `adb exec-out "run-as ${packageName} sqlite3 -html -header databases/${databaseName} '${command}'"`
		exec(cmd, callback)
	}

	setupListener() {
		const that = this
		sqlQueryField.addEventListener('keydown', function(e) {
			if (e.keyCode == 13 && e.metaKey) {
				that.submitQuery()
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
	}

}
