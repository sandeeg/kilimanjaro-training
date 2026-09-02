/* ============================================================================
   mount-elbert-prep.js — Mount Elbert gear checklist
   ========================================================================== */

(function () {

  var CFG = window.TREK_CONFIG;

  var MountElbertPrep = (function () {

    function neededKey(category, item) {
      return category + '::' + item + '::needed';
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
      getNeeded: function (category, item) {
        initStore();
        var k = neededKey(category, item);
        return Store.all.mountElbert.needed[k] || 'yes'; // default to needed
      },

      setNeeded: function (category, item, needed) {
        initStore();
        var k = neededKey(category, item);
        if (needed === 'yes' || needed === true) {
          Store.all.mountElbert.needed[k] = 'yes';
        } else {
          Store.all.mountElbert.needed[k] = 'no';
        }
        this.save();
      },

      addCustomItem: function (category, itemName, note) {
        initStore();
        if (!Store.all.mountElbert.customItems) {
          Store.all.mountElbert.customItems = [];
        }
        Store.all.mountElbert.customItems.push({ category: category, item: itemName, note: note });
        this.save();
      },

      removeCustomItem: function (category, index) {
        initStore();
        if (Store.all.mountElbert.customItems) {
          var itemsInCat = Store.all.mountElbert.customItems.filter(function (item) {
            return item.category === category;
          });
          if (index < itemsInCat.length) {
            var itemToRemove = itemsInCat[index];
            Store.all.mountElbert.customItems = Store.all.mountElbert.customItems.filter(function (item) {
              return !(item.category === category && item.item === itemToRemove.item);
            });
            this.save();
          }
        }
      },

      getCustomItems: function () {
        initStore();
        return Store.all.mountElbert.customItems || [];
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
        if (!contentDiv) {
          console.log('elbertChecklistContent div not found');
          return;
        }

        var GEAR = window.MOUNT_ELBERT_GEAR;
        if (!GEAR) {
          console.log('MOUNT_ELBERT_GEAR not defined');
          contentDiv.innerHTML = '<p style="color: red;">Mount Elbert gear data not loaded.</p>';
          return;
        }

        if (!GEAR.categories) {
          console.log('GEAR.categories not defined');
          contentDiv.innerHTML = '<p style="color: red;">Gear categories not found.</p>';
          return;
        }

        console.log('Rendering Mount Elbert with ' + GEAR.categories.length + ' categories');
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
          itemsDiv.style.gap = '8px';

          cat.items.forEach(function (itemObj) {
            var itemDiv = document.createElement('div');
            itemDiv.style.display = 'grid';
            itemDiv.style.gridTemplateColumns = '1fr 150px';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '12px';
            itemDiv.style.padding = '12px';
            itemDiv.style.borderBottom = '1px solid var(--border)';
            itemDiv.style.borderRadius = '4px';

            var itemInfo = document.createElement('div');
            itemInfo.style.display = 'flex';
            itemInfo.style.flexDirection = 'column';
            itemInfo.style.gap = '2px';

            var itemName = document.createElement('div');
            itemName.style.fontWeight = '600';
            itemName.style.fontSize = '0.95em';
            itemName.textContent = itemObj.item;
            itemInfo.appendChild(itemName);

            var itemNote = document.createElement('div');
            itemNote.style.fontSize = '0.8em';
            itemNote.style.opacity = '0.7';
            itemNote.textContent = itemObj.note;
            itemInfo.appendChild(itemNote);

            itemDiv.appendChild(itemInfo);

            // Needed/Not Needed status
            var neededSelect = document.createElement('select');
            neededSelect.style.padding = '6px 8px';
            neededSelect.style.borderRadius = '4px';
            neededSelect.style.border = '1px solid var(--border)';
            neededSelect.style.fontSize = '0.9em';
            neededSelect.style.fontWeight = '500';

            var yesOpt = document.createElement('option');
            yesOpt.value = 'yes';
            yesOpt.textContent = 'Yes, needed';
            neededSelect.appendChild(yesOpt);

            var noOpt = document.createElement('option');
            noOpt.value = 'no';
            noOpt.textContent = 'No, skip it';
            neededSelect.appendChild(noOpt);

            var currentNeeded = MountElbertPrep.getNeeded(cat.name, itemObj.item);
            neededSelect.value = currentNeeded;

            neededSelect.addEventListener('change', function (e) {
              MountElbertPrep.setNeeded(cat.name, itemObj.item, e.target.value);
            });

            itemDiv.appendChild(neededSelect);
            itemsDiv.appendChild(itemDiv);
          });

          // Add custom item form for this category
          var customItemsInCat = MountElbertPrep.getCustomItems().filter(function (item) {
            return item.category === cat.name;
          });

          customItemsInCat.forEach(function (customItem, idx) {
            var itemDiv = document.createElement('div');
            itemDiv.style.display = 'grid';
            itemDiv.style.gridTemplateColumns = '1fr 150px 30px';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '12px';
            itemDiv.style.padding = '12px';
            itemDiv.style.borderBottom = '1px solid var(--border)';
            itemDiv.style.borderRadius = '4px';
            itemDiv.style.opacity = '0.8';

            var itemInfo = document.createElement('div');
            itemInfo.style.display = 'flex';
            itemInfo.style.flexDirection = 'column';
            itemInfo.style.gap = '2px';

            var itemName = document.createElement('div');
            itemName.style.fontWeight = '600';
            itemName.style.fontSize = '0.95em';
            itemName.style.fontStyle = 'italic';
            itemName.textContent = customItem.item;
            itemInfo.appendChild(itemName);

            if (customItem.note) {
              var itemNote = document.createElement('div');
              itemNote.style.fontSize = '0.8em';
              itemNote.style.opacity = '0.7';
              itemNote.textContent = customItem.note;
              itemInfo.appendChild(itemNote);
            }

            itemDiv.appendChild(itemInfo);

            var neededSelect = document.createElement('select');
            neededSelect.style.padding = '6px 8px';
            neededSelect.style.borderRadius = '4px';
            neededSelect.style.border = '1px solid var(--border)';
            neededSelect.style.fontSize = '0.9em';
            neededSelect.style.fontWeight = '500';

            var yesOpt = document.createElement('option');
            yesOpt.value = 'yes';
            yesOpt.textContent = 'Yes, needed';
            neededSelect.appendChild(yesOpt);

            var noOpt = document.createElement('option');
            noOpt.value = 'no';
            noOpt.textContent = 'No, skip it';
            neededSelect.appendChild(noOpt);

            var currentNeeded = MountElbertPrep.getNeeded(cat.name, customItem.item);
            neededSelect.value = currentNeeded;

            neededSelect.addEventListener('change', function (e) {
              MountElbertPrep.setNeeded(cat.name, customItem.item, e.target.value);
            });

            itemDiv.appendChild(neededSelect);

            var deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.style.padding = '4px 8px';
            deleteBtn.style.borderRadius = '4px';
            deleteBtn.style.border = '1px solid var(--border)';
            deleteBtn.style.backgroundColor = 'transparent';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '1em';
            deleteBtn.style.opacity = '0.6';
            deleteBtn.title = 'Remove item';
            deleteBtn.addEventListener('click', function () {
              MountElbertPrep.removeCustomItem(cat.name, idx);
            });

            itemDiv.appendChild(deleteBtn);
            itemsDiv.appendChild(itemDiv);
          });

          // Add custom item input for this category
          var addRow = document.createElement('div');
          addRow.style.display = 'grid';
          addRow.style.gridTemplateColumns = '1fr 150px';
          addRow.style.gap = '12px';
          addRow.style.padding = '12px';
          addRow.style.backgroundColor = 'var(--bg-muted)';
          addRow.style.borderRadius = '4px';
          addRow.style.marginTop = '8px';

          var addInput = document.createElement('input');
          addInput.type = 'text';
          addInput.placeholder = '+ Add custom item...';
          addInput.style.padding = '6px 8px';
          addInput.style.borderRadius = '4px';
          addInput.style.border = '1px solid var(--border)';
          addInput.style.fontSize = '0.9em';

          var addBtn = document.createElement('button');
          addBtn.textContent = 'Add to category';
          addBtn.style.padding = '6px 12px';
          addBtn.style.borderRadius = '4px';
          addBtn.style.border = 'none';
          addBtn.style.backgroundColor = 'var(--series-1)';
          addBtn.style.color = 'white';
          addBtn.style.fontWeight = '500';
          addBtn.style.cursor = 'pointer';
          addBtn.style.fontSize = '0.85em';

          addBtn.addEventListener('click', function () {
            var itemName = addInput.value.trim();
            if (itemName) {
              MountElbertPrep.addCustomItem(cat.name, itemName, '');
              addInput.value = '';
            }
          });

          addInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
              addBtn.click();
            }
          });

          addRow.appendChild(addInput);
          addRow.appendChild(addBtn);
          itemsDiv.appendChild(addRow);

          catDiv.appendChild(itemsDiv);
          contentDiv.appendChild(catDiv);
        });

      }
    };
  })();

  window.MountElbertPrep = MountElbertPrep;
  Store.onChange(function () { MountElbertPrep.render(); });

})();
