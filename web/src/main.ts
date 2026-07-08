import { bootstrapApplication } from '@angular/platform-browser';

import 'quill/dist/quill.snow.css';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig);
