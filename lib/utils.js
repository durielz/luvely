
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
  const tmpLabel = utils.pad(`${p.label.toUpperCase()}`, 5);
  let out;
  let label;
  let msg;
  if (typeof p.color === 'string') {
    label = chalk[p.color].apply(chalk, [`${tmpLabel}`]);
    msg = chalk[p.color].apply(chalk, [`${formatted.msg}`]);
  } else {
    label = p.color(`${tmpLabel}`);
    msg = p.color(`${formatted.msg}`);
  }

  if (formatted.src && formatted.level > 40) {
    out = `[${formatted.time}] ${label}: ${formatted.name}/${formatted.pid} on ${formatted.hostname} in ${formatted.src.file} @ line ${formatted.src.line}: ${msg}`;
  } else {
    out = `[${formatted.time}] ${label}: ${formatted.name}/${formatted.pid} on ${formatted.hostname}: ${msg}`;
  }

  const keys = Object.keys(formatted);
  for(let i = 0; i < keys.length; i++) {
    if(!FIELDS_TO_IGNORE.includes(keys[i])) {
      if (formatted[keys[i]] instanceof Object) {
        out += ` ${keys[i]}={`;
        const keysInside = Object.keys(formatted[keys[i]]);
        for(let y = 0; y < keysInside.length; y++) {
          let keyInside = formatted[keys[i]][keysInside[y]];
          if(keysInside[y] != 'headers') {
            keyInside = keyInside.toString().replace(/\r?\n|\r/g, ' ').replace(/(: )/g, '=');
            out += ` ${keysInside[y]}=${keyInside}`;
          } else {
            const keysInsideHeaders = Object.keys(formatted[keys[i]][keysInside[y]]);
            for(let k = 0; k < keysInsideHeaders.length; k++) {
              let keyInsideHeaders = formatted[keys[i]][keysInside[y]][keysInsideHeaders[k]];
              keyInsideHeaders = keyInsideHeaders.toString().replace(/\r?\n|\r/g, ' ').replace(/(: )/g, '=');
              out += ` ${keysInsideHeaders[k]}=${keyInsideHeaders}`;
            }
          }
        }
        out += ` }`;
      } else {
        out += ` ${keys[i]}=${formatted[keys[i]]}`;
      }
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
