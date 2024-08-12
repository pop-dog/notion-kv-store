import NotionDBProperty from '../models/db-property.js';
import NotionKVStore from '../index.js';
import { assert } from 'chai';

describe('Notion Page Properties', () => {
    it('should be able to create a checkbox property', () => {
        const checkbox_test = {
            "id": "ZI%40W",
            "type": "checkbox",
            "checkbox": true
        };
        const pageProperty = new NotionDBProperty();
        pageProperty.fromNotion(checkbox_test);
        assert.isNotNull(pageProperty);
        assert.isTrue(pageProperty.get());
        pageProperty.set(false);
        assert.isFalse(pageProperty.get());
    });
    it('should be able to create a number property', () => {
        const number_test = {
            "id": "ZI%40W",
            "type": "number",
            "number": 42
        };
        const pageProperty = new NotionDBProperty();
        pageProperty.fromNotion(number_test);
        assert.isNotNull(pageProperty);
        assert.equal(pageProperty.get(), 42);
        pageProperty.set(43);
        assert.equal(pageProperty.get(), 43);
    });
    it('should be able to create a title property', () => {
        const title_test = {
            "id": "title",
            "type": "title",
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Test Title",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Test Title",
                    "href": null
                }
            ]
        };
        const pageProperty = new NotionDBProperty();
        pageProperty.fromNotion(title_test);
        assert.isNotNull(pageProperty);
        assert.equal(pageProperty.get(), 'Test Title');
        pageProperty.set('New Title');
        assert.equal(pageProperty.get(), 'New Title');
    });
    it('should be able to create a text property', () => {
        const text_test = {
            "id": "text",
            "type": "rich_text",
            "rich_text": [
                {
                    "text": {
                        "content": "Test Text",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Test Text",
                    "href": null
                }
            ]
        };
        const pageProperty = new NotionDBProperty();
        pageProperty.fromNotion(text_test);
        assert.isNotNull(pageProperty);
        assert.equal(pageProperty.get(), 'Test Text');
        pageProperty.set('New Text');
        assert.equal(pageProperty.get(), 'New Text');
    });
    it('should be able to create a date property', () => {
        const date_test = {
            "id": "date",
            "type": "date",
            "date": {
                "start": "2021-09-01T00:00:00.000Z"
            }
        };

        const pageProperty = new NotionDBProperty();
        pageProperty.fromNotion(date_test);
        assert.isNotNull(pageProperty);
        assert.equal(pageProperty.get().toUTCString(), new Date('2021-09-01T00:00:00.000Z').toUTCString());
        pageProperty.set(new Date('2021-09-02T00:00:00.000Z'));
        assert.equal(pageProperty.get().toUTCString(), new Date('2021-09-02T00:00:00.000Z').toUTCString());
    });
});

describe('Notion Client Interactions', () => {
    it('should be able to create a new Notion KV Store', async () => {
        const store = new NotionKVStore(process.env.NOTION_API_KEY, process.env.NOTION_DATABASE_ID);
        assert.isNotNull(store);
        let session_no = await store.get('Session No.');
        let session_no_plus_1 = await store.set('Session No.', session_no + 1);
        assert.equal(session_no + 1, session_no_plus_1);
        session_no = await store.set('Session No.', session_no);
    }).timeout(5000);

    it ('should be able to add a new property to the database', async () => {
        const store = new NotionKVStore(process.env.NOTION_API_KEY, process.env.NOTION_DATABASE_ID);
        assert.isNotNull(store);
        let new_property = await store.set('New Property', 'New Value');
        assert.equal(new_property, 'New Value');
        new_property = await store.get('New Property');
        assert.equal(new_property, 'New Value');
        await store.remove('New Property');
        new_property = await store.get('New Property');
        assert.isNull(new_property);
    }).timeout(5000);
});