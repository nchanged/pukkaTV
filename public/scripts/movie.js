$(function(){
	$('#main').scroll(function(){
		
		var scroll = $("#main").scrollTop();
		var total = $("#main")[0].scrollHeight
		console.log(total, scroll);
	})
})