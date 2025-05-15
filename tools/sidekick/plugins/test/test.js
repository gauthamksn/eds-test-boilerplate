export async function decorate(container, data, query) {
    console.log('test plugin loaded', data, query);
    container.innerHTML = "<sp-button>Try me</sp-button>"
}

export default {
    title: 'Visual Tests',
    searchEnabled: true,
}