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



    function handleResult(result){
        console.log( result.url);
        $(".guguImage").attr('src', result.url);
    }

	
	
	
	// Wait for PhoneGap to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);


    // PhoneGap is ready
    //
    function onDeviceReady() {
        var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
        db.transaction(createDB, errorCB, successCB);
    }

    // Populate the database 
    //
    function createDB(tx) {
		tx.executeSql('DROP TABLE IF EXISTS event');
		tx.executeSql('DROP TABLE IF EXISTS ticketCategory');
		tx.executeSql('DROP TABLE IF EXISTS ticket');
		tx.executeSql('CREATE TABLE IF NOT EXISTS event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId, deletable)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS ticketCategory (ticketCategoryUUID,description,price,currency, deletable)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS ticket (ticketUUID,date)');	
    }

    // Transaction error callback
    //
    function errorCB(tx, err) {
        myApp.alert("Error processing SQL: "+err);
    }

    // Transaction success callback
    //
    function successCB() {
        myApp.alert("success!");
		fetchData();
    }
	

	function fetchData()
	{
		$.ajax({
			url: tkadminURL + "rest/event/search/0",
			success: updateEvents
		});
	}	


	
	function updateEvents(result)
	{
	    var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
        db.transaction(_updateEvents, result, errorCB, successCB);
	}
	
	
	function _updateEvents(tx, result)
	{
	
		var batchQuery = [];
	
		tx.executeSql('UPDATE event set deletable = 1');
		tx.executeSql('UPDATE ticketCategory set deletable = 1');

		for(var i =0; i < result.length; i++)
		{
			tx.executeSql(['INSERT INTO event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId) values (?,?,?,?,?,?)',[result[i].eventUUID,result[i].name,result[i].description,result[i].imageUUID,result[i].artist,result[i].updatedOn,result[i].organizationId]]);
			
			for(var j =0; result[i].ticketCategories && j < result[i].ticketCategories; j++)
			{
				tx.executeSql(['INSERT INTO ticketCategory (ticketCategoryUUID,description,price,currency) values (?,?,?,?)',[result[i][j].ticketCategoryUUID,result[i][j].description,result[i][j].price,result[i][j].currency]]);
			}
		}

		tx.executeSql('DELETE FROM event where deletable = 1');
		tx.executeSql('DELETE FROM ticketCategory where deletable = 1');
	
		myApp.alert("success!!!!!!");
		

}
	
	



	
	