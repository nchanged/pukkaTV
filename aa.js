var _ = require('lodash');
var arr = ['2 month1', '1 hour', '1 day', '1 week', '1 year'];


var getAge = function(str)
{
	
	var m = str.match(/(\d{1,3})\s(month|hour|day|week|year|minute)(s)?/);
	if ( m ){
		var duration = m[1] * 1;
		var period = m[2];

		console.log( duration, period);

		
		switch (period){
			case "minute":
				return duration * 60;
			case "hour":
				return (duration * 60) * 60
			case "day":
				return (duration * 86400)
			case "week":
				return (duration * 604800)
			case "month":
				return (duration * 2678400);
			case "year":
				return (duration * 31536000);
		}
	}
	// Very low prioarity
	return 31536000 * 5;
}




console.log( getAge(arr[0]) );