const monitor=document.getElementById("monitor");

function appendToDisplay(input) {

    monitor.textContent += input;
}

function clearDisplay() {
    monitor.textContent="";

}

function calculate() {
    monitor.textContent=eval(monitor.textContent);
}

function backspace() {
    monitor.textContent= monitor.textContent.slice(0, -1);
}