import test from "node:test";
import assert from "node:assert/strict";
import { validateImageUpload } from "../app/lib/ai/image-validation.ts";
test("accepts a real JPEG signature",()=>{const bytes=new Uint8Array([0xff,0xd8,0xff,0xdb]);const file=new File([bytes],"face.jpg",{type:"image/jpeg"});assert.equal(validateImageUpload(file,bytes),null)});
test("rejects a disguised executable",()=>{const bytes=new Uint8Array([0x4d,0x5a,0x90,0]);const file=new File([bytes],"face.jpg",{type:"image/jpeg"});assert.match(validateImageUpload(file,bytes)!,/valid image/)});
test("rejects unsupported formats",()=>{const bytes=new Uint8Array([1,2,3]);const file=new File([bytes],"face.gif",{type:"image/gif"});assert.match(validateImageUpload(file,bytes)!,/JPG/)});
