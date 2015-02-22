function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

$(function(){
	var loading = false;
	var currentOffset = 0;
	


/*	
	var genre = req.query.genre;
	var currentGenre = "All Movies"
	var ratingOrder = req.query.rating;
	var yearplus = req.query.year;
    var release = req.query.release;*/


	var loadMore = function()
	{
		var params = getQueryParams(window.location.search);
		currentOffset = currentOffset + 50;
		params.offset = currentOffset;
		params.template = true;
		$.get("/", params, function(html){
			
			if ( !html){

			} else {
				var node = $("<div>" + html + "<div>");
				console.log( node.children().length );
				node.children().each(function(index, item){
					
					$("#main").append($(item));
				});
				setTimeout(function(){
					loading = false;
				},500);
			}
			
		})
		
	}

	$('#main').scroll(function(){
		
		var scroll = $("#main").scrollTop();
		var divHeight = $("#main").height();
		var total = $("#main")[0].scrollHeight - divHeight;
		if ( scroll + 500 > total){
			if ( loading === false){
				loading = true;
				console.log("load more...");
				loadMore();
			}
			
		}
		
	})
})