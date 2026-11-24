import "./style.css";
import { calculateSalary, type SalaryResult } from "./salary";
import { donutSlices } from "./chart";

const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });

const grossInput = document.querySelector<HTMLInputElement>("#gross")!;
const declaration = document.querySelector<HTMLInputElement>("#declaration")!;
const error = document.querySelector<HTMLParagraphElement>("#error")!;
const netEl = document.querySelector<HTMLParagraphElement>("#net")!;
const bar = document.querySelector<HTMLDivElement>("#bar")!;
const breakdown = document.querySelector<HTMLDListElement>("#breakdown")!;
const costEl = document.querySelector<HTMLParagraphElement>("#cost")!;
const costNote = document.querySelector<HTMLParagraphElement>("#cost-note")!;
const donut = document.querySelector<SVGSVGElement>("#donut")!;
const donutGroup = document.querySelector<SVGGElement>("#donut-slices")!;
const donutNet = document.querySelector<HTMLSpanElement>("#donut-net")!;
const SVG_NS = "http://www.w3.org/2000/svg";

interface Part {
  key: string;
  label: string;
  value: number;
}

function parts(r: SalaryResult): Part[] {
  return [
    { key: "net", label: "Čistá mzda", value: r.net },
    { key: "tax", label: "Daň z příjmu", value: r.tax },
    { key: "social", label: "Sociální pojištění", value: r.social },
    { key: "health", label: "Zdravotní pojištění", value: r.health },
  ];
}

function render(): void {
  const gross = Number(grossInput.value);
  if (grossInput.value.trim() === "" || !Number.isFinite(gross) || gross < 0) {
    error.textContent = "Zadej hrubou mzdu jako kladné číslo, třeba 40000.";
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const r = calculateSalary(gross, { signedDeclaration: declaration.checked });
  netEl.textContent = czk.format(r.net);

  const list = parts(r);
  bar.replaceChildren(
    ...list.map((p) => {
      const seg = document.createElement("span");
      seg.className = `seg seg-${p.key}`;
      seg.style.flexGrow = String(Math.max(p.value, 0));
      return seg;
    }),
  );

  breakdown.replaceChildren(
    ...list.flatMap((p) => {
      const dt = document.createElement("dt");
      dt.innerHTML = `<i class="dot seg-${p.key}"></i>`;
      dt.append(p.label);
      const dd = document.createElement("dd");
      const share = gross > 0 ? Math.round((p.value / gross) * 100) : 0;
      dd.textContent = `${czk.format(p.value)} · ${share} %`;
      return [dt, dd];
    }),
  );

  const slices = donutSlices(list);
  donutGroup.replaceChildren(
    ...slices
      .filter((s) => s.length > 0)
      .map((s) => {
        const c = document.createElementNS(SVG_NS, "circle");
        c.setAttribute("class", `donut-slice stroke-${s.key}`);
        c.setAttribute("cx", "21");
        c.setAttribute("cy", "21");
        c.setAttribute("r", "15.9155");
        c.setAttribute("pathLength", "100");
        c.setAttribute("stroke-dasharray", `${s.length} ${100 - s.length}`);
        c.setAttribute("stroke-dashoffset", String(-s.start));
        return c;
      }),
  );
  donutNet.textContent = `${slices[0].percent} %`;
  donut.setAttribute(
    "aria-label",
    "Kam jdou peníze: " + list.map((p, i) => `${p.label} ${slices[i].percent} %`).join(", "),
  );

  costEl.textContent = czk.format(r.employerCost);
  costNote.textContent =
    gross > 0
      ? `K hrubé mzdě firma platí ještě ${czk.format(r.employerSocial + r.employerHealth)} na pojištění. Z každé koruny, kterou za tebe zaplatí, dostaneš ${Math.round((r.net / r.employerCost) * 100)} haléřů.`
      : "";
}

grossInput.addEventListener("input", render);
declaration.addEventListener("change", render);
document.querySelector("#form")!.addEventListener("submit", (e) => e.preventDefault());
render();
