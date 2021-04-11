// Make nicely formatted messages, errors etc. for console logging
import {
	green, blue, red, yellow, bold, magenta,
} from 'chalk';

const PREFIX = 'induct ';

export const successMsg = bold(PREFIX + green('SUC6     '));
export const infoMsg = bold(PREFIX + blue('INFO     '));
export const warnMsg = bold(PREFIX + yellow('WARN     '));
export const errMsg = bold(PREFIX + red('ERR!     '));
export const debugMsg = bold(PREFIX + magenta('DBUG     '));

export const success = (msg: string): void => console.log(successMsg + msg);

export const info = (msg: string): void => console.log(infoMsg + msg);

export const warning = (msg: string): void => console.log(warnMsg + msg);

export const error = (msg: string): void => console.log(errMsg + msg);

export const debug = (msg: string): void => console.log(debugMsg + msg);
