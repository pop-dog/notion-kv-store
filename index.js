import { Client } from '@notionhq/client';
import NotionDBProperty from './models/db-property.js';

export default class NotionKVStore {
    constructor(secret_key, database_id) {
        this.client = new Client({ auth: secret_key });
        this.database_id = database_id;
        this.pageId = null;
        this.data = null;
    }

    async initialize() {
        const notion_db = await this.client.databases.query({
            database_id: this.database_id,
        });

        if (!notion_db || notion_db.results.length === 0) throw new Error(`No database found with id [${this.database_id}].`);

        const db_props = notion_db.results[0].properties;

        this.pageId = notion_db.results[0].id;

        this.data = {};

        for (const key in db_props) {
            try {
                const prop = new NotionDBProperty();
                prop.fromNotion(db_props[key]);
                this.data[key] = prop;
            } catch {} // Ignore unsupported properties
        }
    }

    async get(key) {
        if (!this.data) await this.initialize();
        if (key in this.data)
            return this.data[key].get();

        return null;
    }

    async set(key, value) {
        if (!this.data) await this.initialize();

        if (!(key in this.data)) {
            // Add new property
            const new_property = new NotionDBProperty();
            new_property.fromValue(value);
            this.data[key] = new_property;

            // Update database schema
            await this.client.databases.update({
                database_id: this.database_id,
                properties: {
                    [key]: new_property.getSchema()
                }
            });
        } else {
            this.data[key].set(value);
        }
        
        await this.client.pages.update({
            page_id: this.pageId,
            properties: {
                [key]: this.data[key].toNotion()
            },
        });

        return value;
    }

    async remove(key) {
        await this.client.databases.update({
            database_id: this.database_id,
            properties: {
                [key]: null
            }
        });
        delete this.data[key];
    }
}