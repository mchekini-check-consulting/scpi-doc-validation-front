import { TranslateService } from '@ngx-translate/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).then(appRef => {
  const translate = appRef.injector.get(TranslateService);
  translate.setDefaultLang('fr');
  translate.use('fr');
});
