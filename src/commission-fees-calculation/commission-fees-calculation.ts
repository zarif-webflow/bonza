import { getHtmlElement, getMultipleHtmlElements } from "@taj-wf/utils";

import { createElementConfetti } from "./element-confetti";
import { calculateCommissionFees, enforceNumericInput, formatWithCommas } from "./utils";

const initCommissionFeesCalculation = () => {
  const salePriceInput = getHtmlElement<HTMLInputElement>({
    selector: "[commission-fees=sale-input]",
    log: "error",
  });

  const savingsDisplay = getHtmlElement<HTMLElement>({
    selector: "[commission-fees=savings-display]",
    log: "error",
  });

  const calcButton = getHtmlElement<HTMLButtonElement>({
    selector: "[commission-fees=calc-button]",
    log: "error",
  });

  if (!salePriceInput || !savingsDisplay || !calcButton) return;

  enforceNumericInput(salePriceInput, {
    allowDecimals: false,
    allowNegative: false,
    maxDecimals: 0,
  });

  const initialSavingsText = savingsDisplay.textContent || "";

  const showConfetti = createElementConfetti(savingsDisplay);

  const changeInputValue = (value: string) => {
    salePriceInput.value = value;
    salePriceInput.dispatchEvent(new Event("input"));
  };

  const handleCalculation = () => {
    const parsedSalePrice = parseInt(salePriceInput.value.replace(/,/g, ""), 10);

    const isNan = Number.isNaN(parsedSalePrice);

    if (isNan) {
      savingsDisplay.textContent = initialSavingsText;
      savingsDisplay.classList.add("is-inactive");
      return;
    }

    const calculatedValues = calculateCommissionFees(parsedSalePrice);

    savingsDisplay.textContent = `$${formatWithCommas(Math.floor(calculatedValues.savings).toString(), false)}`;
    savingsDisplay.classList.remove("is-inactive");
    showConfetti();
  };

  calcButton.addEventListener("click", handleCalculation);

  salePriceInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleCalculation();
    }
  });

  const setupQuickExampleButtons = () => {
    const exampleButtons = getMultipleHtmlElements<HTMLButtonElement>({
      selector: "[commission-example-price]",
    });

    if (!exampleButtons) return;

    for (const button of exampleButtons) {
      const examplePrice = button.getAttribute("commission-example-price");
      if (!examplePrice) continue;

      button.addEventListener("click", () => {
        changeInputValue(examplePrice);
        handleCalculation();
      });
    }
  };

  setupQuickExampleButtons();
};

initCommissionFeesCalculation();
