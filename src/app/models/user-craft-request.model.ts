import { ItemCraftRequest } from './item-craft-request.model';
import { User } from './user.model';

export interface UserCraftRequest {
    user: User;
    itemCrafts: ItemCraftRequest[];
}
