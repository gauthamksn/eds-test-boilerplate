const container = `<sp-split-view primary-size="350" dir="ltr" resizable="" splitter-pos="350">
      <div class="menu"><sp-button>Try me</sp-button></div>>
      <div class="content"><sp-button>Test Infos</sp-button></div>
</sp-split-view>`

export async function decorate(container, data, query) {
    console.log('test plugin loaded', data, query);
    container.innerHTML = container
}

export default {
    title: 'Visual Tests',
    searchEnabled: true,
}