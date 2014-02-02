**uloz.to upload manager**

This is a command line app for uploading files to the [uloz.to](http://uloz.to) file sharing service and eventually removing them.

## Installation

```bash
$ npm install -g ulozto
```

## Usage

```bash
$ ulozto upload <filename>
$ ulozto rm
$ ulozto rm <search-query>
```

> Note: The app keeps a JSON database of the uploaded files at `~/.ulozto`.
