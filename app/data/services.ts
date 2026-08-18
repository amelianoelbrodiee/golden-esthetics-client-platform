export type ServiceCategory = "Facials" | "Brows" | "Lashes" | "Waxing" | "Add-Ons";
export type Service = { id:string; name:string; category:ServiceCategory; price:number; priceLabel:string; description:string; goodFor:string[]; bookingUrl:string; active:boolean; featured?:boolean };
const square="https://golden-esthetics-101699.square.site/";
const s=(id:string,name:string,category:ServiceCategory,price:number,description:string,goodFor:string[],featured=false,priceLabel=`$${price}`):Service=>({id,name,category,price,priceLabel,description,goodFor,bookingUrl:square,active:true,featured});
export const services:Service[]=[
 s("quick-fix","The Quick Fix","Facials",50,"A mini customized facial for a simple refresh when time is short.",["Quick refresh","Maintenance","First facial"],true),
 s("anti-aging-facial","Anti-Aging Facial","Facials",100,"Focused on the appearance of age spots, fine lines, and mature-skin goals.",["Fine lines","Mature skin goals","Age-spot appearance"]),
 s("shine-bright","Shine Bright","Facials",100,"Created for a brighter-looking complexion and the appearance of uneven tone and dark spots.",["Uneven-looking tone","Dark spots","Brightness"],true),
 s("clarifying-facial","Clarifying Facial","Facials",100,"Customized care for breakout-prone skin, visible congestion, and oilier areas.",["Breakout-prone skin","Congestion","Oily areas"]),
 s("calming-facial","Calming Facial","Facials",100,"A cooling, soothing experience for sensitive, reactive-feeling skin and visible redness.",["Sensitive skin","Visible redness","Gentle care"]),
 s("hydrating-facial","Hydrating Facial","Facials",100,"Hydration-focused care for dry or dull-looking skin and a soft, fresh glow.",["Dryness","Dehydration","Glow"],true),
 s("customized-facial","Customized Facial","Facials",75,"A facial shaped around your unique combination of goals and concerns.",["Overlapping goals","Not sure where to start","Personalization"],false,"$75+"),
 s("brow-wax","Brow Wax","Brows",20,"Clean, polished shaping tailored to your natural brow line.",["Brow shaping","Maintenance"],true),
 s("brow-wax-tint","Brow Wax & Tint","Brows",40,"Brow shaping paired with tint for a fuller, more defined look.",["Shape and definition","Low-maintenance polish"]),
 s("brow-lash-tint","Brow/Lash Tint","Brows",20,"A customized tint to enhance the look of brows or lashes.",["Subtle definition","Makeup-free days"]),
 s("brow-lamination","Brow Lamination","Brows",80,"A polished, lifted brow look that includes wax and tint.",["Fuller-looking brows","Lifted shape"]),
 s("lash-lift-tint","Lash Lift & Tint","Lashes",70,"Enhances natural lashes with lift and deeper definition.",["Lifted lashes","Low-maintenance definition"]),
 s("upper-lip-chin-wax","Upper Lip / Chin Wax","Waxing",10,"Targeted facial waxing for a smooth, clean finish.",["Quick maintenance"]),
 s("full-face-wax","Full Face Wax","Waxing",35,"A complete facial waxing service for smooth-looking skin.",["Full-face smoothness"]),
 s("underarm-wax","Underarm Wax","Waxing",30,"Professional underarm waxing for a smooth finish.",["Regular maintenance"]),
 s("dermaplaning","Dermaplaning","Add-Ons",30,"Helps remove surface buildup and peach fuzz for a smoother-looking finish.",["Peach fuzz","Smoother-looking texture"]),
 s("skin-scrubber","Skin Scrubber","Add-Ons",10,"A gentle add-on designed to support a fresh, clarified feel.",["Congested-looking areas"]),
 s("jelly-mask","Jelly Mask","Add-Ons",20,"A peel-off mask selected to complement your skin goals and facial.",["Hydration","Comfort"]),
 s("cool-globes","Cool Globes","Add-Ons",5,"A cooling finishing touch for a soothed, refreshed feel.",["Sensitive-feeling skin","Visible redness"]),
 s("microdermabrasion","Microdermabrasion","Add-Ons",45,"An exfoliating add-on for smoother-looking texture when appropriate.",["Texture","Surface exfoliation"]),
];
export const featuredServices=services.filter(x=>x.featured);
export const serviceCategories:ServiceCategory[]=["Facials","Brows","Lashes","Waxing","Add-Ons"];
