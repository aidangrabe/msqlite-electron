const tab = document.getElementById('home-tab')

const tablesDiv = document.getElementById('tables')
const tablesData = document.getElementById('table-data')

exports.DashboardTab = class {

	constructor(database) {
		this.database = database
		this.loadTables()
	}

	show() {
		tab.style.display = 'block'
	}

	hide() {
		tab.style.display = 'none'
	}

	loadTables() {
		this.database.runCommand('.tables', function(error, stdout, stderr) {
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
					return `<li><a href="#" onclick="javascript:DashboardTab.showTable('${it}')" class="table-button">${it}</a></li>`
				})
				.reduce(function(left, right) {
					return left + " " + right
				})
			tablesDiv.innerHTML = "<div class='info'>Tables: <ul>" + tableNames + "</ul></div>"
		})
	}	

	static showTable(tableName) {
		const packageName = prefs.getProperty("package")
		const databaseName = prefs.getProperty("database")
		const sql = "SELECT * FROM " + tableName

		switchTab("#query")
		queryTab.setSql(sql)
		queryTab.submitQuery()
	}

}