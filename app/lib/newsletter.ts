type MonthlyIssue = {
  subject: string;
  preview: string;
  title: string;
  note: string;
  ritual: string[];
};

const issues: MonthlyIssue[] = [
  { subject: "A softer start for your skin ✦", preview: "A tiny January reset from Golden Esthetics.", title: "Keep the reset gentle.", note: "New-year skin does not need a dramatic overhaul. A consistent cleanser, moisturizer, and daily SPF will usually do more than a crowded shelf of brand-new actives.", ritual: ["Cleanse without scrubbing", "Moisturize while skin is slightly damp", "Wear SPF—even on gray days"] },
  { subject: "Your February glow note ♡", preview: "A little barrier love for winter skin.", title: "Love your skin barrier.", note: "If your skin feels tight, stingy, or extra reactive, pause the piling-on. Give it a few calm days with fragrance-free hydration and a simple routine.", ritual: ["Use lukewarm—not hot—water", "Add a nourishing moisturizer", "Give strong exfoliants a short break"] },
  { subject: "Spring skin is waking up ✦", preview: "A fresh March skincare note.", title: "Refresh, do not rush.", note: "As the weather shifts, introduce changes one at a time. That makes it much easier to tell what your skin actually likes.", ritual: ["Check products for freshness", "Wash makeup brushes", "Reapply SPF when you are outside"] },
  { subject: "April showers, golden glow ☂", preview: "This month’s sweet and simple skincare ritual.", title: "Hydration loves consistency.", note: "Hydrating products work best when you use them regularly. Think steady sips for your skin—not one giant splash once a month.", ritual: ["Apply serum to slightly damp skin", "Seal hydration with moisturizer", "Keep a clean towel just for your face"] },
  { subject: "A May SPF love letter ☀", preview: "The easiest glow-protecting habit.", title: "Protect the glow you are building.", note: "Daily sunscreen is one of the most useful habits for protecting against visible sun damage. Choose one you enjoy enough to use generously.", ritual: ["Apply SPF as your last morning step", "Remember ears, neck, and chest", "Reapply during long outdoor days"] },
  { subject: "Your summer-skin cheat sheet ✦", preview: "June skin, minus the overthinking.", title: "Keep summer skin light and clean.", note: "Sweat, sunscreen, and heat can change how products feel. A lighter moisturizer and a thorough evening cleanse may be all the seasonal adjustment you need.", ritual: ["Cleanse after heavy sweating", "Do not pick at surprise breakouts", "Book a professional reset when needed"] },
  { subject: "July glow without the fuss ☀", preview: "Three sunny-season reminders from Golden Esthetics.", title: "Cool, calm, protected.", note: "Sun-exposed skin needs kindness. Skip aggressive treatments on irritated or burned areas and focus on cooling hydration until everything feels normal again.", ritual: ["Seek shade during peak sun", "Use a hat as bonus protection", "Soothe first, exfoliate later"] },
  { subject: "The August skin refresh ✦", preview: "A mid-summer note for clear, comfortable skin.", title: "Clean tools make a difference.", note: "The things that touch your face matter too. Regularly clean your phone, pillowcase, brushes, and reusable headbands to keep your routine feeling fresh.", ritual: ["Change your pillowcase", "Wipe down your phone", "Wash brushes and sponges"] },
  { subject: "Golden-hour skin for September ✦", preview: "Your gentle fall transition starts here.", title: "Let your routine change slowly.", note: "Cooler air can make skin feel drier. Add richer hydration before adding more exfoliation, and watch how your skin responds for a full week or two.", ritual: ["Layer hydration under moisturizer", "Keep daytime SPF", "Introduce one change at a time"] },
  { subject: "October’s cozy-skin ritual ☾", preview: "A calm little routine for cooler nights.", title: "Your evening routine can be simple.", note: "A good nighttime ritual does not have to be long. Cleanse, treat only what needs treating, moisturize, and let sleep do its part.", ritual: ["Remove makeup fully", "Use actives as directed", "Finish with comfortable hydration"] },
  { subject: "A thankful little skin note ✦", preview: "November glow, grounded in the basics.", title: "Notice what is already working.", note: "Before buying something new, look at the habits that already keep your skin comfortable. Consistency is often the quiet star of a healthy-looking routine.", ritual: ["Keep your proven favorites", "Avoid last-minute product overload", "Plan treatments before big events"] },
  { subject: "December glow, wrapped in gold ✦", preview: "A festive skin note without the pressure.", title: "Give your skin breathing room.", note: "Busy weeks can lead to skipped routines and extra experimentation. Keep your dependable basics close and save brand-new treatments for a calmer moment.", ritual: ["Hydrate after travel", "Do not sleep in makeup", "Book ahead for January self-care"] },
];

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]!);

export function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyIssue(date = new Date()) {
  return issues[date.getUTCMonth()];
}

export function renderGoldenListEmail(issue: MonthlyIssue, options: { firstName?: string | null; siteUrl: string; unsubscribeUrl: string }) {
  const greeting = options.firstName ? `Hi ${escapeHtml(options.firstName)},` : "Hi golden one,";
  const ritual = issue.ritual.map(item => `<li style="margin:0 0 10px">${escapeHtml(item)}</li>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f7f2e8;color:#253126;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(issue.preview)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2e8"><tr><td align="center" style="padding:28px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #d8d0be"><tr><td style="padding:34px 38px 28px;background:#253126;color:#f7f2e8;text-align:center"><div style="font:italic 42px Georgia,serif;color:#dfc873">Golden Esthetics</div><div style="margin-top:10px;font-size:10px;letter-spacing:3px;text-transform:uppercase">The Golden List</div></td></tr><tr><td style="padding:42px 38px"><p style="margin:0 0 18px;font-size:15px">${greeting}</p><h1 style="margin:0 0 20px;font:42px/1 Georgia,serif;color:#9c790d">${escapeHtml(issue.title)}</h1><p style="margin:0 0 28px;font:18px/1.7 Georgia,serif;color:#4f554b">${escapeHtml(issue.note)}</p><div style="padding:24px;background:#eef0e7;border-left:4px solid #9c790d"><strong style="display:block;margin-bottom:14px;text-transform:uppercase;font-size:11px;letter-spacing:2px">This month’s little ritual</strong><ul style="margin:0;padding-left:20px;line-height:1.6">${ritual}</ul></div><p style="margin:30px 0 22px;font-size:13px;line-height:1.7;color:#60665d">Want help choosing a treatment? McKinnley can make it personal.</p><a href="${escapeHtml(options.siteUrl)}/find-my-facial" style="display:inline-block;background:#253126;color:#fff;text-decoration:none;padding:15px 20px;text-transform:uppercase;letter-spacing:1.5px;font-size:11px">Find my facial ✦</a></td></tr><tr><td style="padding:24px 38px;background:#f1eee4;text-align:center;color:#6c7169;font-size:11px;line-height:1.7">Golden Esthetics · Eclipse Salon &amp; Spa<br>Skincare education only—not medical advice.<br><a href="${escapeHtml(options.unsubscribeUrl)}" style="color:#6c7169;text-decoration:underline">Unsubscribe from the Golden List</a></td></tr></table></td></tr></table></body></html>`;
  const text = `${greeting}\n\n${issue.title}\n\n${issue.note}\n\nThis month’s little ritual:\n${issue.ritual.map(item => `- ${item}`).join("\n")}\n\nFind your facial: ${options.siteUrl}/find-my-facial\n\nSkincare education only—not medical advice.\nUnsubscribe: ${options.unsubscribeUrl}`;
  return { html, text };
}

