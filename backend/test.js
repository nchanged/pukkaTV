var lib = require('./lib');

var torrent = "magnet:?xt=urn:btih:92902BAD3AD8201349115E9DFE8B3FA70F7BC49F&dn=day+of+the+mummy+2014+hdrip+xvid+ift&tr=udp%3A%2F%2F12.rarbg.me%3A80%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337";

/*
lib.aria2.download({
    link: torrent,
    destination: '/Users/iorlov/work/nodejs/pukkaTV/downloads',
    onProgress : function(data){
    	console.log("GOT SHIT " + data);
    }
});*/

lib.imdb.search({name :"Constantine"  }, function(list){
	console.log(list);
});


