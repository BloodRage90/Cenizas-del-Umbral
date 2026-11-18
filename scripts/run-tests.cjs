const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const dir=path.resolve(__dirname,'../tests');
const files=fs.readdirSync(dir).filter(file=>file.endsWith('.cjs')&&!file.startsWith('static')&&!file.startsWith('regressions')&&!file.includes('e2e')).sort();
let failed=0;
for(const file of files){const result=spawnSync(process.execPath,[path.join(dir,file)],{stdio:'inherit'});if(result.status!==0)failed++;}
if(failed)process.exit(1);
