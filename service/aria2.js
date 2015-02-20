var Aria2 = require('aria2');

module.exports = {
	

    connect: function(options) {
    	var self = this;
        this.client = new Aria2(options);
        
       	var client = this.client;
        this.client.onclose = function() {
            self.connected = false;
        };

        this.client.onsend = function(m) {
           
        };
        this.client.onmessage = function(m) {
            console.log(m);
        };

        this.client.onDownloadStart = function(gid) {
           /* console.log("DOWLOAD HAS STARTED", gid);
            setInterval(function(){
        		client.tellStatus(gid.gid, ["gid","dir", "status", "downloadSpeed", "totalLength", "completedLength", "bitfield"]);
        	},2000)*/
        };


        this.client.onDownloadComplete = function(event){
        	console.log("Complete ", event);
        }
        var testMagnet = "magnet:?xt=urn:btih:E63A9B7329462B4961FADA125E140AFDAE3286E1&dn=the+hunger+games+mockingjay+part+1+2014+hdrip+xvid+evo&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce"; 
        var client = this.client;

        this.client.open(function(){
        	self.connected = true;
        	//client.addUri([testMagnet], {gid:"1234567891123456", dir: '/Users/iorlov/Downloads/HungerGamesPukkaSukka'});
        	
        });
    },
    addMagnet : function(magnet, directory)
    {
    	if ( self.connected ){
 			client.addUri([testMagnet], {dir: directory});   		
    	}
    }


}