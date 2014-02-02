var request = require('request');

var FileManager = require('./src/file-manager');
var Http = require('./src/http');
var Ulozto = require('./src/ulozto');


var program = require('commander');
var clipboard = require('copy-paste');
var file_manager = new FileManager('~/.ulozto');
var http = new Http(request);
var ulozto = new Ulozto(program, file_manager, clipboard, http);

program.command('upload <filename>').action(ulozto.uploadFile.bind(ulozto));
program.command('rm [query]').action(ulozto.initFileRemoval.bind(ulozto));

program.parse(process.argv);
