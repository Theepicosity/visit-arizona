# Visit Arizona! Documentation

## I - Intro

Visit Arizona! is a program designed to suggest attractions to tourists to Arizona, as well as allow visitors to search for attractions they would want to see.
The program is intended for use in a public setting, such as a library or tourism center.

This program runs off of the node.js 16.9.1 framework, available for download here: https://nodejs.org/en/download/.
It has two dependencies: Electron 16.0.5 and google-trends-api 4.9.2.

Below is a thorough documentation of all of the functions associated with the program.

## II - main.js

This is the file run via node.js. It is responsible for initializing electron, which loads the program window and preload.js.

This file mostly contains boilerplate code, found and adapted from https://www.electronjs.org/docs/latest/tutorial/quick-start. Please refer to the node.js documentation for more information.

This file is critical, and should not need to change very often.

## III - preload.js

This is the file run via electron, initialized in main.js. It interacts with google-trends-api and test.json. It is responsible for loading article and trends data.

The bulk of the code is a loop which runs through every article and calls the function `googleTrends.interestOverTime()` from google-trends-api using the article data as an input.
It generates a global array of promises which is bridged to renderer.js as `trends`.
Each of these promises return an object when resolved, and throws an error if there is an error.
The article data itself, obtained from test.json, is also bridged to renderer.js.

This file may be modified for changed or additions that require the use of an API. Within the electron workflow, the preload script allows for interfacing between node.js and the document itself.

## IV - renderer.js

This is the file run via index.html. It handles most of the logic and control flow of the program that doesn't require interfacing with the APIs or node.js.

### onLoad()

This function is called when all of the promises in the trends array have been fulfilled.
It sets several global variables, then takes the data bridged from test.json and pushes each object into an array.

### onSearch()

This function is called whenever the search parameters are updated. It is called in the `onkeyup` event of the search bar, as well as the `onSort()`, `onFilter()`, and `onTrendLoad()` functions.

The function is split into four parts.
The first part finds the value of the search bar and creates a new RegEx from it. It also sets the variable `r` to 0.
The second part concerns the "relevant" sort method. It checks if the user is searching, and sets the sort method to 2 if they are and to 0 if they are not.
The third part calls `refresh()` to get the current sorting method. Then, if the sorting method is 2, articles are assigned scores based on how much of the RegEx they contain. 
The last part is a loop which goes through each article and changes its visibility depending on if it matches the RegEx and filters.

### onSort()

This function is called whenever the sort method is updated. It finds the value of the sort method element and sets the current sort method to it.
It then calls `onSearch()`.

### onFilter(value)

This function is called whenever the filters are updated. It takes the value passed to it by the filter.
The value is first checked to see if it is `"ALL"`, in which case it flips the value of the showAll variable.
Otherwise, the showAll variable is true. If it is true, then it is set to false and the element is unchecked. Then, if the value is already in the array of selected filters, it is popped from that array. If it isn't, the value is pushed to that array.
It then calls `onSearch()`

### refresh()

This function reloads the sorting method and replaces the article elements. It is called only by `onSearch()`.

This function is split into two parts.
The first part reloads the sorting methods by finding the current selected sorting method, then sorting the artciels according to that method.
The second part replaces the articles by looping through each article, removing the element associated with it, then creating a new element. This is done so that all of the information in the article is consistent and never incorrect or out-of-place.

### onTrendLoad(rs)

This function is called whenever a promise from a trend is fulfilled.

This function also has two parts.
The first part processes the data from the value returned to it. The value returned will always be an array of objects (unless it is empty). The processed data is then put into an object and the object is pushed to the `trendObjects` array.
The second part combines the processed data and the article data. Both arrays are sorted, then each object from the arrays is merged into a single new object that is an entry in a new array. This new array is the complete set of data used for organizing articles.

### onHelp()

This function is called whenever the help button is pressed.
If the help bar is visible, it hides it and sets the help text to an empty string.
Otherwise, it shows the help bar and calls `onHelpSearch`.

### onHelpSearch()

This function is called by `onHelp()`, and in the `onkeyup` event of the help search bar.
First, it gets the value of the help search bar and establishes the `helpText` variable.
Then, it runs through a list of possible keywords and appends a new string to `helpText` for every keyword that is included in the value of the help search bar.
Lastly, it sets the innerHTML of the help text element to `helpText`.

## V - index.html

This is the HTML file run via electron. It is headed with CSS and contains all of the filter and sort options, as well as the layout of the program itself.

Formatting tags are as follows:
-<h1> is used for the title at the top of the page.
-<h2> is used for the response dialog, just below the title.
-<h3> is used for the article titles.
-<h4> is used for the data privacy notice.
-<i> is used for photo credits.
-<form> is used for the search bar and sorting method dropdown.
-<article> is used for the article elements.
-<img> is used for the article images.
-<sideinputs> is used for the filter options and "Back to Top" button.
-<rightsideinputs> is used for any options on the right side of the screen.

## VI - test.json

This is the file which contains all data for the articles. It is written in a predictable format, so expanding the database of articles should be very easy.
The format is as follows:
```
{
	"title": "string",
	"picture": "string url/path",
	"description": "string",
	"tags": [array],
	"website": "string url",
	"credits": "string"
}
```