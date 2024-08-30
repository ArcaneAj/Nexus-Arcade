import { NamedObject } from './named-object.model';
import { World } from './world.model';

export interface Setting extends NamedObject {
    value: any;
}

export interface StringSetting extends Setting {
    value: string;
}

export interface BoolSetting extends Setting {
    value: boolean;
}

export interface NumberSetting extends Setting {
    value: number;
}

export interface WorldSetting extends Setting {
    value: World;
}
