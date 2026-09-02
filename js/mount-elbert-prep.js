/* ============================================================================
   mount-elbert-prep.js — Mount Elbert gear checklist
   ========================================================================== */

(function () {

  var CFG = window.TREK_CONFIG;

  var MountElbertPrep = (function () {

    function gearKey(category, item, personId) {
      return category + '::' + item + '::' + personId;
    }

    function neededKey(category, item, personId) {
      return category + '::' + item + '::' + personId + '::needed';
    }

    function initStore() {
      if (!Store.all.mountElbert) {
        Store.all.mountElbert = {
          gear: {},     // "category::item::personId": "recommendation text"
          needed: {}    // "category::item::personId::needed": "yes" or "no"
        };
      }
    }

    return {
      getRecommendation: function (category, item, personId) {
        initStore();
        return Store.all.mountElbert.gear[gearKey(category, item, personId)] || '';
      },

      setRecommendation: function (category, item, personId, value) {
        initStore();
        var k = gearKey(category, item, personId);
        var v = String(value || '').trim();
        if (v) {
          Store.all.mountElbert.gear[k] = v;
        } else {
          delete Store.all.mountElbert.gear[k];
        }
        this.save();
      },

      getNeeded: function (category, item, personId) {
        initStore();
        var k = neededKey(category, item, personId);
        return Store.all.mountElbert.needed[k] || 'yes'; // default to needed
      },

      setNeeded: function (category, item, personId, needed) {
        initStore();
        var k = neededKey(category, item, personId);
        if (needed === 'yes' || needed === true) {
          Store.all.mountElbert.needed[k] = 'yes';
        } else {
          Store.all.mountElbert.needed[k] = 'no';
        }
        this.save();
      },

      save: function () {
        try {
          localStorage.setItem('kili-training-v1', JSON.stringify(Store.all));
        } catch (e) {
          console.warn('Could not save Mount Elbert gear.', e);
        }
      },

      render: function () {
        var contentDiv = document.getElementById('elbertChecklistContent');
        if (!contentDiv) return;

        var GEAR = window.MOUNT_ELBERT_GEAR;
        if (!GEAR || !GEAR.categories) {
          contentDiv.innerHTML = '<p>Gear data not loaded yet.</p>';
          return;
        }

        initStore();
        contentDiv.innerHTML = '';

        GEAR.categories.forEach(function (cat) {
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

            var itemHeader = document.createElement('div');
            itemHeader.style.marginBottom = '12px';

            var itemName = document.createElement('div');
            itemName.style.fontWeight = '600';
            itemName.style.fontSize = '0.95em';
            itemName.textContent = itemObj.item;
            itemHeader.appendChild(itemName);

            var itemNote = document.createElement('div');
            itemNote.style.fontSize = '0.8em';
            itemNote.style.opacity = '0.7';
            itemNote.style.marginTop = '2px';
            itemNote.textContent = itemObj.note;
            itemHeader.appendChild(itemNote);

            itemDiv.appendChild(itemHeader);

            var personsGrid = document.createElement('div');
            personsGrid.style.display = 'grid';
            personsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            personsGrid.style.gap = '16px';

            CFG.team.forEach(function (person) {
              var personField = document.createElement('div');
              personField.style.display = 'flex';
              personField.style.flexDirection = 'column';
              personField.style.gap = '8px';
              personField.style.padding = '12px';
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
              neededContainer.style.alignItems = 'center';

              var neededLabel = document.createElement('label');
              neededLabel.style.fontSize = '0.75em';
              neededLabel.style.opacity = '0.7';
              neededLabel.style.textTransform = 'uppercase';
              neededLabel.style.letterSpacing = '0.5px';
              neededLabel.textContent = 'Need it:';
              neededContainer.appendChild(neededLabel);

              var neededSelect = document.createElement('select');
              neededSelect.style.padding = '4px 8px';
              neededSelect.style.borderRadius = '3px';
              neededSelect.style.border = '1px solid var(--border)';
              neededSelect.style.fontSize = '0.85em';
              neededSelect.style.minWidth = '110px';

              var yesOpt = document.createElement('option');
              yesOpt.value = 'yes';
              yesOpt.textContent = 'Yes, needed';
              neededSelect.appendChild(yesOpt);

              var noOpt = document.createElement('option');
              noOpt.value = 'no';
              noOpt.textContent = 'No, skip it';
              neededSelect.appendChild(noOpt);

              var currentNeeded = MountElbertPrep.getNeeded(cat.name, itemObj.item, person.id);
              neededSelect.value = currentNeeded;

              neededSelect.addEventListener('change', function (e) {
                MountElbertPrep.setNeeded(cat.name, itemObj.item, person.id, e.target.value);
              });

              neededContainer.appendChild(neededSelect);
              personField.appendChild(neededContainer);

              var recLabel = document.createElement('label');
              recLabel.style.fontSize = '0.75em';
              recLabel.style.opacity = '0.7';
              recLabel.style.textTransform = 'uppercase';
              recLabel.style.letterSpacing = '0.5px';
              recLabel.textContent = 'Brand / Recommendation';
              personField.appendChild(recLabel);

              var input = document.createElement('input');
              input.type = 'text';
              input.placeholder = 'e.g. Salomon, REI Co-op...';
              input.style.padding = '6px 8px';
              input.style.borderRadius = '4px';
              input.style.border = '1px solid var(--border)';
              input.style.fontSize = '0.9em';

              var currentRec = MountElbertPrep.getRecommendation(cat.name, itemObj.item, person.id);
              input.value = currentRec;

              input.addEventListener('input', function (e) {
                MountElbertPrep.setRecommendation(cat.name, itemObj.item, person.id, e.target.value);
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

  window.MountElbertPrep = MountElbertPrep;
  Store.onChange(function () { MountElbertPrep.render(); });

})();
