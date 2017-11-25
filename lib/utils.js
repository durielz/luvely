
'use strict';

const presentation = require('./presentation');
const utils = require('./utils');
const chalk = require('chalk');

const FIELDS_TO_IGNORE = ['src', 'msg', 'name', 'hostname', 'pid', 'level', 'time', 'v', 'err'];

exports.pad = (str, minLen) => {
  if (str.length >= minLen) {
    return str;
  }
  const diff = minLen - str.length;
  const char = ' ';
  return `${char.repeat(diff)}${str}`;
};

exports.format = (formatted) => {
  const p = presentation.fromLevel(formatted.level);
  const tmpLabel = utils.pad(`[${p.label.toUpperCase()}]`, 7);
  let out;
  let label;
  if (typeof p.color === 'string') {
    label = chalk[p.color].apply(chalk, [`${tmpLabel}`]);
  } else {
    label = p.color(`${tmpLabel}`);
  }

  if (formatted.src && formatted.level > 40) {
    out = `[${formatted.time}] ${label}: ${formatted.name}/${formatted.pid} on ${formatted.hostname} in ${formatted.src.file} @ line ${formatted.src.line}: ${formatted.msg}`;
  } else {
    out = `[${formatted.time}] ${label}: ${formatted.name}/${formatted.pid} on ${formatted.hostname}: ${formatted.msg}`;
  }

  const keys = Object.keys(formatted);
  for(let i = 0; i < keys.length; i++) {
    if(!FIELDS_TO_IGNORE.includes(keys[i])) {
      out += ` (${keys[i]}=${formatted[keys[i]]})`;
    }
  }
  out += '\n';

  if (formatted.err) {
    let errAppend;
    if (formatted.err.stack) {
      errAppend = `${formatted.err.stack}\n`;
    } else if (formatted.err.message) {
      errAppend = `${formatted.err.message}\n`;
    } else {
      errAppend = `\n   ${formatted.err}\n`;
    }
    out += chalk.red(errAppend);
  }
  return out;
};
