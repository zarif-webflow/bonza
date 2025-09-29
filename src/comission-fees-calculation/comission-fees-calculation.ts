import { getHtmlElement } from "@taj-wf/utils";

import { enforceNumericInput } from "./utils";

const initComissionFeesCalculation = () => {
  const salePriceInput = getHtmlElement<HTMLInputElement>({
    selector: "[comission-fees=sale-input]",
    log: "error",
  });

  const savingsDisplay = getHtmlElement<HTMLElement>({
    selector: "[comission-fees=savings-display]",
    log: "error",
  });

  if (!salePriceInput || !savingsDisplay) return;

  enforceNumericInput(salePriceInput);
};

initComissionFeesCalculation();
