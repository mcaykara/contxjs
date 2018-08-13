import hooks from '../core/hooks';
import * as StyleContext from '../styling/StyleContext';
import makeStylable from '../styling/Stylable';
import addContextChild from './action/addChild';
import removeContextChild from './action/removeChild';
import removeContextChildren from './action/removeChildren';
import findClassNames from '@smartface/styler/lib/utils/findClassNames';
import raiseErrorMaybe from '../core/util/raiseErrorMaybe';
import Context from "../core/Context";

function addChild(superAddChild, child, name, classNames = "", userProps = null) {
  superAddChild(child);
  name && this.dispatch(addContextChild(name, child, classNames, userProps));
}

function removeChild(superRemoveChild, child) {
  if (child) {
    superRemoveChild && superRemoveChild(child);
    child.dispatch && child.dispatch(removeContextChild());
  }
  else {
    this.getParent && this.getParent() && this.getParent().removeChild(this);
    this.dispatch && this.dispatch(removeContextChild());
  }
}

function removeChildren(superRemoveAll) {
  superRemoveAll();
  this.dispatch && this.dispatch(removeContextChildren());
}


function createOriginals(component) {
  !component.__original_addChild && (component.__original_addChild = component.addChild);
  !component.__original_removeChild && (component.__original_removeChild = component.removeChild);
  !component.__original_removeAll && (component.__original_removeAll = component.removeAll);
}

function patchComponent(component, rootInstance, name) {
  try {
    if (component.layout && component.layout.addChild) {
      createOriginals(component.layout);
      Object.defineProperties(component.layout, {
        addChild: {
          enumerable: true,
          configurable: true,
          value: addChild.bind(component, component.layout.__original_addChild.bind(component.layout))
        },
        removeChild: {
          enumerable: true,
          configurable: true,
          value: removeChild.bind(component, component.layout.__original_removeChild.bind(component.layout))
        },
        removeAll: {
          enumerable: true,
          configurable: true,
          value: removeChildren.bind(component, component.layout.__original_removeAll.bind(component.layout))
        }
      });
    }
    else if (component.addChild) {
      createOriginals(component);
      Object.defineProperties(component, {
        addChild: {
          enumerable: true,
          configurable: true,
          value: addChild.bind(component, component.__original_addChild.bind(component))
        },
        removeChild: {
          enumerable: true,
          configurable: true,
          value: removeChild.bind(component, component.__original_removeChild.bind(component))
        },
        removeAll: {
          enumerable: true,
          configurable: true,
          value: removeChildren.bind(component, component.__original_removeAll.bind(component))
        }
      });
    }
    else {
      !component.removeChild && (component.removeChild = removeChild.bind(component));
    }
  }
  catch (e) {
    e.message = `An Error is occurred when component [${name}] is patched in the [${rootInstance}]. ${e.message}`;
    raiseErrorMaybe(e, component.onError);
  }
}

function createTreeItem(component, name, rootInstance, root) {
  let componentVars;
  var classNames = component.__tree_item === true ? component.classNames : "";

  if (name == rootInstance + "_statusBar") {
    componentVars = root.constructor && root.constructor.$$styleContext.statusBar || {};
  }
  else if (name == rootInstance + "_headerBar") {
    componentVars = root.constructor && root.constructor.$$styleContext.headerBar || {};
  }
  else {
    componentVars = component.constructor && component.constructor.$$styleContext || {};
  }

  patchComponent(component, rootInstance, name);

  classNames = componentVars.classNames ?
    componentVars.classNames + " " + classNames + " #" + name :
    classNames + " #" + name;

  return {
    component,
    classNames,
    userStyle: componentVars.userProps,
    name,
    __tree_item: true
  };
  // }
}

function buildContextTree(component, name, root, rootInstance, acc) {

  if (acc[name] === undefined) {
    delete acc['@@isEmpty'];

    acc[name] = createTreeItem(component, name, rootInstance, root);
  }

  component.children &&
    Object.keys(component.children).forEach((child) => {
      const comp = component.children[child];
      try {
        if (comp.component !== undefined && comp.classNames !== undefined) {
          buildContextTree(comp.component, createName(name, child), root, rootInstance, acc);
        }
        else {
          buildContextTree(comp, createName(name, child), root, rootInstance, acc);
        }
      }
      catch (e) {
        e.message = "Error when component would be collected: " + child + ". " + e.message;
        raiseErrorMaybe(e, component.onError);
      }
    });
}

function createName(root, name) {
  return root + "_" + name;
}

/**
 * Extract components tree from a SF Component
 * 
 * @param {Object} component - A sf-core component
 * @param {string} name - component name
 * @param {function} initialClassNameMap - classNames mapping with specified component and children
 * @param {?function} hookList - callback function to capture context's hooks
 * @param {?Object} acc [={}] - Initial Accumulator value
 * 
 * @return {function} - context helper
 */
export function extractTreeFromSFComponent(root, rootInstance, initialClassNameMap, acc = { '@@isEmpty': true }) {
  buildContextTree(root, rootInstance, root, rootInstance, acc);

  return acc;
}

export default function fromSFComponent(root, rootInstance, hooksList = null, collection = {}) {
  const ctree = extractTreeFromSFComponent(root, rootInstance, null);

  Object.keys(ctree).forEach((name) => {
    const item = ctree[name];

    ctree[name] = collection[name] || makeStylable(item);
  });

  return StyleContext.createStyleContext(
    ctree,
    hooks(hooksList),
    function updateContextTree(contextElements = {}) {
      return fromSFComponent(root, rootInstance, hooksList, contextElements);
    }
  );
}

export function createActorTreeFromSFComponent(component, name, rootInstance) {

  if (component.addChild || component.layout) {
    const ctree = extractTreeFromSFComponent(component, rootInstance, null);

    Object.keys(ctree).forEach((name) => {
      const item = ctree[name];

      ctree[name] = makeStylable(item);
    });

    return ctree;
  }
  else {
    return {
      [createName(rootInstance, name)]: makeStylable(createTreeItem(component, name, rootInstance, component))
    };
  }
}
