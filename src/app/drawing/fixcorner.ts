import { Point } from "./point";

export interface FixcornerInterface {
    point1:Point,
    point2:Point,
    clockwise:boolean
} 

 export type Fixcorner = FixcornerInterface | null;
