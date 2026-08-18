export const skinGoals = ["breakouts","dryness","dullness","visible redness","sensitivity","uneven-looking tone","dark spots","hyperpigmentation","sun spots","fine lines","smoother-looking texture","hydration","glow","preventative skincare","not sure"] as const;
export const skinTypes = ["oily","dry","combination","normal","sensitive","not sure"] as const;
export const sensitivityLevels = ["not sensitive","somewhat sensitive","very sensitive","not sure"] as const;
export const strongProducts = ["retinol","prescription retinoid","prescription acne treatment","exfoliating acids","benzoyl peroxide","none","not sure"] as const;
export type ConsultationAnswers={goals:string[];skinType:string;sensitivity:string;products:string[];otherProducts:string;notes:string};
export type Recommendation={serviceId:string;matchedGoals:string[];reason:string;caution:string|null;addOnIds:string[];confidence:"high"|"guided"};
const serviceRules=[
 {id:"calming-facial",goals:["visible redness","sensitivity"],types:["sensitive"],weight:4},
 {id:"hydrating-facial",goals:["dryness","dullness","hydration","glow"],types:["dry"],weight:3},
 {id:"clarifying-facial",goals:["breakouts"],types:["oily"],weight:4},
 {id:"shine-bright",goals:["uneven-looking tone","dark spots","hyperpigmentation","sun spots","glow"],types:[],weight:3},
 {id:"anti-aging-facial",goals:["fine lines","preventative skincare"],types:[],weight:3},
];
const strongSet=new Set(["retinol","prescription retinoid","prescription acne treatment","exfoliating acids","benzoyl peroxide"]);
export function generateRecommendation(a:ConsultationAnswers,photoCategories:string[]=[]):Recommendation{
 const photoGoalMap:Record<string,string>={redness:"visible redness",tone:"uneven-looking tone",texture:"smoother-looking texture",hydration:"hydration",congestion:"breakouts"};
 const photoGoals=photoCategories.map(x=>photoGoalMap[x]).filter((x):x is string=>Boolean(x));
 const effective={...a,goals:[...new Set([...a.goals,...photoGoals])]};
 const highSensitivity=a.sensitivity==="very sensitive"||a.skinType==="sensitive";
 const scored=serviceRules.map(rule=>({rule,score:rule.goals.filter(x=>effective.goals.includes(x)).length*rule.weight+(rule.types.includes(a.skinType)?2:0)+(highSensitivity&&rule.id==="calming-facial"?5:0)})).sort((x,y)=>y.score-x.score);
 const overlap=scored.filter(x=>x.score>0&&x.score===scored[0]?.score).length>1;
 let serviceId=scored[0]?.score>0?scored[0].rule.id:"customized-facial";
 if(overlap&&a.goals.length>=4&&!highSensitivity)serviceId="customized-facial";
 const matchedGoals=serviceRules.find(x=>x.id===serviceId)?.goals.filter(x=>effective.goals.includes(x))??effective.goals.filter(x=>x!=="not sure").slice(0,3);
 const hasStrong=a.products.some(x=>strongSet.has(x));
 const caution=highSensitivity||hasStrong?"Because you reported sensitivity or strong skincare use, McKinnley should confirm the best treatment and add-ons before your appointment.":null;
 const addOnIds:string[]=[];
 if(highSensitivity||effective.goals.includes("visible redness"))addOnIds.push("cool-globes");
 else if(effective.goals.some(x=>["dryness","dullness","hydration"].includes(x)))addOnIds.push("jelly-mask");
 if(!highSensitivity&&!hasStrong&&effective.goals.includes("breakouts"))addOnIds.push("skin-scrubber");
 if(!highSensitivity&&!hasStrong&&effective.goals.includes("smoother-looking texture"))addOnIds.push("microdermabrasion");
 const label=matchedGoals.length?matchedGoals.join(", "):"your mix of skincare goals";
 const photoNote=photoGoals.length?" plus Sparrow’s non-medical photo cues":"";
 return{serviceId,matchedGoals,reason:`This may be a thoughtful starting point based on ${label}, how you described your skin${photoNote}.`,caution,addOnIds:addOnIds.slice(0,2),confidence:serviceId==="customized-facial"?"guided":"high"};
}
export const emptyConsultation:ConsultationAnswers={goals:[],skinType:"",sensitivity:"",products:[],otherProducts:"",notes:""};
