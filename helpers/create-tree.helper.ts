
function createTree(arr, parent_id : number){
    const tree = [];
    arr.forEach(item => {
        if(item["parent_category_id"] === parent_id)
        {
            const newItem = item;
            const children = createTree(arr, item["category_id"]);
            if(children.length > 0)
            {
                newItem["children"] = children;
            };
            tree.push(newItem);
        };
    });
    return tree;
};

export const createTreeHelper = (arr) => {
    const result = createTree(arr, null);
    return result;
}