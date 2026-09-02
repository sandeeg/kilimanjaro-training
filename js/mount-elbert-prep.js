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
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '12px';
            itemDiv.style.padding = '8px';
            itemDiv.style.borderRadius = '4px';
            itemDiv.style.backgroundColor = isDone ? 'var(--bg-muted)' : 'transparent';

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
            itemLabel.style.flex = '1';
            itemLabel.style.fontSize = '0.95em';
            itemLabel.style.textDecoration = isDone ? 'line-through' : 'none';
            itemLabel.style.opacity = isDone ? '0.6' : '1';
            itemLabel.textContent = itemObj.item;
            itemDiv.appendChild(itemLabel);

            // Status badges
            var statusDiv = document.createElement('div');
            statusDiv.style.display = 'flex';
            statusDiv.style.gap = '8px';
            statusDiv.style.alignItems = 'center';

            if (isDone) {
              var completedBadge = document.createElement('span');
              completedBadge.style.padding = '2px 8px';
              completedBadge.style.borderRadius = '12px';
              completedBadge.style.fontSize = '0.85em';
              completedBadge.style.fontWeight = '500';
              completedBadge.style.backgroundColor = 'var(--series-3)';
              completedBadge.style.color = 'white';
              completedBadge.textContent = '✓ Completed';
              statusDiv.appendChild(completedBadge);
            } else if (assigneeName) {
              var assignedBadge = document.createElement('span');
              assignedBadge.style.padding = '2px 8px';
              assignedBadge.style.borderRadius = '12px';
              assignedBadge.style.fontSize = '0.85em';
              assignedBadge.style.fontWeight = '500';
              assignedBadge.style.backgroundColor = 'var(--series-1)';
              assignedBadge.style.color = 'white';
              assignedBadge.textContent = '→ ' + assigneeName;
              statusDiv.appendChild(assignedBadge);
            } else {
              var unassignedBadge = document.createElement('span');
              unassignedBadge.style.padding = '2px 8px';
              unassignedBadge.style.borderRadius = '12px';
              unassignedBadge.style.fontSize = '0.85em';
              unassignedBadge.style.opacity = '0.6';
              unassignedBadge.textContent = 'Unassigned';
              statusDiv.appendChild(unassignedBadge);
            }

            itemDiv.appendChild(statusDiv);

            // Assignee dropdown
            var assigneeSelect = document.createElement('select');
            assigneeSelect.style.padding = '4px 8px';
            assigneeSelect.style.borderRadius = '4px';
            assigneeSelect.style.border = '1px solid var(--border)';
            assigneeSelect.style.fontSize = '0.9em';
            assigneeSelect.style.minWidth = '120px';

            var nooneOption = document.createElement('option');
            nooneOption.value = '';
            nooneOption.textContent = '— unassigned';
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

          sectionDiv.appendChild(itemsDiv);
          contentDiv.appendChild(sectionDiv);
        });
      }
    };
  })();

  window.MountElbertPrep = MountElbertPrep;
  Store.onChange(function () { MountElbertPrep.render(); });

})();
