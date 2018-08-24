const ENDPOINT = 'https://gatecrashers.herokuapp.com';

// Model
let state = {
  events: [],
  currentEvent: null,
  loading: true
};

// Controller (connecting Model to View)
let controller = {
  getEvents: function getEvents() {
    return new Promise((res, rej) => {
      fetch(`${ENDPOINT}/events`)
        .then(data => data.json())
        .then(data => {
          state.loading = false;
          res(data);
        })
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
  },

  deleteState: function deleteState(id) {
    let index = null;

    let event = state.events.find((e, i) => {
      index = i;
      return id === e.id;
    });

    if (event) state.events.splice(index, 1);

    view.render(state);
  },

  getLoadingState: function getLoadingState() {
    return state.loading;
  }
};

// View
let view = {
  init: function init() {
    view.render(state);

    document.getElementById('events').addEventListener('click', e => {
      if (e.target.classList.contains('event')) {
        let nodeList = document.getElementById('events').childNodes;

        nodeList.forEach(el => {
          el.classList.add('event');
        });

        e.target.classList.add('selected');

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

        // Modal - click on event
        // - Displays modal
        // - Displays selected-event element
        document.getElementsByClassName('modal')[0].classList.add('visible');
        document.getElementsByClassName('selected-event')[0].classList.add('displayed');
      }
    });

    // Modal - new-event-btn
    // - Displays modal
    // - Displays new-event-form element
    document.getElementById('new-event-btn').addEventListener('click', () => {
      document.getElementsByClassName('modal')[0].classList.add('visible');
      document.getElementsByClassName('new-event-form')[0].classList.add('displayed');

    });

    document.getElementById('delete-event-btn').addEventListener('click', e => {
      let currentEvent = controller.getEvent();

      fetch(`${ENDPOINT}/event/${currentEvent.id}/delete`)
        .then(data => data.json())
        .then(event => {
          controller.deleteState(currentEvent.id);
        })
        .catch(err => {
          console.log(err);
        });

      // Modal - delete-event-btn
      // - Hides modal
      // - Hides selected-event element
      document.getElementsByClassName('modal')[0].classList.remove('visible');
      document.getElementsByClassName('selected-event')[0].classList.remove('displayed');
    });



    document.getElementById('edit-event-btn').addEventListener('click', e => {
      let currentEvent = controller.getEvent();
      let stagingArea = document.getElementsByClassName('edit-event')[0];

      // Modal - edit-event-btn
      // - Hides selected-event element
      // - Displays edit-event element
      document.getElementsByClassName('selected-event')[0].classList.remove('displayed');
      document.getElementsByClassName('edit-event')[0].classList.add('displayed');

      let description = document.getElementById('description-input-edit');
      let host = document.getElementById('host-input-edit');
      let attendees = document.getElementById('attendees-input-edit');
      let duration = document.getElementById('duration-input-edit');
      let date = document.getElementById('date-input-edit');
      let location = document.getElementById('location-input-edit');

      description.value = currentEvent.description;
      host.value = currentEvent.host;
      attendees.value = currentEvent.attendees;
      duration.value = currentEvent.duration;
      date.value = currentEvent.date;
      location.value = currentEvent.location;

      let submitBtn = document.getElementById('edit-event-submit');

      submitBtn.addEventListener('click', e => {
        let body = {
          description: description.value,
          host: host.value,
          attendees: attendees.value,
          duration: duration.value,
          date: date.value,
          location: location.value
        };

        console.log(body);

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
      let description = document.getElementById('description-input').value;
      let host = document.getElementById('host-input').value;
      let duration = document.getElementById('duration-input').value;
      let date = document.getElementById('date-input').value;
      let location = document.getElementById('location-input').value;
      let attendees = document.getElementById('attendees-input').value;

      let body = {
        description,
        host,
        duration,
        date,
        location,
        attendees
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
    if (controller.getLoadingState()) {
      document.getElementsByClassName('loading')[0].classList.add('in-progress');
    } else {
      document.getElementsByClassName('loading')[0].classList.remove('in-progress');
    }

    let fragment = document.createDocumentFragment();

    state.events.forEach((element) => {
      let listElement = document.createElement('li');
      listElement.classList.add('event');
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