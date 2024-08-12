export default class NotionDBProperty {
    // https://developers.notion.com/reference/page-property-values
    constructor() { }

    fromNotion(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.type = notion_property_object.type;
        switch (notion_property_object.type) {
            case 'checkbox':
                this.value = new NotionCheckboxProperty(notion_property_object);
                break;
            case 'date':
                this.value = new NotionDateProperty(notion_property_object);
                break;
            case 'number':
                this.value = new NotionNumberProperty(notion_property_object);
                break;
            case 'title':
                this.value = new NotionTitleProperty(notion_property_object);
                break;
            case 'rich_text':
                this.value = new NotionTextProperty(notion_property_object);
                break;
            default:
                throw new Error(`Unsupported property type [${notion_property_object.type}].`);
        }
        this.id = notion_property_object.id;
    }

    fromValue(value) {
        if (typeof value === 'boolean') {
            this.type = 'checkbox';
            this.value = new NotionCheckboxProperty({ checkbox: value });
        } else if (typeof value === 'number') {
            this.type = 'number';
            this.value = new NotionNumberProperty({ number: value });
        } else if (value instanceof Date) {
            this.type = 'date';
            this.value = new NotionDateProperty({ date: { start: value.toISOString() } });
        } else if (typeof value === 'string') {
            this.type = 'rich_text';
            this.value = new NotionTextProperty({ rich_text: [{ text: { content: value } }] });
        } else if (typeof value === 'object') {
            this.type = 'rich_text';
            this.value = new NotionTextProperty({rich_text: [{ text: { content: JSON.stringify(value) } }]});
        }
        else {
            throw new Error(`Unsupported property value [${value}].`);
        }
    }

    get() {
        return this.value.get();
    }

    set(value) {
        this.value.set(value);
    }

    toNotion() {
        return this.value.persist();
    }

    getSchema() {
        return {
            type: this.type,
            [this.type]: {}
        }
    }
}

class NotionCheckboxProperty {
    constructor(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.value = notion_property_object.checkbox;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
    }

    persist() {
        return {
            type: 'checkbox',
            checkbox: this.value
        }
    }
}

class NotionDateProperty {
    constructor(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.value = new Date(notion_property_object.date.start);
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
    }

    persist() {
        return {
            type: 'date',
            date: {
                start: this.value.toISOString()
            }
        }
    }
}

class NotionNumberProperty {
    constructor(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.value = notion_property_object.number;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
    }

    persist() {
        return {
            type: 'number',
            number: this.value
        }
    }
}

class NotionTitleProperty {
    constructor(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.value = notion_property_object.title[0].text.content;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
    }

    persist() {
        return {
            type: 'title',
            title: [
                {
                    text: {
                        content: this.value
                    }
                }
            ]
        }
    }
}

class NotionTextProperty {
    constructor(notion_property_object) {
        if (!notion_property_object) {
            throw new Error('Invalid Notion Property Object.');
        }
        this.value = notion_property_object.rich_text[0].text.content
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
    }

    persist() {
        return {
            type: 'rich_text',
            rich_text: [
                {
                    text: {
                        content: this.value
                    }
                }
            ]
        }
    }
}