/* ============================================================================
   mount-elbert-prep.js — Mount Elbert collaborative checklist
   ========================================================================== */

(function () {

  var CFG = window.TREK_CONFIG;
  var CHECKLIST = window.MOUNT_ELBERT_CHECKLIST;

  var MountElbertPrep = (function () {

    function itemKey(sectionName, itemName) {
      return sectionName + '::' + itemName;
    }

    function assigneeKey(sectionName, itemName) {
      return sectionName + '::' + itemName + '::assignee';
    }

    function initStore() {
      if (!Store.all.mountElbert) {
        Store.all.mountElbert = {
          items: {},     // "section::item": { done: bool }
          assignees: {}  // "section::item::assignee": "p1"
        };
      }
    }

    return {
      toggleItem: function (sectionName, itemName) {
        initStore();
        var key = itemKey(sectionName, itemName);
        if (!Store.all.mountElbert.items[key]) {
          Store.all.mountElbert.items[key] = {};
        }
        Store.all.mountElbert.items[key].done = !Store.all.mountElbert.items[key].done;
        this.save();
      },

      isDone: function (sectionName, itemName) {
        initStore();
        var key = itemKey(sectionName, itemName);
        return !!(Store.all.mountElbert.items[key] && Store.all.mountElbert.items[key].done);
      },

      setAssignee: function (sectionName, itemName, personId) {
        initStore();
        var key = assigneeKey(sectionName, itemName);
        if (personId) {
          Store.all.mountElbert.assignees[key] = personId;
        } else {
          delete Store.all.mountElbert.assignees[key];
        }
        this.save();
      },

      getAssignee: function (sectionName, itemName) {
        initStore();
        var key = assigneeKey(sectionName, itemName);
        return Store.all.mountElbert.assignees[key] || null;
      },

      save: function () {
        try {
          localStorage.setItem('kili-training-v1', JSON.stringify(Store.all));
        } catch (e) {
          console.warn('Could not save Mount Elbert prep.', e);
        }
      },

      render: function () {
        var contentDiv = document.getElementById('elbertChecklistContent');
        if (!contentDiv) return;

        initStore();
        contentDiv.innerHTML = '';

        CHECKLIST.sections.forEach(function (section) {
          var sectionDiv = document.createElement('div');
          sectionDiv.className = 'card';
          sectionDiv.style.marginBottom = '16px';

          var title = document.createElement('h3');
          title.className = 'card__title';
          title.textContent = section.name;
          sectionDiv.appendChild(title);

          var itemsDiv = document.createElement('div');
          itemsDiv.style.display = 'flex';
          itemsDiv.style.flexDirection = 'column';
          itemsDiv.style.gap = '12px';

          section.items.forEach(function (itemObj) {
            var isDone = MountElbertPrep.isDone(section.name, itemObj.item);
            var currentAssignee = MountElbertPrep.getAssignee(section.name, itemObj.item);
            var assigneeName = null;

            if (currentAssignee) {
              var assigneeObj = CFG.team.filter(function (p) { return p.id === currentAssignee; })[0];
              assigneeName = assigneeObj ? assigneeObj.name : null;
            }

            var itemDiv = document.createElement('div');
            itemDiv.style.display = 'grid';
            itemDiv.style.gridTemplateColumns = '30px 1fr 100px 150px 120px';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '12px';
            itemDiv.style.padding = '10px';
            itemDiv.style.borderRadius = '4px';
            itemDiv.style.backgroundColor = isDone ? 'var(--bg-muted)' : 'transparent';
            itemDiv.style.borderBottom = '1px solid var(--border)';

            // Checkbox
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isDone;
            checkbox.style.width = '20px';
            checkbox.style.height = '20px';
            checkbox.style.cursor = 'pointer';
            checkbox.addEventListener('change', function () {
              MountElbertPrep.toggleItem(section.name, itemObj.item);
            });
            itemDiv.appendChild(checkbox);

            // Item name
            var itemLabel = document.createElement('span');
            itemLabel.style.fontSize = '0.95em';
            itemLabel.style.textDecoration = isDone ? 'line-through' : 'none';
            itemLabel.style.opacity = isDone ? '0.6' : '1';
            itemLabel.textContent = itemObj.item;
            itemDiv.appendChild(itemLabel);

            // Status dropdown
            var statusSelect = document.createElement('select');
            statusSelect.style.padding = '4px 6px';
            statusSelect.style.borderRadius = '4px';
            statusSelect.style.border = '1px solid var(--border)';
            statusSelect.style.fontSize = '0.85em';
            statusSelect.style.fontWeight = '500';

            var unassignedOpt = document.createElement('option');
            unassignedOpt.value = 'unassigned';
            unassignedOpt.textContent = 'Unassigned';
            statusSelect.appendChild(unassignedOpt);

            var assignedOpt = document.createElement('option');
            assignedOpt.value = 'assigned';
            assignedOpt.textContent = 'Assigned';
            statusSelect.appendChild(assignedOpt);

            var completedOpt = document.createElement('option');
            completedOpt.value = 'completed';
            completedOpt.textContent = 'Completed';
            statusSelect.appendChild(completedOpt);

            if (isDone) {
              statusSelect.value = 'completed';
            } else if (currentAssignee) {
              statusSelect.value = 'assigned';
            } else {
              statusSelect.value = 'unassigned';
            }

            statusSelect.addEventListener('change', function (e) {
              if (e.target.value === 'completed') {
                if (!isDone) MountElbertPrep.toggleItem(section.name, itemObj.item);
              } else if (e.target.value === 'unassigned') {
                if (isDone) MountElbertPrep.toggleItem(section.name, itemObj.item);
                if (currentAssignee) MountElbertPrep.setAssignee(section.name, itemObj.item, null);
              }
            });

            itemDiv.appendChild(statusSelect);

            // Assigned to display
            var assignedDiv = document.createElement('div');
            assignedDiv.style.fontSize = '0.9em';
            assignedDiv.style.fontWeight = '500';
            if (assigneeName) {
              assignedDiv.textContent = assigneeName;
              assignedDiv.style.color = 'var(--series-1)';
            } else {
              assignedDiv.textContent = '—';
              assignedDiv.style.opacity = '0.5';
            }
            itemDiv.appendChild(assignedDiv);

            // Assignee dropdown
            var assigneeSelect = document.createElement('select');
            assigneeSelect.style.padding = '4px 6px';
            assigneeSelect.style.borderRadius = '4px';
            assigneeSelect.style.border = '1px solid var(--border)';
            assigneeSelect.style.fontSize = '0.85em';

            var nooneOption = document.createElement('option');
            nooneOption.value = '';
            nooneOption.textContent = '—';
            assigneeSelect.appendChild(nooneOption);

            CFG.team.forEach(function (person) {
              var option = document.createElement('option');
              option.value = person.id;
              option.textContent = person.name;
              if (currentAssignee === person.id) option.selected = true;
              assigneeSelect.appendChild(option);
            });

            assigneeSelect.addEventListener('change', function (e) {
              MountElbertPrep.setAssignee(section.name, itemObj.item, e.target.value || null);
            });

            itemDiv.appendChild(assigneeSelect);
            itemsDiv.appendChild(itemDiv);
          });

          // Add header row
          var headerDiv = document.createElement('div');
          headerDiv.style.display = 'grid';
          headerDiv.style.gridTemplateColumns = '30px 1fr 100px 150px 120px';
          headerDiv.style.gap = '12px';
          headerDiv.style.padding = '8px 10px';
          headerDiv.style.fontWeight = '600';
          headerDiv.style.fontSize = '0.85em';
          headerDiv.style.opacity = '0.7';
          headerDiv.style.borderBottom = '2px solid var(--border)';
          headerDiv.style.marginBottom = '8px';

          var headers = ['', 'Item', 'Status', 'Assigned to', 'Change'];
          headers.forEach(function (h) {
            var th = document.createElement('span');
            th.textContent = h;
            headerDiv.appendChild(th);
          });

          itemsDiv.insertBefore(headerDiv, itemsDiv.firstChild);

          sectionDiv.appendChild(itemsDiv);
          contentDiv.appendChild(sectionDiv);
        });
      }
    };
  })();

  window.MountElbertPrep = MountElbertPrep;
  Store.onChange(function () { MountElbertPrep.render(); });

})();
