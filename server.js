const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

// __dirname --> root of the server
app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/video', (req, resp) => {
    const path = 'assets/video.mp4' // video path
    const videoStat = fs.statSync(path) // information about the video
    const videoSize = videoStat.size // size of the video in bytes
    const range = req.headers.range

    // if we have a range --> so this is not the first time to call the video api
    if (range) {

        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : videoSize - 1

        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }

        resp.writeHead(206, head)
        file.pipe(resp)
    } else {
        // this is the first request for the video
        // configuration for headers:
        const head = {
            "Content-Length": videoSize,
            "Content-Type": "video/mp4"
        }
        resp.writeHead(200, head)
        fs.createReadStream(path).pipe(resp)
    }


})


app.listen(8085)