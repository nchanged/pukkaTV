var Client = require('utorrent-api');
 
var utorrent = new Client('localhost', '50759');
utorrent.setCredentials('admin', '123');
 
utorrent.call('list', function(err, torrents_list) {
    if(err) { console.log(err); return; }
 
    console.log(torrents_list);
});

/*
var magnetLink = "magnet:?xt=urn:btih:C353F618210665A77BCE482A1EE571112E24AFC3&dn=the+hunger+games+mockingjay+part+1+2014+1080p+brrip+x264+yify&tr=http%3A%2F%2Ftracker.trackerfix.com%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.com%3A1337";
utorrent.call('add-url', {'s': magnetLink, "path" : "/Users/iorlov/Desktop/PukkaDownloads"}, function(err, data) {
        if(err) { console.log('error : '); console.log(err); return; }
 
        console.log('Successfully added torrent file !');
        console.log(data);
  });
*/
utorrent.call("getsettings", function(e, data){
	console.log( JSON.stringify(data.settings, 4, 3) );
})