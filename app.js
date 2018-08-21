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
  }  
};

// View
let view = {
  render: function render() {
    let fragment = document.createDocumentFragment();

    state.forEach((element) => {
      let listElement = document.createElement('li');
      listElement.innerText = element.description;
      fragment.appendChild(listElement);
    });

    document.getElementById('events').appendChild(fragment);
  }
};

// App starts
// Initial Fetch
controller.getEvents().then(data => {
  state = data;
  view.render();
});