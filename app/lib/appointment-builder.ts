import { services, type Service } from "../data/services.ts";
import { generateRecommendation, type ConsultationAnswers } from "./recommendations.ts";
export type Interest="facial"|"brows"|"lashes"|"waxing";
export type Budget="under-50"|"50-75"|"75-100"|"100-150"|"150-plus"|"none";
export type AppointmentInput={interests:Interest[];goals:string[];budget:Budget;student:boolean};
export type AppointmentPlan={services:Service[];subtotal:number;studentTotal:number|null;alternative:Service[];upgrade:Service|null;note:string};
const budgetMax:Record<Budget,number>={"under-50":49,"50-75":75,"75-100":100,"100-150":150,"150-plus":999,"none":999};
export function calculateStudentPrice(subtotal:number,percent=15){return Math.round(subtotal*(1-percent/100)*100)/100}
const cheapest=(category:Service["category"])=>services.filter(x=>x.category===category).sort((a,b)=>a.price-b.price)[0];
export function buildAppointment(input:AppointmentInput):AppointmentPlan{
 const selected:Service[]=[];
 if(input.interests.includes("facial")){const answers:ConsultationAnswers={goals:input.goals,skinType:"not sure",sensitivity:"not sure",products:["not sure"],otherProducts:"",notes:""};const match=services.find(x=>x.id===generateRecommendation(answers).serviceId)!;selected.push(match)}
 if(input.interests.includes("brows"))selected.push(cheapest("Brows"));
 if(input.interests.includes("lashes"))selected.push(cheapest("Lashes"));
 if(input.interests.includes("waxing"))selected.push(cheapest("Waxing"));
 if(!selected.length)selected.push(services.find(x=>x.id==="customized-facial")!);
 const max=budgetMax[input.budget];let plan=[...selected];
 while(plan.reduce((n,x)=>n+x.price,0)>max&&plan.length>1)plan.pop();
 if(plan.reduce((n,x)=>n+x.price,0)>max){const lower=services.filter(x=>x.category===plan[0].category&&x.price<=max).sort((a,b)=>b.price-a.price)[0];if(lower)plan=[lower]}
 const subtotal=plan.reduce((n,x)=>n+x.price,0);const alternative=selected.length!==plan.length||selected.some((x,i)=>x.id!==plan[i]?.id)?plan:selected.filter((_,i)=>i<Math.max(1,selected.length-1));
 const upgrade=services.filter(x=>x.category===plan[0].category&&x.price>plan[0].price&&x.price+subtotal-plan[0].price<=max).sort((a,b)=>a.price-b.price)[0]??null;
 return{services:plan,subtotal,studentTotal:input.student?calculateStudentPrice(subtotal):null,alternative,upgrade,note:"Final pricing, discount eligibility, service combinations, and availability are subject to Golden Esthetics confirmation."};
}
