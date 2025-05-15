
export async function decorate(container, data, query) {
    const myInner = `<sp-split-view primary-size="350" dir="ltr" resizable="" splitter-pos="350">
      <div class="menu"><sp-button>Try me</sp-button></div>>
      <div class="content"><sp-button>Test Infos</sp-button></div>
</sp-split-view>`

    console.log('test plugin loaded', data, query);
    container.innerHTML = myInner;
}

export default {
    title: 'Visual Tests',
    searchEnabled: true,
}