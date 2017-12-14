var db_params = { name: 'tkverifier.db', location: 'default' };

var db = null;
 
document.addEventListener('deviceready', function() {
	console.log('initDb ');
  initDb();
});

function initDb()
{
	 db = window.sqlitePlugin.openDatabase(db_params, function (db) {

		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS event (eventUUID,name,description,imageUUID,artist,updatedOn,organizationId, deletable)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS ticketCategory (ticketCategoryUUID,description,price,currency, deletable)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS ticket (ticketUUID,date)');
		}, function (error) {
			console.log('transaction error: ' + error.message);
			//closeDB();
		}, function () {
			console.log('transaction ok');
			//closeDB();
		});

	}, function (error) {
		console.log('Open database ERROR: ' + JSON.stringify(error));
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