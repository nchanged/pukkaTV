$(function() {
    var bytesToSize = function(bytes) {
        if (bytes == 0) return '0 Byte';
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }


    var updater = function() {
        $.get("/api/dls", function(res) {
            for (var i in res) {
                var item = res[i];
                var div = $("#movieprogress-" + item.id)
                var total = item.total
                var completed = item.completed;
                var progess = (completed / total) * 100;
                div.css('width', progess + "%");
                div.find(".complete-text").html(Math.round(progess) + " % Complete");
                var stat = $("#dlstat-" + item.id);
                stat.find(".completed").html(bytesToSize(item.completed))
                stat.find(".total-bytes").html(bytesToSize(item.total))
            }
        })
    }

    setInterval(function() {
        updater();
    }, 2000);
    updater();


    new MediaElement('player1', {
    // shows debug errors on screen
    enablePluginDebug: false,
    // remove or reorder to change plugin priority
    plugins: ['flash','silverlight'],
    // specify to force MediaElement to use a particular video or audio type
    type: '',
    // path to Flash and Silverlight plugins
    pluginPath: '/script/player/build/',
    // name of flash file
    flashName: '/script/player/build/flashmediaelement.swf',
    // name of silverlight file
    silverlightName: 'silverlightmediaelement.xap',
    // default if the <video width> is not specified
    defaultVideoWidth: 480,
    // default if the <video height> is not specified     
    defaultVideoHeight: 270,
    // overrides <video width>
    pluginWidth: -1,
    // overrides <video height>       
    pluginHeight: -1,
    // rate in milliseconds for Flash and Silverlight to fire the timeupdate event
    // larger number is less accurate, but less strain on plugin->JavaScript bridge
    timerRate: 250,
    // method that fires when the Flash or Silverlight object is ready
    success: function (mediaElement, domObject) { 
         
        // add event listener
        mediaElement.addEventListener('timeupdate', function(e) {
             
            document.getElementById('current-time').innerHTML = mediaElement.currentTime;
             
        }, false);
         
        // call the play method
        mediaElement.play();
         
    },
    // fires when a problem is detected
    error: function () { 
     
    }
});

})