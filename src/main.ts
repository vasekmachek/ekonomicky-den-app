import "./style.css";
import { calculateSalary, PARAMS_2026, type ContractType, type SalaryResult } from "./salary";

const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });

const grossInput = document.querySelector<HTMLInputElement>("#gross")!;
const declaration = document.querySelector<HTMLInputElement>("#declaration")!;
const error = document.querySelector<HTMLParagraphElement>("#error")!;
const contractInputs = document.querySelectorAll<HTMLInputElement>('input[name="contract"]');
const contractNote = document.querySelector<HTMLParagraphElement>("#contract-note")!;
const netEl = document.querySelector<HTMLParagraphElement>("#net")!;
const bar = document.querySelector<HTMLDivElement>("#bar")!;
const breakdown = document.querySelector<HTMLDListElement>("#breakdown")!;
const costEl = document.querySelector<HTMLParagraphElement>("#cost")!;
const costNote = document.querySelector<HTMLParagraphElement>("#cost-note")!;

interface Part {
  key: string;
  label: string;
  value: number;
}

function parts(r: SalaryResult): Part[] {
  return [
    { key: "net", label: "Čistá mzda", value: r.net },
    { key: "tax", label: r.withholdingTax ? "Srážková daň" : "Daň z příjmu", value: r.tax },
    { key: "social", label: "Sociální pojištění", value: r.social },
    { key: "health", label: "Zdravotní pojištění", value: r.health },
  ];
}

function selectedContract(): ContractType {
  const checked = Array.from(contractInputs).find((i) => i.checked);
  return checked?.value === "dpp" ? "dpp" : "hpp";
}

function render(): void {
  const contract = selectedContract();
  contractNote.hidden = contract !== "dpp";
  contractNote.textContent =
    contract === "dpp"
      ? `Na DPP se pod ${czk.format(PARAMS_2026.dppInsuranceLimit)} měsíčně neplatí pojištění. Bez podepsaného prohlášení ti firma strhne ${Math.round(PARAMS_2026.withholdingTaxRate * 100)} % srážkovou daň.`
      : "";

  const gross = Number(grossInput.value);
  if (grossInput.value.trim() === "" || !Number.isFinite(gross) || gross < 0) {
    error.textContent = "Zadej hrubou mzdu jako kladné číslo, třeba 40000.";
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const r = calculateSalary(gross, { signedDeclaration: declaration.checked, contract });
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

  costEl.textContent = czk.format(r.employerCost);
  costNote.textContent = !r.insured
    ? "Pod limitem DPP firma za tebe pojištění neplatí."
    : gross > 0
      ? `K hrubé mzdě firma platí ještě ${czk.format(r.employerSocial + r.employerHealth)} na pojištění. Z každé koruny, kterou za tebe zaplatí, dostaneš ${Math.round((r.net / r.employerCost) * 100)} haléřů.`
      : "";
}

grossInput.addEventListener("input", render);
declaration.addEventListener("change", render);
contractInputs.forEach((i) => i.addEventListener("change", render));
document.querySelector("#form")!.addEventListener("submit", (e) => e.preventDefault());
render();
