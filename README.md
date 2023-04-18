# Heraklean App
interactive sound-walk app

## Setup

### Create environment

```conda create --name heraklean```

```conda install -c conda-forge nodejs```

#### NPM setup

```npm install audio-stream```

```npm install audio-loader```

## Usage

```node stream-test.js```



# ----- OLD STUFF -----

### Clone the repository

```git clone https://github.com/roberttwomey/radio-writing-tool```

### Create an env file with your openai key

```
touch .env
```

In the file, copy the following text. Replace XXXXXX with your openai api key (copied from your openai account)

```
OPENAI_API_KEY=XXXXXX
```

## Usage

### Run it from the command line with node.js

**setup**:
`npm install http-server -g`
`http-server` 

***Visit in Browser***

open `localhost:8080` in Safari (speechRec isn't working in edge)

### Node app with pm2

```
npm install pm2 -g
npm install -g express
```


### Running with pm2

Start the app:
```
pm2 start writing-tool.js
```

Inspect the log:
```
pm2 log writing-tool.js
```

Stop the writing tool:
```
pm2 stop writing-tool.js
```

## References
- Web audio streaming with node.js https://www.npmjs.com/package/stream-player
- 
- Deploying p5 sketch with node: https://github.com/processing/p5.js/wiki/p5.js,-node.js,-socket.io

- PM2 to deploy a sketch: https://pm2.keymetrics.io/
