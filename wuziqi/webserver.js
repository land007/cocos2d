var http = require("http"), url = require("url"), path = require("path"), normalize = path.normalize, join = path.join, sep = path.sep, fs = require("fs");

// var www = 'public';
var root = __dirname;// + sep + www;

http.createServer(function(req, res) {
//  var pathname = __dirname + url.parse(req.url).pathname;
	var pathname = url.parse(req.url).pathname;
	pathname = normalize(join(root, pathname));
    root = normalize(root + sep);
    // malicious path
    if ((pathname + sep).substr(0, root.length) !== root) {
    	console.error('malicious path "' + pathname + '"');
    	res.writeHead(403);
    	res.end('malicious path "' + pathname + '"\n');
    	return;
    }
	if (path.extname(pathname) == "") {
		pathname += "index.html";
	}
//	path.exists(pathname, function(exists) {
//		if (exists) {
	fs.stat(pathname, function(stat_error, stat) {
		if (!stat_error && stat.isFile()) {
			switch (path.extname(pathname)) {
			case ".html":
				res.writeHead(200, {
					"Content-Type" : "text/html",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			case ".js":
				res.writeHead(200, {
					"Content-Type" : "text/javascript",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			case ".css":
				res.writeHead(200, {
					"Content-Type" : "text/css",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			case ".gif":
				res.writeHead(200, {
					"Content-Type" : "image/gif",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			case ".jpg":
				res.writeHead(200, {
					"Content-Type" : "image/jpeg",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			case ".png":
				res.writeHead(200, {
					"Content-Type" : "image/png",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
				break;
			default:
				res.writeHead(200, {
					"Content-Type" : "application/octet-stream",
					"Cache-Control" : "no-store, no-cache, must-revalidate",
					"Pragma" : "no-cache"
				});
			}
			fs.readFile(pathname, function(err, data) {
				res.end(data);
			});
		} else {
			res.writeHead(404, {
				"Content-Type" : "text/html",
				"Cache-Control" : "no-store, no-cache, must-revalidate",
				"Pragma" : "no-cache"
			});
			res.end("<h1>404 Not Found</h1>");
		}
	});

}).listen(30117, "0.0.0.0");

console.log("Server running at http://127.0.0.1:30117/");