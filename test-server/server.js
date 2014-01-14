'use strict';

const path = require('path');
const koa = require('koa');
const statics = require('koa-static');

const app = koa();
app.use(statics(__dirname));
app.use(statics(path.join(__dirname, '..')));
app.listen(Number(process.env.NODE_PORT));
