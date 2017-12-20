	// Initialize app
	var myApp = new Framework7();

	var tkadminURL="http://192.168.1.111:8080/tkadmin/";

	
	
	// If we need to use custom DOM library, let's save it to $$ variable:
	var $$ = Dom7;

	// Add view
	var mainView = myApp.addView('.view-main', {
		// Because we want to use dynamic navbar, we need to enable it for this view:
		dynamicNavbar: true
	});

	// Handle Cordova Device Ready Event
	$$(document).on('deviceready', function() {
		console.log("Device is ready!");
	});


	// Now we need to run the code that will be executed only for About page.
	myApp.onPageInit('info', function (page) {
		//myApp.alert("Access granted","Message");
	})



	//***********************************************************************************
	//* SCANNER SECTION
	//***********************************************************************************

    function scan()
    {
        cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled)
            {
                if(result.format == "QR_CODE")
                {
					try
					{
						var ticketInfo = JSON.parse(result.text);
						if(ticketInfo && ticketInfo.ticketUUID){
							spendTicket(ticketInfo.ticketUUID)
						}
						else
							myApp.alert("Wrong code","Error", scan);
					}
					catch(Ex)
					{
						myApp.alert("Wrong code","Error", scan);
					}
                    
                }
            }
        },
        function (error) {
            alert("Scanning failed: " + error);
        }
   );}
   

   
   
   

	//***********************************************************************************
	//* DB SECTION
	//***********************************************************************************
	
	// Wait for PhoneGap to load
    document.addEventListener("deviceready", onDeviceReady, false);


    // PhoneGap is ready
    //
    function onDeviceReady() {
        var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
        db.transaction(createDB, errorCB, createDBsuccessCB);
    }

    // Populate the database 
    //
    function createDB(tx) {
		tx.executeSql('DROP TABLE IF EXISTS event');
		tx.executeSql('DROP TABLE IF EXISTS ticketCategory');
		//tx.executeSql('DROP TABLE IF EXISTS ticket');
		tx.executeSql('CREATE TABLE IF NOT EXISTS event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId, deletable)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS ticketCategory (ticketCategoryUUID,description,price,currency, deletable)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS ticket (ticketUUID, date)');	
    }

	// Transaction success callback
    //
    function createDBsuccessCB() {
		fetchData();
    }
	
	
	//Fetches data from service
	//
	function fetchData()
	{
		$.ajax({
			type: "GET",
			url: tkadminURL + "rest/event/list/0",
			dataType: 'json',
			success: updateEvents
		});
	}
	
	
	function updateEvents(result)
	{
		console.log("updateEvents");
	    var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
        db.transaction(
        function _updateEvents(tx)
		{
			var batchQuery = [];
	
			tx.executeSql('UPDATE event set deletable = 1');
			tx.executeSql('UPDATE ticketCategory set deletable = 1');

			for(var i =0; i < result.length; i++)
			{
				
				
				var eventUUID = result[i].eventUUID ? result[i].eventUUID : null;
				var name = result[i].name ? result[i].name : null;
				var description = result[i].description ? result[i].description : '';
				var imageUUID = result[i].imageUUID ? result[i].imageUUID : '';
				var artist = result[i].artist ? result[i].artist : '';
				var updatedOn = result[i].updatedOn ? result[i].updatedOn : '';
				var organizationId = result[i].organizationId ? result[i].organizationId : '';
					
				
				tx.executeSql('INSERT INTO event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId) values (?,?,?,?,?,?,?)',[eventUUID,name,description,imageUUID,artist,updatedOn,organizationId]);
			
			
				
			
				for(var j =0; result[i].ticketCategories && j < result[i].ticketCategories.length; j++)
				{
				
					var ticketCategoryUUID = result[i].ticketCategories[j].ticketCategoryUUID ? result[i].ticketCategories[j].ticketCategoryUUID : null;
					var description = result[i].ticketCategories[j].description ? result[i].ticketCategories[j].description : null;
					var price = result[i].ticketCategories[j].price ? result[i].ticketCategories[j].price : null;
					var currency = result[i].ticketCategories[j].currency ? result[i].ticketCategories[j].currency : null;
		
					tx.executeSql('INSERT INTO ticketCategory (ticketCategoryUUID,description,price,currency) values (?,?,?,?)',[ticketCategoryUUID,description,price,currency]);
				}
			}

			tx.executeSql('DELETE FROM event where deletable = 1');
			tx.executeSql('DELETE FROM ticketCategory where deletable = 1');

			tx.executeSql('SELECT * FROM event', [], querySuccess, errorCB);
			tx.executeSql('SELECT * FROM ticketCategory', [], querySuccess, errorCB);
	

		},
		errorCB
		
        

       );
	}
	
	
	function spendTicket(ticketUUID)
	{
	    var db = window.openDatabase("Database", "1.0", "PhoneGap Demo", 200000);
        db.transaction(
		function _spendTicket(tx)
		{
			tx.executeSql('SELECT * FROM ticket where ticketUUID = ?', [ticketUUID], 
			
			function _querySuccess(tx, results)
			{
				if(results.rows.length==0)
				{

					tx.executeSql('INSERT INTO ticket (ticketUUID, date) values (?,?)',[ticketUUID, new Date()]);
					 myApp.alert("Access granted","Message",scan);
				}
				else
				{
					myApp.alert("Ticket Spent on " + results.rows.item(0).date,"Alert", scan);
				}
				
			}
			, errorCB);

		});
	}
	
	
	
	// Transaction error callback
    function errorCB(err) {
        myApp.alert("Error processing SQL: "+err.message,"Error");
    }
	
	
	function querySuccess(tx, results) {

    	//myApp.alert("Inserted  " + results.rows.length + " rows");
	}
	
	
		



	
	