import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | map-ui/search-panel/add-remove-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<MapUi::SearchPanel::AddRemoveButton />`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <MapUi::SearchPanel::AddRemoveButton>
        template block text
      </MapUi::SearchPanel::AddRemoveButton>
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
