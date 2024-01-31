///this is where the bulk of the code is located! this file has 8 functions.

///this function is used to initialize all of the variables and set up the trends' promises.
function onLoad() {
	sortMethod = 0
	showAll = true
	trendObjects = []
	articleObjects = []
	filters = []
	cityFilter = ""
	errorCount = 0 //used to count the number of articles with invalid data. see onTrendLoad().
	
	articleObjectsMinusTrends = window.test
	console.log(articleObjectsMinusTrends)
	trends = window.trends
	console.log(trends)

	for (i in articleObjectsMinusTrends) { //this loop initializes the articles for the first time.
		var DOMelement = document.createElement("article");
		document.body.appendChild(DOMelement);
		DOMelement.id = i;
		trends[i].result.then(function(result) {onTrendLoad(result)})
	}
}

///called when a trend's promise is fulfilled. figures out all of the article properties and puts them all into a neat array.
function onTrendLoad(results) {
	console.log(results)
	let obj = new Object()
	obj.score = 0
	if(results.result == undefined) { //sometimes the google api goes awry and doesnt return the necessary data. this checks for that and allows room for failsafes.
		console.warn("Article data is undefined.")
		difference = 0
		obj.title = results.title
		errorCount += 1
	}
	else {
		if(results.result.default.timelineData.length == 0) { //when there is not enough data, the api returns an empty array, so this checks for that.
			console.warn("Article data does not exist.")
			difference = 0
		}
		else {
			difference = results.result.default.timelineData[17].value[0] - results.result.default.timelineData[0].value[0] //calculates the difference between now and 2 weeks (12 days) prior.
		}
		obj.title = results.title
	}
	obj.trend = difference
	trendObjects.push(obj)
	
	if(trendObjects.length == articleObjectsMinusTrends.length) { //when all the trends are loaded, do this
		trendObjects = trendObjects.slice().sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1)
		articleObjectsMinusTrends = articleObjectsMinusTrends.slice().sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1) //sort both lists so they can be zippered nicely
		for (i in articleObjectsMinusTrends) {
			articleObjects[i] = new Object()
			Object.assign(articleObjects[i], articleObjectsMinusTrends[i], trendObjects[i]); //now that both lists are sorted the same, they can all be merged into a single full list just by going one-by-one!
		}
		DOMelement = document.getElementById("notice")
		if(errorCount >= trendObjects.length) DOMelement.innerHTML += "Article trends data is obtained via a local backup."
		else if(errorCount != 0) DOMelement.innerHTML += "Article trends data is obtained via Google Trends and a local backup."
		else DOMelement.innerHTML += "Article trends data is obtained via Google Trends."
		console.log(articleObjects)
		console.log(trendObjects)
		onSearch() // this is called to initialize the sorting method and current search so it is never out-of-line
	}
}

///this function is called when searching for things. it filters the articles and sorts them by the relevant sorting method.
function onSearch() {
	x = document.getElementById("query").value; // takes in the users input as a regular expression.
	regex = new RegExp(x, "i");
	var articleCount = 0 //this variable is used to count the number of articles.
	
	if(x.length == 1) { // automatically swtich to relevant method when searching, though still allow it to be changed back.
		sortMethod = 2;
		var DOMelement = document.getElementById("sorts")
		DOMelement.selectedIndex = sortMethod;
	}
	else if(x.length == 0 && sortMethod == 2) { // ...and switch it back when not searching!
		sortMethod = 0;
		var DOMelement = document.getElementById("sorts")
		DOMelement.selectedIndex = sortMethod;
	}
	
	refresh()
	if(sortMethod == 2) { //this assigns a relevancy score to each article based off of the regex. of course, it is only in use if the relevant sort method is applied.
		for (i in articleObjects) {
			articleObjects[i].score = ((articleObjects[i].title.search(regex)/articleObjects[i].title.length)+(articleObjects[i].description.search(regex)/articleObjects[i].description.length))/2
		}
	}
	
	for (i in articleObjects) { //goes through each article.
		var DOMelement = document.getElementById(i); //get the article element.
		DOMelement.style.display = "none";
		if (regex.test(articleObjects[i].title) == true || regex.test(articleObjects[i].description) == true) { // if it matches the regex, it is unhidden.
			DOMelement.style.display = "block";
			if(showAll == false) { //however, if it matches the regex it must also go through the filters, unless showall is enabled in which case all articles can be seen.
				if(filters.length == 0 && cityFilter == "") DOMelement.style.display = "none"; //show no articles if no filters are selected.
				else {
					for (j in filters) { //otherwise, if there are selected filters, go through each of them and if the article doesnt have one of them, it gets hidden.
						if(articleObjects[i].tags.includes(filters[j]) == false) DOMelement.style.display = "none";
					} //then check for the city filter!
					if(cityFilter != "" && articleObjects[i].tags.includes(cityFilter.toLowerCase()) == false) DOMelement.style.display = "none";
				}
			}
			if(DOMelement.style.display == "block") articleCount++ //if the article is unhidden, increment the article counter.
		}
	}
	document.getElementById("response").innerHTML = articleCount + " result"+(articleCount == 1 ? "" : "s")+" found." //classic. show the number of articles at the top.
}

///this function is called when the selected sort method is updated.
function onSort() {
	var DOMelement = document.getElementById("sorts")
	sortMethod = DOMelement.selectedIndex;
	onSearch()
}

///this function is called when the selected filter is updated. it pushes the new filter to the filter array, or sets the cityFilter.
function onFilter(value) {
	if(value == "ALL") { //just change the showAll variable.
		showAll = !showAll
	}
	else { //reset the showAll variable and uncheck the showAll filter. then, push or pop the corresponding filter.
		if(showAll == true) { 
			showAll = false
			DOMelement = document.getElementsByTagName("sideinputs")[0].getElementsByTagName("input")[0]
			DOMelement.checked = false
		}
		if (value == "city") cityFilter = document.getElementById("cityFilter").value
		else if(filters.includes(value)) filters.splice(filters.indexOf(value), 1)
		else filters.push(value)
	}
	onSearch()
}

///this function has two purposes: 1. sort all of the articles based on the sortMethod and 2. render all of the article contents. 
function refresh() {
	var DOMelement = document.getElementById("sorts")
	sortMethod = DOMelement.selectedIndex; // find the dropdown, find what the user has selected.
	if(sortMethod == 0) articleObjects = articleObjects.slice().sort((a, b) => (a.trend < b.trend) ? 1 : -1) // neat! this sorts them by length, but it should also sort them by other variables.
	else if(sortMethod == 1) articleObjects = articleObjects.slice().sort((a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : -1)
	else if(sortMethod == 2) articleObjects = articleObjects.slice().sort((a, b) => (a.score < b.score) ? -1 : 1)
	
	for (i in articleObjects) {
		var DOMelement = document.getElementById(i); // remove the articles and replace them at the bottom of the list to sort them.
		DOMelement.remove();
		document.body.appendChild(DOMelement);
		specialtext = " " //adds bonus text, like the trending status or location
		if(articleObjects[i].trend >= 30) specialtext += "🔥 Trending! "
		if(articleObjects[i].tags.includes("phoenix") == true) specialtext += "📍 Phoenix "
		else if(articleObjects[i].tags.includes("queen creek") == true) specialtext += "📍 Queen Creek "
		else if(articleObjects[i].tags.includes("mesa") == true) specialtext += "📍 Mesa "
		else if(articleObjects[i].tags.includes("chandler") == true) specialtext += "📍 Chandler "
		else if(articleObjects[i].tags.includes("tucson") == true) specialtext += "📍 Tucson "
		else if(articleObjects[i].tags.includes("flagstaff") == true) specialtext += "📍 Flagstaff "
		else if(articleObjects[i].tags.includes("bisbee") == true) specialtext += "📍 Bisbee "
		credit = (articleObjects[i].credits == "Public Domain") ? "" : "Image Credit: " + articleObjects[i].credits
		DOMelement.innerHTML = '<a href="'+articleObjects[i].website+'"><img src="'+articleObjects[i].picture+'" style="float:left;width:90px;height:90px;"></a> <h3>'+articleObjects[i].title+'</h3>'+articleObjects[i].description+'<br/><i>'+credit+specialtext+'</i>'
		DOMelement.id = i; //the above line is the html form of the whole article entity.
	}
}

///called when the help button is pressed. displays the help bar.
function onHelp() {
	var DOMelement = document.getElementById("helpquery"); //toggle between showing/not showing the help bar.
	if(DOMelement.style.display == "block") {
		DOMelement.style.display = "none";
		document.getElementById("helpresponse").innerHTML = ""
	}
	else {
		DOMelement.style.display = "block"
		onHelpSearch()
	}
}

///called when the help bar is searched in.
function onHelpSearch() {
	x = document.getElementById("helpquery").value; // takes in the users input, as a regular string this time.
	helpText = "" //this whole thing adds an additional answer for every keyword the user types in.
	if(x == "") helpText += "<br/>This program is designed to give ideas for vacations. Explore somewhere new by looking it up here! <br/>If you have a question, please ask it in the help bar above."
	if(x.includes("search")) helpText += "<br/>Use the search bar in the center to find the attraction you're looking for."
	if(x.includes("sort")) helpText += "<br/>You can sort the articles by using the drop-down menu next to the search bar."
	if(x.includes("result")) helpText += "<br/>The list of the results returned is in the center of the screen. <br/>If you are unable to find results for your search, try changing the filter settings or searching for a broader topic."
	if(x.includes("filter")) helpText += "<br/>The list of filters is found at the right side of the screen, and can help in narrowing your search."
	if(helpText == "") helpText += "<br/>More information can be found by clicking the picture to visit the organization's website."
	document.getElementById("helpresponse").innerHTML = helpText
}

onLoad() ///called to initialize all of the articles.