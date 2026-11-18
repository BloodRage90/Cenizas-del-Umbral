const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent((req.url||'/').split('?')[0]);
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(target).pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'127.0.0.1',()=>console.log('Cenizas test server on '+port));
