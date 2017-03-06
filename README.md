# Angular2 Components for WebGL with Threejs
[![Build Status](https://travis-ci.org/Ventrom/Ventrom/ng2-threejs.svg?branch=master)](https://travis-ci.org/Ventrom/Ventrom/ng2-threejs)
[![npm version](https://badge.fury.io/js/ng2-threejs.svg)](http://badge.fury.io/js/ng2-threejs)
[![devDependency Status](https://david-dm.org/Ventrom/Ventrom/ng2-threejs/dev-status.svg)](https://david-dm.org/Ventrom/Ventrom/ng2-threejs#info=devDependencies)
[![GitHub issues](https://img.shields.io/github/issues/Ventrom/Ventrom/ng2-threejs.svg)](https://github.com/Ventrom/Ventrom/ng2-threejs/issues)
[![GitHub stars](https://img.shields.io/github/stars/Ventrom/Ventrom/ng2-threejs.svg)](https://github.com/Ventrom/Ventrom/ng2-threejs/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Ventrom/Ventrom/ng2-threejs/master/LICENSE)

## Demo
https://Ventrom.github.io/Ventrom/ng2-threejs/demo/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#licence)

## About

A collection of Angular2 components to render WebGL scenes with Threejs

## Installation

Install through npm:
```
npm install --save ng2-threejs
```

To use the module, first import it in your app:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ThreejsModule } from 'ng2-threejs';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        ThreejsModule
    ],
    declarations: [],
    bootstrap:    [ AppComponent ]
})
export class AppModule {}
```

## Documentation
All documentation is auto-generated from the source via typedoc and can be viewed here:
https://Ventrom.github.io/Ventrom/ng2-threejs/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install local dev dependencies: `npm install` while current directory is this repo

## License

MIT
