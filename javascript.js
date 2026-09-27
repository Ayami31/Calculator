const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let completedExpression = "";

function formatNumber(value) {
	if (!Number.isFinite(value)) return "Error";
	const rounded = Number(value.toPrecision(11));
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 10,
	}).format(rounded);
}

function render() {
	display.textContent = currentInput === "Error"
		? "Error"
		: formatNumber(Number(currentInput));

	if (completedExpression) {
		expression.textContent = completedExpression;
	} else if (pendingOperator && storedValue !== null) {
		expression.textContent = `${formatNumber(storedValue)} ${pendingOperator}`;
	} else {
		expression.innerHTML = "&nbsp;";
	}
}

function enterDigit(digit) {
	completedExpression = "";
	if (currentInput === "Error" || waitingForOperand) {
		currentInput = digit;
		waitingForOperand = false;
	} else if (currentInput === "0") {
		currentInput = digit;
	} else {
		currentInput += digit;
	}
	render();
}

function enterDecimal() {
	completedExpression = "";
	if (currentInput === "Error" || waitingForOperand) {
		currentInput = "0.";
		waitingForOperand = false;
	} else if (!currentInput.includes(".")) {
		currentInput += ".";
	}
	render();
}

function calculate(left, right, operator) {
	switch (operator) {
		case "+": return left + right;
		case "−": return left - right;
		case "×": return left * right;
		case "÷": return right === 0 ? NaN : left / right;
		default: return right;
	}
}

function chooseOperator(operator) {
	const inputValue = Number(currentInput);
	if (currentInput === "Error") return;

	if (pendingOperator && !waitingForOperand) {
		const result = calculate(storedValue, inputValue, pendingOperator);
		currentInput = Number.isFinite(result) ? String(result) : "Error";
		storedValue = Number.isFinite(result) ? result : null;
	} else {
		storedValue = inputValue;
	}

	pendingOperator = operator;
	waitingForOperand = true;
	completedExpression = "";
	render();
}

function showResult() {
	if (!pendingOperator || storedValue === null || currentInput === "Error") return;

	const rightValue = Number(currentInput);
	const result = calculate(storedValue, rightValue, pendingOperator);
	completedExpression = `${formatNumber(storedValue)} ${pendingOperator} ${formatNumber(rightValue)} =`;
	currentInput = Number.isFinite(result) ? String(result) : "Error";
	storedValue = null;
	pendingOperator = null;
	waitingForOperand = true;
	render();
}

function clearCalculator() {
	currentInput = "0";
	storedValue = null;
	pendingOperator = null;
	waitingForOperand = false;
	completedExpression = "";
	render();
}

function deleteDigit() {
	if (currentInput === "Error") {
		clearCalculator();
		return;
	}
	completedExpression = "";
	if (waitingForOperand) return;
	currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
	if (currentInput === "-" || currentInput === "") currentInput = "0";
	render();
}

function handleAction(action) {
	if (action === "clear") clearCalculator();
	if (action === "delete") deleteDigit();
	if (action === "decimal") enterDecimal();
	if (action === "equals") showResult();
}

keypad.addEventListener("click", (event) => {
	const button = event.target.closest("button");
	if (!button) return;

	if (button.dataset.digit !== undefined) enterDigit(button.dataset.digit);
	if (button.dataset.operator) chooseOperator(button.dataset.operator);
	if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
	if (/^[0-9]$/.test(event.key)) enterDigit(event.key);
	else if (event.key === ".") enterDecimal();
	else if (["+", "-", "*", "/"].includes(event.key)) {
		const operators = { "+": "+", "-": "−", "*": "×", "/": "÷" };
		chooseOperator(operators[event.key]);
	} else if (event.key === "Enter" || event.key === "=") {
		event.preventDefault();
		showResult();
	} else if (event.key === "Backspace") {
		deleteDigit();
	} else if (event.key === "Escape") {
		clearCalculator();
	}
});

render();
