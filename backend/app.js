var express = require('express');
var bodyParser = require('body-parser');

var domain = require('conmio-domain');
var Restful = domain.rest.Path;
var path = require("path");
var app = express();
var cookieParser = require('cookie-parser');

var models = require('./models');
app.use(cookieParser('your secret here'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended : true
}));
// Frontend data
app.use('/', express.static(path.join(__dirname, '../frontend')));

// Setting the adapter
domain.setAdapter(domain.adapters.File);




// Restul configuration ****
// -----------------------------------------------
Restful('/api/movies/:id?', models.Movie );
Restful('/api/tags/:id?', models.Tag );



Restful('/api/session', { handler : domain.auth.handlers.SessionHandler });
Restful('/api/users', { model: domain.auth.models.DomainUser, permissions : { users : [] } } );
Restful('/api/groups', { model : domain.auth.models.DomainGroup,  permissions : { groups : [] } } );




// -------------------------------------------------
app.use(domain.rest.Service);
var port = 3000;
app.listen(port);

console.log('listening on port:' + port);
