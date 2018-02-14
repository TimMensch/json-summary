import * as _ from "lodash";

export interface JSONAllSummaryOptions {
    indent: number;
    maxArrayItems: number;
    maxDepth: number;
}

export type JSONSummaryOptions = Partial<JSONAllSummaryOptions>;

const defaultOptions: JSONAllSummaryOptions = {
    indent: 2,
    maxArrayItems: 5,
    maxDepth: 3,
};

export class JSONSummary {
    options: JSONAllSummaryOptions;

    constructor(options: JSONSummaryOptions = defaultOptions) {
        this.options = Object.assign({}, defaultOptions, options);
    }

    private indent(level: number) {
        return " ".repeat(
            this.options.indent * (this.options.maxDepth - level)
        );
    }

    private handleArray(array: Array<any>, level: number): string {
        if (level === 0) {
            return this.indent(level) + `<array of ${array.length} items>`;
        }
        let arraySummary = _(array)
            .take(this.options.maxArrayItems)
            .map(item => this.handleItem(item, level - 1))
            .value()
            .join(",");
        if (array.length > this.options.maxArrayItems) {
            arraySummary +=
                `, <...${array.length - this.options.maxArrayItems} more>`;
        }
        return (
            "[ " +
            arraySummary +
            this.indent(level) +
            "]"
        );
    }

    private handleObject(object: {}, level: number): string {
        let objectSummary = "";
        _.forOwn(object, (value, key) => {
            objectSummary +=
                this.indent(level - 1) +
                key +
                ": " +
                this.handleItem(value, level - 1) + ",";
        });
        return (
            this.indent(level) +
            "{\n" +
            objectSummary +
            this.indent(level) +
            "}\n"
        );
    }

    private handleItem(item: any, level: number) {
        if (_.isArray(item)) {
            return this.handleArray(item, level);
        }
        if (item === null) return this.indent(level) + "null";
        if (item === undefined) return this.indent(level) + "undefined";
        if (_.isObject(item)) {
            return this.handleObject(item, level);
        }
        return JSON.stringify(item);
    }

    summarize(json: any): string {
        return this.handleItem(json, this.options.maxDepth);
    }
}

let globalSummary: JSONSummary | null = null;

export function summarize(json: any) {
    if (!globalSummary) {
        globalSummary = new JSONSummary();
    }
    return globalSummary.summarize(json);
}

console.log(
    summarize({
        array: [1, 2, 3, 4, 5, 6, 7, 8],
        obj: {
            a: 1,
            b: 2,
            c: [2, 3, 4, 5, 6, 7, 8],
        },
    })
);
