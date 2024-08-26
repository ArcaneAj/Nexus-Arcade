import { DataCenter } from './datacenter.model';
import { NamedObject } from './named-object.model';

export interface World extends NamedObject {
    id: number;
    dataCenter: DataCenter;
}
