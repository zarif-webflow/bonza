import { getHtmlElement, getMultipleHtmlElements } from "@taj-wf/utils";

import { calculateComissionFees, enforceNumericInput, formatWithCommas } from "./utils";

const initComissionFeesCalculation = () => {
  const salePriceInput = getHtmlElement<HTMLInputElement>({
    selector: "[comission-fees=sale-input]",
    log: "error",
  });

  const savingsDisplay = getHtmlElement<HTMLElement>({
    selector: "[comission-fees=savings-display]",
    log: "error",
  });

  const calcButton = getHtmlElement<HTMLButtonElement>({
    selector: "[comission-fees=calc-button]",
    log: "error",
  });

  if (!salePriceInput || !savingsDisplay || !calcButton) return;

  enforceNumericInput(salePriceInput, {
    allowDecimals: false,
    allowNegative: false,
    maxDecimals: 0,
  });

  const changeInputValue = (value: string) => {
    salePriceInput.value = "120,000";
    salePriceInput.value = value;
    salePriceInput.dispatchEvent(new Event("input"));
  };

  const handleCalculation = () => {
    const parsedSalePrice = parseInt(salePriceInput.value.replace(/,/g, ""), 10);

    const calculatedValues = calculateComissionFees(
      Number.isNaN(parsedSalePrice) ? 0 : parsedSalePrice
    );

    savingsDisplay.textContent = `${formatWithCommas(Math.floor(calculatedValues.savings).toString(), false)}`;
  };

  calcButton.addEventListener("click", handleCalculation);

  salePriceInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleCalculation();
    }
  });

  const setupQuickExampleButtons = () => {
    const exampleButtons = getMultipleHtmlElements<HTMLButtonElement>({
      selector: "[comission-example-price]",
    });

    if (!exampleButtons) return;

    for (const button of exampleButtons) {
      const examplePrice = button.getAttribute("comission-example-price");
      if (!examplePrice) continue;

      button.addEventListener("click", () => {
        changeInputValue(examplePrice);
        handleCalculation();
      });
    }
  };

  setupQuickExampleButtons();
};

initComissionFeesCalculation();
