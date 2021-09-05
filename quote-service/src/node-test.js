class Node {
  val;
  children;

  constructor(data) {
    this.val = data.val || null;
    if (data.children) {
      this.children = [];
      this.addChildren(data.children);
    } else if (this.children) {
      delete this.children;
    }
  }
  addChildren(children) {
    if (children) {
      for (let child of children) {
        let newNode = new Node(child);
        this.children.push(newNode);
      }
    }
  }
  filter() {
    return this.children.filter(() => true);
  }
}

function repeater(node, targetVal) {
  let parentFlag = false;
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (repeater(node.children[i], targetVal)) {
        node.children.unshift(...node.children.splice(i, 1));
        parentFlag = true;
      }
    }
  }
  return node.val === targetVal || parentFlag;
}

const filter = (data) => {
  console.log("data: ", data);
  return data.filter(() => true);
};

const removeEmpty = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
};

const prioritizeNodes = (tree, targetVal) => {
  if (!tree.children) {
    return tree;
  }
  let newTree = new Node(tree);
  for (let i = 0; i < tree.children.length; i++) {
    repeater(newTree, targetVal);
  }
  // newTree = filter(newTree);
  return removeEmpty(newTree);
};
const tree = {
  val: 1,
  children: [
    { val: 2 },
    {
      val: 3,
      children: [
        {
          val: 4,
          children: [{ val: 5 }, { val: 6 }, { val: 7 }],
        },
      ],
    },
  ],
};

const newTree = prioritizeNodes(tree, 7);
console.log(JSON.stringify(newTree));
