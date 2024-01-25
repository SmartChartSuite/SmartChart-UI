import { Injectable } from '@angular/core';
import {catchError, map, of} from "rxjs";
import {Config} from "../../models/config";
import packageInfo from '../../../../package.json';
import {HttpBackend, HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  defaultLocalConfigPath = '../../assets/config/config.json'
  config: Config = new Config();

  packageInfo = packageInfo;

  private http: HttpClient;

  public apiUrl = "";

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  loadConfig() {
    let configPath = this.defaultLocalConfigPath;
    return this.http.get<Config>(configPath).pipe(
      map((config: Config) => {
        console.log(config)
        config.version = "v" + this.packageInfo.version;
        config.rcApiUrl = this.standardizeUrl(config.rcApiUrl);
        this.config = config;
        return true;
      }),
      catchError(error => {
        console.error(error);
        this.config = new Config();
        return of(false);
      })
    )
  }
  standardizeUrl(url: string): string {
    if (!url.endsWith("/")) {
      url = url.concat("/");
    }
    return url;
  }
}
