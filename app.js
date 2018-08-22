// Model
let state = [];

const ENDPOINT = 'https://gatecrashers.herokuapp.com';

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
    return state.find(event => {
      return event.id === id;
    });
  },

  updateState: function updateState(event) {
    state.push(event);
    console.log(event, state);
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
        document.getElementById('selected-event').innerHTML = '';
        document.getElementById('selected-event').appendChild(fragment);

        // document.getElementById('selected-event').innerText = JSON.stringify(event);
      }
    });

    document.getElementById('new-event-btn').addEventListener('click', () => {
      document.getElementById('new-event-form').style.display = 'block';
    });

    document.getElementById('new-event-submit').addEventListener('click', () => {
      const descriptionVal = document.getElementById('description-input').value;

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

      document.getElementById('new-event-form').style.display = 'none';
    });

  },

  render: function render(state) {
    let fragment = document.createDocumentFragment();

    state.forEach((element) => {
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
// Initial Fetch

controller.getEvents().then(data => {
  state = data;
  view.render(state);
});

view.init();