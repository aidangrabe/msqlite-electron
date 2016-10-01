// You can also require other files to run in this process
const Prefs = require('../../src/Prefs.js')
const exec = require('child_process').exec
const prefsFile = 'prefs.json'

const sqlQueryField = document.getElementById('sql-query')
const sqlOutput = document.getElementById('sql-output')
const packageNameField = document.getElementById('package-name-field')
const databaseNameField = document.getElementById('database-name-field')

const tablesDiv = document.getElementById('tables')
const tablesData = document.getElementById('table-data')

const homeTab = document.getElementById('home-tab')
const queryTab = document.getElementById('query-tab')

const nav = document.getElementById('nav')
const navLinks = nav.querySelectorAll("a").forEach(function(it) {
	const href = it.getAttribute("href")
	it.addEventListener('click', function(event) {
		event.preventDefault()
		switchTab(href)
	})
})

const prefs = new Prefs.Preferences(prefsFile)
const history = []
let currentHistoryIndex = 0

prefs.load(function() {
	packageNameField.value = prefs.getProperty("package") || ""
	databaseNameField.value = prefs.getProperty("database") || ""

	switchTab("#tables")
})

function switchTab(tab) {
	homeTab.style.display = 'none'
	queryTab.style.display = 'none'

	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")

	if (tab === "#tables") {
		homeTab.style.display = 'block'
		const cmd = `adb exec-out "run-as ${packageName} sqlite3 -html -header databases/${databaseName} '.tables'"`
		runSqliteCommand('.tables', function(error, stdout, stderr) {
			const output = stdout
			const tableNames = output.split(" ")
				.map(function(it) {
					return it.trim()
				})
				.filter(function(it) {
					return it.length > 0
				})
				.map(function(it) {
					return `<li><a href="#" onclick="javascript:showTable('${it}')" class="table-button">${it}</a></li>`
				})
				.reduce(function(left, right) {
					return left + " " + right
				})
			tablesDiv.innerHTML = "<div class='info'>Tables: <ul>" + tableNames + "</ul></div>"
		})
	}

	if (tab === "#query") {
		queryTab.style.display = 'block'
	}
}

submitQuery = function() {
	const packageName  = packageNameField.value
	const databaseName = databaseNameField.value
	const sqlQuery = sqlQueryField.value.replace(/\"|\'/g, '\\"')
	
	currentHistoryIndex = history.length
	
	if (packageName != prefs.getProperty("package") || databaseName != prefs.getProperty("database")) {
		prefs.save()
	}
	
	history.push(sqlQuery)
	
	runSqliteCommand(sqlQuery, function(error, stdout, stderr) {
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

function showTable(tableName) {
	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")
	sqlQueryField.value = "SELECT * FROM " + tableName
	switchTab("#query")
	submitQuery()
}

function runSqliteCommand(command, callback) {
	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")
	const cmd = `adb exec-out "run-as ${packageName} sqlite3 -html -header databases/${databaseName} '${command}'"`
	exec(cmd, callback)
}