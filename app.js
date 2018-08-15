var http = require('http');
var fs = require('fs');


http.createServer(function(req,res){
	var path = req.url;	
	if(path == "/"){
		path = "/index.html";
	}
	sendFile(res,path);
}).listen(4000)
 
function sendFile(res,path){
	var path = process.cwd()+path;
	fs.readFile(path,function(err,stdout,stderr){
		if(!err){
			var data = stdout;
			var type = path.substr(path.lastIndexOf(".")+1,path.length)
			res.writeHead(200,{'Content-type':"text/"+type});
			res.write(data);
		}
		res.end();
	})
}