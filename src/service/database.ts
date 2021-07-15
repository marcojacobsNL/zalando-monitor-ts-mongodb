import { connect } from 'mongoose';
import Logger from '../service/logger';

const log = new Logger();

const connectionURI: string = process.env.mongoURI || 'MONGOIP';
export const connectDatabase = async () => {
  try {
    connect(connectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    log.success(`Database connected`);
  } catch (err) {
    log.error(`Database error: ${err}`);
  }
};
