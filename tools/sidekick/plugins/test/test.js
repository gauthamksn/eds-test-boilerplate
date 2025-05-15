export function decorate(container, data) {
    console.log('test plugin loaded', data);
    container.innerHTML = "<sp-button>Try me</sp-button>"
}
