// Initialize app
var myApp = new Framework7();

var tkadminURL="http://10.1.0.27:8080/tkadmin";

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    

    console.log("Device is readyzz!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

myApp.onPageInit('display', function (page) {
   $("table#allTable tbody").empty();

    var data = localStorage.getItem("LocalData");
    console.log(data);
    data = JSON.parse(data);
console.log(data);
    var html = "";

    for(var count = 0; count < data.length; count++)
    {
        html = html + "<tr><td>" + data[count][0] + "</td><td><a href='javascript:openURL(\"" + data[count][1] + "\")'>" + data[count][1] + "</a></td></tr>";
    }

    $("table#allTable tbody").append(html);
    
    
         $.ajax({
        url: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
        success: handleResult
    });
})





// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})






    

    function handleResult(result){
        console.log( result.url);
        $(".guguImage").attr('src', result.url);
    }

	
	
	
	
	var db_params = { name: 'tkverifier.db', location: 'default' };

var db = null;
 
document.addEventListener('deviceready', function() {
	console.log('initDb ');
  initDb();
});

function initDb()
{
	myApp.alert('Initdb');
	 db = window.sqlitePlugin.openDatabase(db_params, function (db) {

		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId, deletable)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS ticketCategory (ticketCategoryUUID,description,price,currency, deletable)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS ticket (ticketUUID,date)');
		}, function (error) {
			console.log('transaction error: ' + error.message);
			myApp.alert('Initdb ko');
			//closeDB();
		}, function () {
			console.log('transaction ok');
			myApp.alert('Initdb ok');
			//closeDB();
		});

	}, function (error) {
		console.log('Open database ERROR: ' + JSON.stringify(error));
		myApp.alert('Initdb error' + JSON.stringify(error));
	});
}



function fetchEvents(lastUpdate)
{

	  $.ajax({
        url: tkadminURL + "rest/event/search/"+(lastUpdate?lastUpdate:0),
        success: updateEvents
    });
}

function updateEvents(result)
{
var db = window.sqlitePlugin.openDatabase(db_params, function (db) {
	db.transaction(function (tx) {
	
	var batchQuery = [];
	
	
		batchQuery[batchQuery.length] = 'UPDATE event set deletable = 1';
		batchQuery[batchQuery.length] = 'UPDATE ticketCategory set deletable = 1';
			
		for(var i =0; i < result.length; i++)
		{
			batchQuery[batchQuery.length] = ['INSERT INTO event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId) values (?,?,?,?,?,?)',[result[i].eventUUID,result[i].name,result[i].description,result[i].imageUUID,result[i].artist,result[i].updatedOn,result[i].organizationId]];
			
			for(var j =0; result[i].ticketCategories && j < result[i].ticketCategories; j++)
			{
				batchQuery[batchQuery.length] = ['INSERT INTO ticketCategory (ticketCategoryUUID,description,price,currency) values (?,?,?,?)',[result[i][j].ticketCategoryUUID,result[i][j].description,result[i][j].price,result[i][j].currency]];
			}
		}
		
		batchQuery[batchQuery.length] = 'DELETE FROM event where deletable = 1';
		batchQuery[batchQuery.length] = 'DELETE FROM ticketCategory where deletable = 1';
		
		

  
		
		db.sqlBatch(batchQuery, function() {
			console.log('Update event OK');
			//closeDB();
			countEvent();
			}, function(error) {
			console.log('Update event ERROR: ' + error.message);
			//closeDB();
			});
	
	
	});
	});	

}


function countEvent()
{
		var db = window.sqlitePlugin.openDatabase(db_params, function (db) {

		db.transaction(function (tx) {
			
			db.executeSql('SELECT count(*) AS mycount FROM event', [], function(rs) {
			console.log('Record count (expected to be 2): ' + rs.rows.item(0).mycount);
			myApp.alert('Record count'  + rs.rows.item(0).mycount);
			
		}, function(error) {
			console.log('SELECT SQL statement ERROR: ' + error.message);
		});
		});
	});
}



function closeDB() {
    db.close(function () {
        console.log("DB closed!");
    }, function (error) {
        console.log("Error closing DB:" + error.message);
    });
}