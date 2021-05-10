const baseURL = 'http://localhost:8081';

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const getDoctors = async () => {
  try {
    const response = await fetch('http://localhost:8081/doctors',  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        data.forEach(doctor => {
          document.querySelector("#doctors-section").innerHTML += `
            <li>
              <a id=${doctor._id} onclick="handleDoctorSelect(event)"> ${doctor.name} </a>
            </li>
          `;
        });
    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const getDoctor = async (id) => {
  try {
    const response = await fetch(`http://localhost:8081/doctors/${id}`,  {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        document.querySelector("#doctor").innerHTML = `
        <h1>
          ${data.name}
        </h1>
        <h3>
          Seasons: ${data.seasons}
        </h3>
        <img src=${data.image_url} />
        `;
    } else {
        console.log('Bad request');
    };
  } catch(err) {
    console.log(err);
  }
}

const handleDoctorSelect = (ev) => {
  console.log("hi", ev.target);
  const id = ev.target.id;
  getDoctor(id);
  console.log(id);
}

getDoctors();


// invoke this function when the page loads:
initResetButton();
