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

      addCustomItem: function (itemName, note) {
        initStore();
        if (!Store.all.mountElbert.customItems) {
          Store.all.mountElbert.customItems = [];
        }
        Store.all.mountElbert.customItems.push({ item: itemName, note: note });
        this.save();
      },

      removeCustomItem: function (index) {
        initStore();
        if (Store.all.mountElbert.customItems) {
          Store.all.mountElbert.customItems.splice(index, 1);
          this.save();
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
          itemsDiv.style.gap = '16px';

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

          catDiv.appendChild(itemsDiv);
          contentDiv.appendChild(catDiv);
        });

        // Custom items section
        var customItems = MountElbertPrep.getCustomItems();
        if (customItems.length > 0) {
          var customCatDiv = document.createElement('div');
          customCatDiv.className = 'card';
          customCatDiv.style.marginBottom = '16px';

          var customTitle = document.createElement('h3');
          customTitle.className = 'card__title';
          customTitle.textContent = 'Additional Items';
          customCatDiv.appendChild(customTitle);

          var customItemsDiv = document.createElement('div');
          customItemsDiv.style.display = 'flex';
          customItemsDiv.style.flexDirection = 'column';
          customItemsDiv.style.gap = '8px';

          customItems.forEach(function (customItem, idx) {
            var itemDiv = document.createElement('div');
            itemDiv.style.display = 'grid';
            itemDiv.style.gridTemplateColumns = '1fr 30px';
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
              MountElbertPrep.removeCustomItem(idx);
            });

            itemDiv.appendChild(deleteBtn);
            customItemsDiv.appendChild(itemDiv);
          });

          customCatDiv.appendChild(customItemsDiv);
          contentDiv.appendChild(customCatDiv);
        }

        // Add custom item form
        var formCard = document.createElement('div');
        formCard.className = 'card';

        var formTitle = document.createElement('h3');
        formTitle.className = 'card__title';
        formTitle.textContent = 'Add Custom Item';
        formCard.appendChild(formTitle);

        var form = document.createElement('div');
        form.style.display = 'grid';
        form.style.gridTemplateColumns = '1fr 1fr auto';
        form.style.gap = '12px';
        form.style.alignItems = 'end';

        var nameLabel = document.createElement('label');
        nameLabel.style.fontSize = '0.85em';
        nameLabel.style.opacity = '0.8';
        nameLabel.textContent = 'Item name';
        form.appendChild(nameLabel);

        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'e.g. Extra socks, hand warmers...';
        nameInput.style.padding = '6px 8px';
        nameInput.style.borderRadius = '4px';
        nameInput.style.border = '1px solid var(--border)';
        nameInput.style.fontSize = '0.9em';
        nameInput.style.gridColumn = '1';
        form.appendChild(nameInput);

        var noteLabel = document.createElement('label');
        noteLabel.style.fontSize = '0.85em';
        noteLabel.style.opacity = '0.8';
        noteLabel.textContent = 'Note (optional)';
        form.appendChild(noteLabel);

        var noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.placeholder = 'e.g. For wind protection';
        noteInput.style.padding = '6px 8px';
        noteInput.style.borderRadius = '4px';
        noteInput.style.border = '1px solid var(--border)';
        noteInput.style.fontSize = '0.9em';
        noteInput.style.gridColumn = '2';
        form.appendChild(noteInput);

        var addBtn = document.createElement('button');
        addBtn.textContent = 'Add';
        addBtn.style.padding = '6px 16px';
        addBtn.style.borderRadius = '4px';
        addBtn.style.border = 'none';
        addBtn.style.backgroundColor = 'var(--series-1)';
        addBtn.style.color = 'white';
        addBtn.style.fontWeight = '500';
        addBtn.style.cursor = 'pointer';
        addBtn.style.fontSize = '0.9em';
        addBtn.addEventListener('click', function () {
          var name = nameInput.value.trim();
          if (name) {
            MountElbertPrep.addCustomItem(name, noteInput.value.trim());
            nameInput.value = '';
            noteInput.value = '';
          }
        });

        form.appendChild(addBtn);
        formCard.appendChild(form);
        contentDiv.appendChild(formCard);
      }
    };
  })();

  window.MountElbertPrep = MountElbertPrep;
  Store.onChange(function () { MountElbertPrep.render(); });

})();
