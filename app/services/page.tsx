import type{Metadata}from"next";import{ServiceCard}from"../components/ServiceCard";import{services,type ServiceCategory}from"../data/services";
export const metadata:Metadata={title:"Services",description:"Explore Golden Esthetics facials, brows, lashes, waxing, and add-ons."};
const groups:{title:string;cats:ServiceCategory[]}[]=[
 {title:"Facials",cats:["Facials"]},
 {title:"Waxing / Lashes / Brows",cats:["Waxing","Lashes","Brows"]},
 {title:"Add-Ons",cats:["Add-Ons"]},
];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z]+/g,"-").replace(/^-+|-+$/g,"");
export default function Page(){return <><section className="page-hero shell"><p className="eyebrow">The Golden menu</p><h1>Services made<br/><em>for your glow.</em></h1><p>Explore facials, brows, lashes, waxing, and thoughtful add-ons.</p></section><div className="category-nav shell">{groups.map(g=><a key={g.title} href={`#${slug(g.title)}`}>{g.title}</a>)}</div>{groups.map(g=>{const list=g.cats.flatMap(c=>services.filter(x=>x.category===c));return <section className="section shell menu-section" id={slug(g.title)} key={g.title}><div className="menu-heading"><p className="eyebrow">Golden Esthetics</p><h2>{g.title}</h2><span>{list.length} services</span></div><div className="service-grid">{list.map((x,i)=><ServiceCard key={x.id} service={x} index={i}/>)}</div></section>})}</>}
