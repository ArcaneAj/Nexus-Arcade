import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


declare global {
    interface Array<T> {
        toDict(keyGen: (n: T) => number): { [id: number] : T; };
        unique(): T[];
        getMinByProperty<T>(getter: (x: T) => number): T | undefined
    }
}
if (!Array.prototype.toDict) {
    Array.prototype.toDict = function<T>(this: T[], keyGen: (n: T) => number): { [id: number] : T; } {
        return Object.fromEntries(this.map(item => [keyGen(item), item]))
    }
}
if (!Array.prototype.unique) {
    Array.prototype.unique = function<T>(this: T[]): T[] {
        return this.filter((value, index, array) => array.indexOf(value) === index);
    }
}
if (!Array.prototype.getMinByProperty) {
    Array.prototype.getMinByProperty = function<T>(this: T[], getter: (x: T) => number): T | undefined {
        if (this === null || this.length === 0) {
            return undefined;
        }

        return this.sort((a,b) => (getter(a) > getter(b)) ? 1 : ((getter(b) > getter(a)) ? -1 : 0))[0]
    }
}

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
