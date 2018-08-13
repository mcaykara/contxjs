import { INIT_CONTEXT_ACTION_TYPE } from "./constants";
import raiseErrorMaybe from "./util/raiseErrorMaybe";

export function createActorCollection(actors=null) {
  const _actors = actors 
    || {
      collection: [],
      $$idMap: {},
      $$nameMap: {}
    }
  
  class ActorCollection {
    constructor(){
    }
    
    clone(){
      return createActorCollection({
        collection: _actors.collection.slice(),
        $$idMap: Object.assign({}, _actors.$$idMap),
        $$nameMap: Object.assign({}, _actors.$$nameMap)
      });
    }
    
    map(fn) {
      return _actors.collection.map(fn);
    }

    find(instance) {
      return _actors.collection[this._actors.$$idMap[instance]];
    }
    
    add(actor) {
      _actors.$$idMap[actor.getInstanceID()] = this._actors.collection.length;
      _actors.$$nameMap[actor.getName()] = this._actors.collection.length;
      _actors.collection.push(actor);
    }
    
    removeChildren(instance) {
      this._actors.collection.forEach(nm => {
        if (nm.getName().indexOf(instance + "_") === 0) {
          this.remmove(instance);
        }
      });
    }

    remove(instance) {
      // this.removeChildren(instance);
      const index = this._actors.$$idMap[instance];

      if (index >= 0) {
        const actor = this._actors.collection[index];
        delete this._actors.$$nameMap[actor.getName()];
        delete this._actors.$$idMap[actor.getInstanceID()];
        this._actors.collection.splice(index, 1);
        actor.componentDidLeave();
        actor.dispose();
        delete this.actors.collection[nm];
      }
    }
  }
  
  return new ActorCollection;
}

/**
 * Context Container Impl
 * 
 * @class
 *
 */
export default class Context {
  
  /**
   * @constructor
   * @param {{collection: Array<Actor>, $$map: Array<String>, $$idMap: object, $$nameMap: object}} actors
   * @param {function} reducers
   * @param {object} initialState
   * @param {function} hookFactory
   */
  constructor(actors, reducer, initialState = {}, hookFactory = null) {
    this._hookFactory = hookFactory || (() => null);
    this._actors = actors || { collection: [], $$map: [], $$idMap: {}, $$nameMap: {} };
    this._state = Object.assign({}, initialState);
    this._reducer = reducer;

    actors && this.setActors(Object.assign({}, actors));
    this.dispatch({ type: INIT_CONTEXT_ACTION_TYPE });
  }
  
  getReducer() {
    return this._reducer;
  }

  setActors(actors) {
    Object.keys(actors)
      .forEach((name) => {
        this.add(actors[name], name);
      });

    this.propagateAll();
  }

  // this.reduce = (fn, acc = {}) => {
  //   return this._actors.collection.reduce((acc, name, index) => {
  //     return fn(acc, this._actors.collection[name], name, index);
  //   }, acc);
  // };

  map(fn) {
    return this._actors.collection.map(fn);
  }

  find(instance, notValue) {
    return this._actors.find(instance) || notValue;
  }

  addTree(tree) {
    Object.keys(tree).forEach((name) => this.add(tree[name], name));
  }

  add(actor, name) {
    !actor.getID() && actor.setID(Context.getID());
    const instance = actor.getInstanceID();
    
    this._actors.add(actor);

    actor.hook = this._hookFactory;
    actor.componentDidEnter((action, target) => this.dispatch(action, target));

    return instance;
  }

  removeChildren(name) {
    this._actors.collection.forEach(nm => {
      if (nm.getName().indexOf(name + "_") === 0) {
        this.remove(name);
      }
    });
    // this._actors.collection = Object.keys(this._actors.collection);
  }

  remove(instance) {
    this.removeChildren(instance);

    const index = this._actors.$$idMap[instance];

    if (index >= 0) {
      const actor = this._actors.collection[index];
      delete this._actors.$$nameMap[actor.getName()];
      delete this._actors.$$idMap[actor.getInstanceID()];
      this._actors.collection.splice(index, 1);
      actor.componentDidLeave();
      actor.dispose();
    }
  }

  setState(state) {
    if (state !== this._state) {
      this._state = state;
      // this.propagateAll(state, oldState);
    }
  }

  propagateAll() {
    this._actors.collection.map((actor) => {
      actor.onContextChange && actor.onContextChange(this);
    });
  }

  getState() {
    return Object.assign({}, this._state);
  }

  dispatch(action, target) {
    try {
      const reducer = this.getReducer();
      const state = reducer(this, action, target, this._state || {});
      this.setState(state);
    }
    catch (e) {
      e.message = `An Error is occurred When action [${action.type}] run on target [${target}]. ${e.message}`;
      raiseErrorMaybe(e, target && !!this._actors.collection[target] && this._actors.collection[target].onError);
    }
  }

  dispose() {
    this._state = null;
    this._actors = null;
  }

  subcribe(fn) {}

  static getID = (function() {
    var ID = 1;
    return () => ++ID;
  })();
  
  static createActor(ActorClass, name, component){
    return new ActorClass(component, name, Context.getID());
  }

  subcribe(fn) {}

};
