import test from"node:test";import assert from"node:assert/strict";import{buildAppointment,calculateStudentPrice}from"../app/lib/appointment-builder.ts";
test("calculates fifteen percent student discount",()=>assert.equal(calculateStudentPrice(120),102));
test("builds facial and brow combination",()=>{const r=buildAppointment({interests:["facial","brows"],goals:["dryness"],budget:"100-150",student:false});assert.deepEqual(r.services.map(x=>x.id),["hydrating-facial","brow-wax"]);assert.equal(r.subtotal,120)});
test("respects low budget",()=>{const r=buildAppointment({interests:["facial"],goals:["dryness"],budget:"50-75",student:false});assert.ok(r.subtotal<=75)});
test("student total is included only when selected",()=>{const r=buildAppointment({interests:["brows"],goals:[],budget:"none",student:true});assert.equal(r.studentTotal,17)});
