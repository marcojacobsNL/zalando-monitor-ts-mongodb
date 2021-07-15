import chalk from 'chalk';
const log = console.log;

interface Logger {
  _startTime: Date;
}

class Logger {
  constructor(id = null) {
    // init private var
    this._startTime = new Date(Date.now());
  }

  success(message: String) {
    log(
      chalk.white(
        `[${this._startTime.toUTCString()}]` + chalk.green(`[OK]`) + chalk.white(`${message}`)
      )
    );
  }

  error(message: String) {
    log(
      chalk.white(
        `[${this._startTime.toUTCString()}]` + chalk.red(`[ERROR]`) + chalk.white(`${message}`)
      )
    );
  }

  info(message: String) {
    log(
      chalk.white(
        `[${this._startTime.toUTCString()}]` + chalk.yellow(`[INFO]`) + chalk.white(`${message}`)
      )
    );
  }
}

export default Logger;
