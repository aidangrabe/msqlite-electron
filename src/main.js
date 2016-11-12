// You can also require other files to run in this process
const Prefs = require('../../src/Prefs.js')
const QueryTab = require('../../src/QueryTab.js').QueryTab
const Database = require('../../src/Database.js')
const prefsFile = 'prefs.json'

const homeTab = document.getElementById('home-tab')
const queryTab = new QueryTab()

const tablesDiv = document.getElementById('tables')
const tablesData = document.getElementById('table-data')

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
let database

prefs.load(function() {
	const package = prefs.getProperty("package") || ""
	const databaseName = prefs.getProperty("database") || ""

	database = new Database.Database(package, databaseName)

	switchTab("#tables")
})

function switchTab(tab) {
	homeTab.style.display = 'none'
	queryTab.hide()

	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")

	if (tab === "#tables") {
		homeTab.style.display = 'block'
		const cmd = `adb exec-out "run-as ${packageName} sqlite3 -html -header databases/${databaseName} '.tables'"`
		database.runCommand('.tables', function(error, stdout, stderr) {
			const output = stdout
			if (output.length == 0) {
				return
			}
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
		queryTab.show()
	}
}

function showTable(tableName) {
	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")
	const sql = "SELECT * FROM " + tableName

	switchTab("#query")
	queryTab.setSql(sql)
	queryTab.submitQuery()
}