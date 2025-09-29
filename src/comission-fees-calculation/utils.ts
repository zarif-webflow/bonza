import {
  AVERAGE_BROKER_FEE,
  AVERAGE_BROKER_MINIMUM_FEE,
  BONZA_FEE,
  BONZA_MINIMUM_FEE,
} from "./constants";

export const calculateComissionFees = (salePrice: number) => {
  const averageBrokerFee = Math.max(salePrice * AVERAGE_BROKER_FEE, AVERAGE_BROKER_MINIMUM_FEE);
  const bonzaFee = Math.max(salePrice * BONZA_FEE, BONZA_MINIMUM_FEE);
  const savings = averageBrokerFee - bonzaFee;

  return {
    averageBrokerFee,
    bonzaFee,
    savings,
  };
};

/**
 * Ensures that only numeric input is allowed on an input element
 * @param inputElement - The HTML input element to restrict to numbers only
 * @param options - Configuration options for the numeric input restriction
 */
export function enforceNumericInput(
  inputElement: HTMLInputElement,
  options: {
    allowDecimals?: boolean;
    allowNegative?: boolean;
    maxDecimals?: number;
  } = {}
): void {
  const { allowDecimals = true, allowNegative = false, maxDecimals = 2 } = options;

  // Set input type and inputmode for better mobile experience
  inputElement.setAttribute("inputmode", "numeric");

  // Handle keydown events to prevent non-numeric characters
  inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
    const key = event.key;
    const currentValue = inputElement.value;
    const selectionStart = inputElement.selectionStart || 0;

    // Allow special keys (backspace, delete, tab, escape, enter, arrows, etc.)
    if (
      key === "Backspace" ||
      key === "Delete" ||
      key === "Tab" ||
      key === "Escape" ||
      key === "Enter" ||
      key === "ArrowLeft" ||
      key === "ArrowRight" ||
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "Home" ||
      key === "End" ||
      (event.ctrlKey && (key === "a" || key === "c" || key === "v" || key === "x" || key === "z"))
    ) {
      return;
    }

    // Allow numeric keys (0-9)
    if (/^\d$/.test(key)) {
      return;
    }

    // Allow decimal point if enabled and not already present
    if (allowDecimals && key === "." && !currentValue.includes(".")) {
      return;
    }

    // Allow comma for thousand separators
    if (key === ",") {
      return;
    }

    // Allow minus sign if enabled, only at the beginning, and not already present
    if (allowNegative && key === "-" && selectionStart === 0 && !currentValue.includes("-")) {
      return;
    }

    // Prevent all other characters
    event.preventDefault();
  });

  // Handle paste events to filter out non-numeric content
  inputElement.addEventListener("paste", (event: ClipboardEvent) => {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData("text") || "";
    const filteredText = filterNumericText(pastedText, {
      allowDecimals,
      allowNegative,
      maxDecimals,
    });

    if (filteredText) {
      // Insert the filtered text at the current cursor position
      const selectionStart = inputElement.selectionStart || 0;
      const selectionEnd = inputElement.selectionEnd || 0;
      const currentValue = inputElement.value;

      const newValue =
        currentValue.substring(0, selectionStart) +
        filteredText +
        currentValue.substring(selectionEnd);

      inputElement.value = newValue;

      // Set cursor position after the inserted text
      const newCursorPosition = selectionStart + filteredText.length;
      inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

      // Trigger input event for any listeners
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // Handle input events to validate and clean the value
  inputElement.addEventListener("input", () => {
    const currentValue = inputElement.value;
    const filteredValue = filterNumericText(currentValue, {
      allowDecimals,
      allowNegative,
      maxDecimals,
    });

    if (currentValue !== filteredValue) {
      const cursorPosition = inputElement.selectionStart || 0;
      inputElement.value = filteredValue;

      // Restore cursor position, adjusting for any removed characters
      const lengthDifference = currentValue.length - filteredValue.length;
      const newCursorPosition = Math.max(0, cursorPosition - lengthDifference);
      inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  });
}

/**
 * Filters text to keep only numeric characters based on the provided options
 * @param text - The text to filter
 * @param options - Configuration options for filtering
 * @returns The filtered numeric text
 */
function filterNumericText(
  text: string,
  options: {
    allowDecimals?: boolean;
    allowNegative?: boolean;
    maxDecimals?: number;
  }
): string {
  const { allowDecimals = true, allowNegative = false, maxDecimals = 2 } = options;

  let filtered = text;

  // Remove all non-numeric characters except decimal point, minus sign, and commas
  let pattern = "[^0-9";
  if (allowDecimals) pattern += ".";
  if (allowNegative) pattern += "-";
  pattern += ",]";

  filtered = filtered.replace(new RegExp(pattern, "g"), "");

  // Handle negative sign: only allow one at the beginning
  if (allowNegative) {
    const minusCount = (filtered.match(/-/g) || []).length;
    if (minusCount > 1) {
      // Keep only the first minus sign if it's at the beginning
      const firstMinus = filtered.indexOf("-");
      if (firstMinus === 0) {
        filtered = "-" + filtered.substring(1).replace(/-/g, "");
      } else {
        filtered = filtered.replace(/-/g, "");
      }
    } else if (minusCount === 1 && filtered.indexOf("-") !== 0) {
      // Move minus to the beginning if it's not already there
      filtered = "-" + filtered.replace("-", "");
    }
  }

  // Handle decimal point: only allow one
  if (allowDecimals) {
    const decimalCount = (filtered.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimal = filtered.indexOf(".");
      filtered =
        filtered.substring(0, firstDecimal + 1) +
        filtered.substring(firstDecimal + 1).replace(/\./g, "");
    }

    // Limit decimal places
    const decimalIndex = filtered.indexOf(".");
    if (decimalIndex !== -1 && filtered.length > decimalIndex + maxDecimals + 1) {
      filtered = filtered.substring(0, decimalIndex + maxDecimals + 1);
    }
  }

  // Handle commas: format as thousand separators
  filtered = formatWithCommas(filtered, allowDecimals);

  return filtered;
}

/**
 * Formats a numeric string with proper comma placement for thousand separators
 * @param value - The numeric string to format
 * @param allowDecimals - Whether decimals are allowed
 * @returns The formatted string with proper comma placement
 */
export function formatWithCommas(value: string, allowDecimals: boolean): string {
  if (!value) return value;

  // Handle negative sign
  const isNegative = value.startsWith("-");
  const workingValue = isNegative ? value.substring(1) : value;

  // Split into integer and decimal parts
  const parts = workingValue.split(".");
  let integerPart = parts[0] || "";
  const decimalPart = allowDecimals && parts[1] ? "." + parts[1] : "";

  // Remove existing commas from integer part
  integerPart = integerPart.replace(/,/g, "");

  // Add commas to integer part (every 3 digits from right)
  if (integerPart.length > 3) {
    integerPart = integerPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  // Reconstruct the value
  const result = (isNegative ? "-" : "") + integerPart + decimalPart;
  return result;
}
