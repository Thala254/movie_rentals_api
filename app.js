import express from 'express';
import db from './startup/db.js';
import cors from './startup/cors.js';
import routes from './startup/routes.js';
import getAccessKey from './startup/config.js';
import validation from './startup/validation.js';

import 'express-async-errors';

const app = express();

cors(app);
routes(app);
db();
getAccessKey();
validation();

export default app;
