importScripts('stockfish.js'); // Assuming stockfish.js is in the same directory

self.onmessage = function(event) {
    var message = event.data;
    self.postMessage("Received: " + message);
    if (typeof message === 'string') {
        stockfish.postMessage(message);
    }
};

stockfish.onmessage = function(event) {
    var line = event.data;
    self.postMessage(line);
};
