var require = patchRequire(require);
var Scraper = require('./scrape_generic.js');
var objUtils = require('./obj_utils.js');
var Q = require('./node_modules/q/q');
var samplingInfo = require('./sampling.js');

var cliArgs = (function() {
    var casper = require("casper").create();
    return casper.cli.args;
})();

var credentials = (function() {
    if (cliArgs.length) {
        return require('./user')[cliArgs[0]];
    } else {
        return require('./user')['default'];
    }
})();

var login = credentials.username;
var pass = credentials.password;

var values = (function() {

    var qualityRate = samplingInfo(1, 85, 1, 'quality');
    var volumeRate = samplingInfo(0,0, 1000, 'volume');

    var qmin = qualityRate.min;
    var qmax = qualityRate.max
    var qinc = qualityRate.inc;
    var vmin = volumeRate.min;
    var vmax = volumeRate.max;
    var vinc =volumeRate.inc;
    var samples = [];

    // for(var j=348000;j<=400000;j+=1000){
    //     var sample = {
    //         quality:25, volume:j
    //     };
    //     samples.push(sample);
    // }

    for(var i=qmin;i<=qmax;i+=qinc){
        for(var j=vmin;j<=vmax;j+=vinc){
            var sample = {
                quality:i,
                volume:j
            };
            samples.push(sample);
        }
    }
    return samples;
})();

var defHeaders = ['volume', 'quality','unit_price'];
var date = new Date();
var ts = date.getDate() + '-' + date.getHours() + date.getMinutes();
var config = objUtils.copy(credentials, {
    players: 3,
    rounds: 5,
    csv: {
        headers: defHeaders,
        path: 'data/uprice'+ts+'.csv',
        delim: '\t'
    }
});

var scraper = Scraper(config);
scraper.sampleUnitPrice(values);
