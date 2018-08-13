/**
 * Created by smartface on 10/18/16.
 */

import { expect } from "chai";
import createPageContext, {pageContextReducer} from '../src/smartface/pageContext';
import Context from "../src/core/Context";
import Actor from "../src/core/Actor";
import MockComponent from "./mock/Component";

// import {findClassNames} from "../src/styler";
// const styler = require("../src/styler").styler;
// const resetStylerCache = require("../src/styler").faresetStylerCache;
// const componentStyler = require("../src/styler").componentStyler;

describe("Page Context", function() {
  let pageContext;
  let page;
  let component1;
  let component2;
  let context;
  
  beforeEach(function() {
    component1 = {};
    component2 = {};
    
    page = {
      children: {
        component1,
        component2
      }
    };
    
    pageContext = createPageContext(page, "page");
  });
  
  it("should merge nested objects", () => {
    let style = {};
  });
  
  if("should add new child components", () => {
    let context = new Context(null, pageContextReducer);
    var rootComp = new MockComponent();
    var actor = Context.createActor(Actor, "root", rootComp);
    context.add(actor);
  });

  it("should push new classnames", function() {
    
    /*let actor  = makeStylable({component: {}, classNames:".test"});
    actor.isDirty = false;
    actor.pushClassNames(".test2");
    expect(actor.getClassName()).to.equal( ".test .test2");
    expect(actor.isDirty).to.equal(true);
    actor.pushClassNames(".test3 .test4");
    expect(actor.getClassName()).to.equal( ".test .test2 .test3 .test4");
    actor.pushClassNames(".flexLayout .flexLayout-default #pgSignupPhone.flMain");
    expect(actor.getClassName()).to.equal( ".test .test2 .test3 .test4 .flexLayout .flexLayout-default #pgSignupPhone.flMain");

    const actor2  = makeStylable({component: {}, classNames:".flexLayout .flexLayout-default #pgSignupPhone.flMain"});
    expect(actor2.getClassName()).to.equal( ".flexLayout .flexLayout-default #pgSignupPhone.flMain");

    const actor3  = makeStylable({component: {}, classNames:""});
    expect(actor3.getClassName()).to.equal("");
    actor3.pushClassNames("#bottomtabbar_profile");
    expect(actor3.getClassName()).to.equal("#bottomtabbar_profile");

    const actor5  = makeStylable({component: {}, classNames:" "});
    expect(actor5.getClassName()).to.equal("");

    const actor4  = makeStylable({component: {}, classNames:"#bottomtabbar_profile"});
    expect(actor4.getClassName()).to.equal("#bottomtabbar_profile");*/
    // const rootComponent = {};
    // const context = pageContext(rootComponent, "root");
  });

});
