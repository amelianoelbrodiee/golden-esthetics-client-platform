import test from"node:test";import assert from"node:assert/strict";import{evaluateScreening,screeningConfig}from"../app/data/screening.ts";
test("flagged answer routes client to McKinnley",()=>assert.equal(evaluateScreening({retinoids:true}).shouldContact,true));
test("unflagged screening does not invent a restriction",()=>assert.equal(evaluateScreening({}).shouldContact,false));
test("screening rules are visibly unapproved",()=>assert.match(screeningConfig.status,/REQUIRES MCKINNLEY APPROVAL/));
