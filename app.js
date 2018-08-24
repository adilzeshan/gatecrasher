const ENDPOINT = 'https://gatecrashers.herokuapp.com';

// Model
let state = {
  events: [],
  currentEvent: null
};

// Controller (connecting Model to View)
let controller = {
  getEvents: function getEvents() {
    return new Promise((res, rej) => {
      fetch(`${ENDPOINT}/events`)
        .then(data => data.json())
        .then(data => res(data))
        .catch(err => {
          console.log(err);
          res([]);
        });
    });
  },

  getEvent: id => {
    if (id) {
      let event = state.events.find(event => {
        return event.id === id;
      });

      state.currentEvent = event;
      return event;
    }

    return state.currentEvent;
  },

  updateState: function updateState(event) {
    if (event) state.events.push(event);
    view.render(state);
  },

  patchState: function patchState(id, body) {
    let event = state.events.find(e => id === e.id);

    for (let property in body) {
      event[property] = body[property];
    }

    view.render(state);
  }
};

// View
let view = {
  init: function init() {
    document.getElementById('events').addEventListener('click', e => {
      if (e.target.className === 'event') {
        let nodeList = document.getElementById('events').childNodes;

        nodeList.forEach(el => {
          el.className = 'event';
        });

        e.target.className = 'event selected';

        let event = controller.getEvent(e.target.id);
        let fragment = document.createDocumentFragment();
        let ul = document.createElement('ul');

        for (var el in event) {
          let li = document.createElement('li');
          li.innerHTML = `<strong>${el}</strong>: ${JSON.stringify(event[el])}`;
          ul.appendChild(li);
        }

        fragment.appendChild(ul);

        document.getElementById('event').innerHTML = '';
        document.getElementById('event').appendChild(fragment);
      }

      // Modal - click on event
      // - Displays modal
      // - Displays selected-event element
      document.getElementsByClassName('modal')[0].classList.add('visible');
      document.getElementsByClassName('selected-event')[0].classList.add('displayed');
    });

    // Modal - new-event-btn
    // - Displays modal
    // - Displays new-event-form element
    document.getElementById('new-event-btn').addEventListener('click', () => {
      document.getElementsByClassName('modal')[0].classList.add('visible');
      document.getElementsByClassName('new-event-form')[0].classList.add('displayed');

    });

    document.getElementById('edit-event-btn').addEventListener('click', e => {
      let currentEvent = controller.getEvent();
      let stagingArea = document.getElementsByClassName('edit-event')[0];

      // Modal - edit-event-btn
      // - Hides selected-event element
      // - Displays edit-event element
      document.getElementsByClassName('selected-event')[0].classList.remove('displayed');
      document.getElementsByClassName('edit-event')[0].classList.add('displayed');


      let fragment = document.createDocumentFragment();
      let descriptionLabel = document.createElement('span');
      let description = document.createElement('input');
      let submitBtn = document.createElement('button');

      descriptionLabel.innerText = 'description: ';
      description.value = currentEvent.description;
      description.id = 'edit-description';
      submitBtn.innerText = "Submit";

      submitBtn.addEventListener('click', e => {
        let description = document.getElementById('edit-description').value;

        let body = {
          description
        };

        // PATCH request
        fetch(`${ENDPOINT}/event/${currentEvent.id}`, {
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json'
          },
          method: 'POST',
          mode: 'cors'
        })
          .then(data => data.json())
          .then(event => {
            controller.patchState(currentEvent.id, body);
          })
          .catch(err => {
            console.log(err);
          });

          // Modal - submit button
          // - Hides Modal after editing an event
          // - Hides edit-event element
          document.getElementsByClassName('modal')[0].classList.remove('visible');
          document.getElementsByClassName('edit-event')[0].classList.remove('displayed');

      });

      fragment.appendChild(descriptionLabel);
      fragment.appendChild(description);
      fragment.appendChild(submitBtn);

      stagingArea.innerHTML = '';
      stagingArea.appendChild(fragment);
    });

    // Modal - modal--close span element
    // Needs: refactoring
    // - Hides modal, selected-event, new-event-form, edit-event elements
    document.getElementsByClassName('modal--close')[0].addEventListener('click', (e) => {
      document.getElementsByClassName('modal')[0].classList.remove('visible');
      document.getElementsByClassName('selected-event')[0].classList.remove('displayed');
      document.getElementsByClassName('new-event-form')[0].classList.remove('displayed');
      document.getElementsByClassName('edit-event')[0].classList.remove('displayed');
    });

    document.getElementById('new-event-submit').addEventListener('click', () => {
      let descriptionVal = document.getElementById('description-input').value;

      let body = {
        description: descriptionVal
      };

      fetch(`${ENDPOINT}/event`, {
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors'
      })
        .then(data => data.json())
        .then(event => {
          controller.updateState(event);
        })
        .catch(err => {
          console.log(err);
        });

      // Resetting the input value
      document.getElementById('description-input').value = '';

      // Modal - after submitting new event
      // - Hides modal element
      // - Hides new-event-form
      document.getElementsByClassName('modal')[0].classList.remove('visible');
      document.getElementsByClassName('new-event-form')[0].classList.remove('displayed');
    });
  },

  render: function render(state) {
    // if (state.currentEvent === null) document.getElementById('edit-event-btn').style.display = "none";

    let fragment = document.createDocumentFragment();

    state.events.forEach((element) => {
      let listElement = document.createElement('li');
      listElement.className = 'event';
      listElement.setAttribute('id', element.id);
      listElement.innerText = element.description;
      fragment.appendChild(listElement);
    });

    document.getElementById('events').innerHTML = '';
    document.getElementById('events').appendChild(fragment);
  }
};

// App starts
controller.getEvents().then(data => {
  state.events = data;
  view.render(state);
});

view.init();