// You can also require other files to run in this process
const Prefs = require('../../src/Prefs.js')
const QueryTab = require('../../src/QueryTab.js').QueryTab
const DashboardTab = require('../../src/DashboardTab.js').DashboardTab
const Database = require('../../src/Database.js')
const prefsFile = 'prefs.json'

let database
let dashboardTab
let queryTab

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
	const package = prefs.getProperty("package") || ""
	const databaseName = prefs.getProperty("database") || ""

	database = new Database.Database(package, databaseName)
	dashboardTab = new DashboardTab(database)
	queryTab = new QueryTab()

	switchTab("#tables")
})

function switchTab(tab) {
	dashboardTab.hide()
	queryTab.hide()

	const packageName = prefs.getProperty("package")
	const databaseName = prefs.getProperty("database")

	if (tab === "#tables") {
		dashboardTab.show()
	}

	if (tab === "#query") {
		queryTab.show()
	}
}