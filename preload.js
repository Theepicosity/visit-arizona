const { contextBridge } = require('electron')
const googleTrends = require('google-trends-api')
const articleObjects = require('./test.json')
results = []

///this is what loads data for the articles and google trends api, then pipes it to the renderer process.
//article data is loaded from test.json.

for (i in articleObjects) { //this loop asks the google trends api about every article, and puts each promise as an entry in an array.
	let resultsObject = new Object()
	resultsObject.title = articleObjects[i].title
	resultsObject.result = googleTrends.interestOverTime({keyword: resultsObject.title, startTime: new Date(Date.now() - (20 * 24 * 60 * 60 * 1000))})
	.then(function(output) {
		let resultsNamed = new Object()
		resultsNamed.result = JSON.parse(output)
		resultsNamed.title = resultsObject.title
		return resultsNamed
	})
	.catch(function(error){ //sometimes the google api doesnt return the data due to security concerns, so this works as a failsafe against that.
		console.error("Trends data is invalid")
		let resultsNamed = new Object()
		resultsNamed.result = undefined //checked for later
		resultsNamed.title = resultsObject.title
		return resultsNamed
	});
	results.push(resultsObject)
}

contextBridge.exposeInMainWorld('test', articleObjects)
contextBridge.exposeInMainWorld('trends', results)