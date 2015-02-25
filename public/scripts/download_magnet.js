$(function(){
	$(".download-magnet").click(function(){
		var id = $(this).attr("magnet_id");
		$.get("/api/download?magnet_id=" + id, function(e){
			if ( !e.err){
				alert("Added to downloads");
			} else {
				alert(e.err);
			}
		},'json');
	});
})