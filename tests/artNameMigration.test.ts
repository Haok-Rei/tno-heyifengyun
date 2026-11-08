import test from 'node:test';
import assert from 'node:assert/strict';
import { getArtUnlocks, ART_UNLOCK_KEY } from '../src/engine/artGallery';
test('canonical art names preserve historical collection dates',()=>{
 const old='\u5c01\u5b89\u4fdd时代';
 const storage={getItem:(key:string)=>key===ART_UNLOCK_KEY?JSON.stringify({[old]:123,'封安宝时代':456}):null,setItem:()=>{}};
 const unlocks=getArtUnlocks(storage);
 assert.equal(unlocks['封安宝时代'],123);
 assert.equal(unlocks[old],undefined);
});
