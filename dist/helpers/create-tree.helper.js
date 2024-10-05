"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreeHelper = void 0;
function createTree(arr, parent_id) {
    const tree = [];
    arr.forEach(item => {
        if (item["parent_category_id"] === parent_id) {
            const newItem = item;
            const children = createTree(arr, item["category_id"]);
            if (children.length > 0) {
                newItem["children"] = children;
            }
            ;
            tree.push(newItem);
        }
        ;
    });
    return tree;
}
;
const createTreeHelper = (arr) => {
    const result = createTree(arr, null);
    return result;
};
exports.createTreeHelper = createTreeHelper;
