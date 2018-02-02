/**
 * Created by smartface on 10/18/16.
 */

import { expect } from "chai";
import makeStylable from '../src/styling/Stylable';

// import {findClassNames} from "../src/styler";
// const styler = require("../src/styler").styler;
// const resetStylerCache = require("../src/styler").resetStylerCache;
// const componentStyler = require("../src/styler").componentStyler;

describe("Stylable Actor", function() {
 
  beforeEach(function() {});

  it("should push new classnames", function() {
    const actor  = makeStylable({component: {}, classNames:".test"});
    actor.pushClassNames(".test2");
    expect(actor.getClassName()).to.equal( ".test .test2");
    actor.pushClassNames(".test3 .test4");
    expect(actor.getClassName()).to.equal( ".test .test2 .test3 .test4");
  });

  it("should remove classnames", function() {
    const actor  = makeStylable({component: {}, classNames:".test"});
    actor.pushClassNames(".test2 .test4");
    let classNames = actor.removeClassNames(".test4");
    expect(classNames).to.equal( ".test .test2");
  });

  it("should has unique classnames", function() {
    
  });
});