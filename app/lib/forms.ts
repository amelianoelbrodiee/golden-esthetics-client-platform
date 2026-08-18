export const cleanText=(value:unknown,max=1000)=>String(value??"").trim().replace(/[<>]/g,"").slice(0,max);
export const isEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=254;
export const isPhone=(value:string)=>!value||/^[+()\-\d\s.]{7,25}$/.test(value);
