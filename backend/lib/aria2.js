var cp = require('child_process');

var extractProgress = function(str) {
    var matches = str.match(/([0-9.]+)*(MiB|GiB)\/([0-9.]+)*(MiB|GiB)/)

    if (matches) {
    	var done = parseFloat(matches[1]);
    	if ( matches[2] === "GiB"){
    		done * 1024;
    	}

    	var total = parseFloat(matches[3]);
    	console.log(matches[4],total * 1024);
    	if ( matches[4] === "GiB"){
    		total = total * 1024;
    	}


    	return {
    		info : matches[0],
    		done : done, 
    		total : total
    	}
    }
    return null;
}

var Aria = {
    download: function(opts) {
        if (!opts.link) {
            console.error("link should be provided");
            return;
        }

        if (!opts.destination) {
            console.error("destination should be provided");
            return;
        }

        // Prepare initial arguments
        var magnetLink = opts.link;
        var destination = opts.destination;
        var argv = ['--dir', destination, magnetLink]

        // Spawn mother fucker
        var pr = cp.spawn('aria2c', argv);


        pr.stderr.on('data', function(data) {
            if (this.onError)
                this.onError(data);

        }.bind(opts));

        pr.stdout.on('data', function(data) {
        	console.log("--->: " + data.toString() + "|")
            if (this.onProgress) {
            	var m = extractProgress(data.toString());
            	if ( m ){
            		this.onProgress(m);
            	}
            }
        }.bind(opts));
    }
}

module.exports = Aria;