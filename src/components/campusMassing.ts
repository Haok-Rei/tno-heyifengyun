import {at,inset,geometry,facadeDepth,type Face} from './campusPrimitives';
import type {CampusStructureProfile} from './CampusStructures';

/** A tall corner block joins both streets; a low annex begins AFTER its return. */
export function campusMassing(profile:CampusStructureProfile){
  const {body,landmark}=profile;
  const full=geometry(720,435,body.height,body.leftReach,body.rightReach);
  const stepped=['reading-arcade','public-forum','performance-stage'].includes(landmark)&&body.floors>2;
  const split=stepped?Math.min(.42,Math.max(.23,2/body.rightBays)):1;
  const corner=inset(full.right,0,0,split,1);
  const annexFloors=body.floors-1,cut=1/body.floors;
  const annex=stepped?{face:inset(full.right,split,cut,1-split,1-cut),floors:annexFloors,bays:Math.max(2,body.rightBays-2)}:null;
  const back=facadeDepth(corner,.03);
  const returnWall:Face|null=annex?[back[1],corner[1],at(corner,1,cut),at(back,1,cut)]:null;
  const outline=annex?[full.left[0],full.left[1],corner[1],annex.face[0],annex.face[1],annex.face[2],full.left[2],full.left[3]]:[full.left[0],full.left[1],corner[1],corner[2],full.left[2],full.left[3]];
  return {full,faces:{...full,right:corner},annex,returnWall,outline,cornerBays:stepped?2:body.rightBays};
}

export function storeyLines(floors:number){return Array.from({length:floors-1},(_,i)=>(i+1)/floors);}
