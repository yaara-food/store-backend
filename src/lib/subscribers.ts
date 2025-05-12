import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from "typeorm";
import { Product } from "../lib/entities";

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
    listenTo() {
        return Product;
    }

    async beforeInsert(event: InsertEvent<Product>) {
        if (!event.entity.images || event.entity.images.length === 0) {
            throw new Error("no image");
        }
    }

    async beforeUpdate(event: UpdateEvent<Product>) {
        if (event.entity && (!event.entity.images || event.entity.images.length === 0)) {
            throw new Error("no image");
        }
    }
}