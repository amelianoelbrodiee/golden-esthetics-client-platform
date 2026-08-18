export const screeningConfig={status:"REQUIRES MCKINNLEY APPROVAL BEFORE PRODUCTION",questions:[
 {id:"retinoids",label:"Are you currently using retinol or prescription retinoids?",requiresConfirmation:true},
 {id:"acids",label:"Have you recently used strong exfoliating acids?",requiresConfirmation:true},
 {id:"procedure",label:"Have you recently received a cosmetic skin procedure?",requiresConfirmation:true},
 {id:"irritated",label:"Is your skin currently very irritated, sunburned, broken, or injured?",requiresConfirmation:true},
 {id:"sensitive",label:"Do you consider your skin highly sensitive?",requiresConfirmation:true},
 {id:"reaction",label:"Are you currently experiencing an unusual skin reaction?",requiresConfirmation:true},
] as const};
export function evaluateScreening(answers:Record<string,boolean>){const flagged=screeningConfig.questions.filter(x=>answers[x.id]);return{flagged,shouldContact:flagged.length>0,message:flagged.length?"Please contact McKinnley before booking so she can confirm the most appropriate next step.":"No answers were flagged by this preliminary check. McKinnley will still confirm service suitability."}}
