/* ============================================================================
   recommendations.js — team gear recommendations
   ========================================================================== */

(function () {

  var CFG = window.TREK_CONFIG;
  var PACK = window.TREK_PACKING;

  var Recommendations = (function () {

    function recKey(category, item, personId) {
      return category + '::' + item + '::' + personId;
    }

    function neededKey(category, item, personId) {
      return category + '::' + item + '::' + personId + '::needed';
    }

    function initStore() {
      if (!Store.all.recommendations) {
        Store.all.recommendations = {};
      }
    }

    return {
      get: function (category, item, personId) {
        initStore();
        return Store.all.recommendations[recKey(category, item, personId)] || '';
      },

      set: function (category, item, personId, value) {
        initStore();
        var k = recKey(category, item, personId);
        var v = String(value || '').trim();
        if (v) {
          Store.all.recommendations[k] = v;
        } else {
          delete Store.all.recommendations[k];
        }
        try {
          localStorage.setItem('kili-training-v1', JSON.stringify(Store.all));
        } catch (e) {
          console.warn('Could not save recommendation.', e);
        }
      },

      getNeeded: function (category, item, personId) {
        initStore();
        var k = neededKey(category, item, personId);
        return Store.all.recommendations[k] || 'yes'; // default to needed
      },

      setNeeded: function (category, item, personId, needed) {
        initStore();
        var k = neededKey(category, item, personId);
        if (needed === 'yes' || needed === true) {
          Store.all.recommendations[k] = 'yes';
        } else {
          Store.all.recommendations[k] = 'no';
        }
        try {
          localStorage.setItem('kili-training-v1', JSON.stringify(Store.all));
        } catch (e) {
          console.warn('Could not save needed status.', e);
        }
      },

      render: function () {
        var contentDiv = document.getElementById('recContent');
        if (!contentDiv) return;

        initStore();
        contentDiv.innerHTML = '';

        PACK.categories.forEach(function (cat) {
          var catDiv = document.createElement('div');
          catDiv.className = 'card';
          catDiv.style.marginBottom = '16px';

          var title = document.createElement('h3');
          title.className = 'card__title';
          title.textContent = cat.name;
          catDiv.appendChild(title);

          var itemsDiv = document.createElement('div');
          itemsDiv.style.display = 'flex';
          itemsDiv.style.flexDirection = 'column';
          itemsDiv.style.gap = '16px';

          cat.items.forEach(function (itemObj) {
            var itemDiv = document.createElement('div');
            itemDiv.style.borderBottom = '1px solid var(--border)';
            itemDiv.style.paddingBottom = '16px';
            itemDiv.style.marginBottom = '16px';

            var itemName = document.createElement('div');
            itemName.style.fontWeight = '500';
            itemName.style.marginBottom = '12px';
            itemName.textContent = itemObj.item + (itemObj.qty > 1 ? ' (' + itemObj.qty + ')' : '');
            itemDiv.appendChild(itemName);

            var personsGrid = document.createElement('div');
            personsGrid.style.display = 'grid';
            personsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            personsGrid.style.gap = '16px';

            CFG.team.forEach(function (person) {
              var personField = document.createElement('div');
              personField.style.display = 'flex';
              personField.style.flexDirection = 'column';
              personField.style.gap = '6px';
              personField.style.padding = '10px';
              personField.style.borderRadius = '4px';
              personField.style.backgroundColor = 'var(--bg-muted)';

              var label = document.createElement('label');
              label.style.fontSize = '0.85em';
              label.style.fontWeight = '600';
              label.style.opacity = '0.9';
              label.textContent = person.name;
              personField.appendChild(label);

              // Needed/Not Needed status
              var neededContainer = document.createElement('div');
              neededContainer.style.display = 'flex';
              neededContainer.style.gap = '8px';
              neededContainer.style.marginBottom = '4px';

              var neededLabel = document.createElement('label');
              neededLabel.style.fontSize = '0.75em';
              neededLabel.style.opacity = '0.7';
              neededLabel.style.textTransform = 'uppercase';
              neededLabel.style.letterSpacing = '0.5px';
              neededLabel.textContent = 'Need it:';
              neededContainer.appendChild(neededLabel);

              var neededSelect = document.createElement('select');
              neededSelect.style.padding = '3px 6px';
              neededSelect.style.borderRadius = '3px';
              neededSelect.style.border = '1px solid var(--border)';
              neededSelect.style.fontSize = '0.8em';
              neededSelect.style.minWidth = '90px';

              var yesOpt = document.createElement('option');
              yesOpt.value = 'yes';
              yesOpt.textContent = 'Yes, needed';
              neededSelect.appendChild(yesOpt);

              var noOpt = document.createElement('option');
              noOpt.value = 'no';
              noOpt.textContent = 'No, not needed';
              neededSelect.appendChild(noOpt);

              var currentNeeded = Recommendations.getNeeded(cat.name, itemObj.item, person.id);
              neededSelect.value = currentNeeded;

              neededSelect.addEventListener('change', function (e) {
                Recommendations.setNeeded(cat.name, itemObj.item, person.id, e.target.value);
              });

              neededContainer.appendChild(neededSelect);
              personField.appendChild(neededContainer);

              var input = document.createElement('input');
              input.type = 'text';
              input.placeholder = 'e.g. Salomon, Merrell...';
              input.style.padding = '6px 8px';
              input.style.borderRadius = '4px';
              input.style.border = '1px solid var(--border)';
              input.style.fontSize = '0.9em';

              var currentRec = Recommendations.get(cat.name, itemObj.item, person.id);
              input.value = currentRec;

              input.addEventListener('input', function (e) {
                Recommendations.set(cat.name, itemObj.item, person.id, e.target.value);
              });

              personField.appendChild(input);
              personsGrid.appendChild(personField);
            });

            itemDiv.appendChild(personsGrid);
            itemsDiv.appendChild(itemDiv);
          });

          catDiv.appendChild(itemsDiv);
          contentDiv.appendChild(catDiv);
        });
      }
    };
  })();

  window.Recommendations = Recommendations;
  Store.onChange(function () { Recommendations.render(); });

})();
