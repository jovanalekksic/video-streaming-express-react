const express=require('express');
const fs=require('fs');
const { get } = require('http');
const path=require('path');
const cors=require('cors');

const videos=[
    {
        id:14,
        poster: '/video/0/poster',
        duration: '1 hr 30 min',
        name: ' Limitless'
    },
    {
        id:13,
        poster: '/video/1/poster',
        duration: '1 hr 33 min',
        name: ' Chicago Overcoat'
    }
]

const app=express();



app.use(cors());
app.get('/videos',(req,res)=>res.json(videos));

app.get('/video/:id/data',(req,res)=>{
    const id=parseInt(req.params.id, 10);
    res.json(videos[id]);
});

app.get('/video/:id', (req,res)=>{
    const path=`assets/${req.params.id}.mp4`;
    const stat=fs.statSync(path);
    const fileSize=stat.size;
    const range=req.headers.range;
    if(range){
        const parts=range.replace(/bytes=/,"").split("-");
        const start=parseInt(parts[0],10);
        const end=parts[1]
            ? parseInt(parts[1],10)
            : fileSize-1;
        const chunkSize=(end-start)+1;
        const file=fs.createReadStream(path,{start,end});
        const head={
            'Content-Range':`bytes ${start}-${end}/${fileSize} `,
            'Accept-Ranges':'bytes',
            'Content-Length':chunkSize,
            'Content-Type':'video/mp4',
        };
        res.writeHead(206,head);
        file.pipe(res);
    }else{
        const head={
            'Content-Length':fileSize,
            'Content-Type':'video/mp4',
        };
        res.writeHead(200,head);
        fs.createReadStream(path).pipe(res);
    }
});

app.listen(4000,()=>{
    console.log('Listening on port 4000');
});